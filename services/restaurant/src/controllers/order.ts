import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItems.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import { publishEvent } from "../config/order.publisher.js";
import { couponEngine } from "../coupon/CouponEngine.js";
import { CouponError } from "../coupon/errors/CouponError.js";
import {
  calculateOrderPricing,
  MIN_ORDER_AMOUNT,
} from "../pricing/orderPricing.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { paymentMethod, addressId, couponCode } = req.body;

  if (!addressId) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    userId: user._id,
  });

  if (!address) {
    return res.status(404).json({
      message: "Address Not found",
    });
  }

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({ userId: user._id })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ restaurantId: IRestaurant }>("restaurantId");

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const firstCartItem = cartItems[0];

  if (!firstCartItem || !firstCartItem.restaurantId) {
    return res.status(400).json({
      message: "Invailid Cart Data",
    });
  }

  const restaurantId = firstCartItem.restaurantId._id;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      message: "No restaurant with this id",
    });
  }

  if (!restaurant.isOpen) {
    return res.status(404).json({
      message: "Sorry this restaurant is closed for now",
    });
  }

  const distance = getDistanceKm(
    address.location.coordinates[1],
    address.location.coordinates[0],
    restaurant.autoLocation.coordinates[1],
    restaurant.autoLocation.coordinates[0]
  );

  let subtotal = 0;

  const orderItems = cartItems.map((cart) => {
    const item = cart.itemId;

    if (!item) {
      throw new Error("Invalid cart item");
    }

    const itemTotal = item.price * cart.quauntity;

    subtotal += itemTotal;

    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quauntity: cart.quauntity,
    };
  });

  if (subtotal < MIN_ORDER_AMOUNT) {
    return res.status(400).json({
      message: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Add more items to continue.`,
    });
  }

  let discountAmount = 0;
  let appliedCouponCode: string | null = null;
  let appliedCouponId: string | null = null;

  if (couponCode) {
    try {
      const discount = await couponEngine.apply(String(couponCode), {
        subtotal,
        userId: user._id.toString(),
      });
      discountAmount = discount.discountAmount;
      appliedCouponCode = discount.couponCode;
      appliedCouponId = discount.couponId;
    } catch (error) {
      if (error instanceof CouponError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      throw error;
    }
  }

  const pricing = calculateOrderPricing({
    subtotal,
    distanceKm: distance,
    discountAmount,
  });

  const deliveryFee = pricing.deliveryFee;
  const platfromFee = pricing.platformFee + pricing.smallOrderFee;
  const totalAmount = pricing.grandTotal;

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [longitude, latitude] = address.location.coordinates;

  const riderAmount = Math.ceil(distance) * 17;

  const order = await Order.create({
    userId: user._id.toString(),
    restaurantId: restaurantId.toString(),
    restaurantName: restaurant.name,
    riderId: null,
    distance,
    riderAmount,
    items: orderItems,
    subtotal,
    deliveryFee,
    platfromFee,
    discountAmount,
    couponCode: appliedCouponCode,
    couponId: appliedCouponId,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      fromattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },

    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  });

  await Cart.deleteMany({ userId: user._id });

  res.json({
    message: "Order created successfully",
    orderId: order._id.toString(),
    amount: totalAmount,
  });
});

export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});

export const fetchRestaurantOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { restaurantId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant id is required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      restaurantId,
      paymentStatus: "paid",
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

export const getRestaurantSalesAnalytics = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { restaurantId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant id is required" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.ownerId !== user._id.toString()) {
      return res.status(403).json({ message: "Not your restaurant" });
    }

    const orders = await Order.find({
      restaurantId,
      paymentStatus: "paid",
    }).sort({ createdAt: -1 });

    const now = new Date();
    const daily: {
      label: string;
      date: string;
      revenue: number;
      orders: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        const created = new Date(order.createdAt);
        return created >= dayStart && created < dayEnd;
      });

      daily.push({
        label: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
        date: dayStart.toISOString().slice(0, 10),
        revenue: dayOrders.reduce((sum, order) => sum + order.subtotal, 0),
        orders: dayOrders.length,
      });
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const itemTotals = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.itemId || item.name;
        const existing = itemTotals.get(key) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quauntity;
        existing.revenue += item.price * item.quauntity;
        itemTotals.set(key, existing);
      }
    }

    const topItems = [...itemTotals.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        deliveredOrders,
        averageOrderValue: orders.length
          ? Math.round(totalRevenue / orders.length)
          : 0,
      },
      daily,
      topItems,
      statusBreakdown: {
        delivered: deliveredOrders,
        active: orders.filter(
          (order) => !["delivered", "cancelled"].includes(order.status)
        ).length,
        cancelled: orders.filter((order) => order.status === "cancelled")
          .length,
      },
    });
  }
);

const SELLER_STATUS_TRANSITIONS: Record<string, string[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready_for_rider", "cancelled"],
  ready_for_rider: ["ready_for_rider"],
};

const CUSTOMER_CANCELLABLE_STATUSES = ["placed", "accepted"];

const emitOrderUpdate = async (
  order: { _id: unknown; userId: string; restaurantId: string },
  status: string
) => {
  const payload = { orderId: order._id, status };
  const headers = { "x-internal-key": process.env.INTERNAL_SERVICE_KEY! };

  await Promise.all([
    axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      { event: "order:update", room: `user:${order.userId}`, payload },
      { headers }
    ),
    axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `restaurant:${order.restaurantId}`,
        payload,
      },
      { headers }
    ),
  ]);
};

export const cancelOrderByCustomer = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== user._id.toString()) {
      return res.status(403).json({ message: "You cannot cancel this order" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        message:
          "Order can only be cancelled before the restaurant starts preparing your food",
      });
    }

    order.status = "cancelled";
    await order.save();

    await emitOrderUpdate(order, "cancelled");

    res.json({
      message:
        "Order cancelled. Refund will be processed within 5–7 business days.",
      order,
    });
  }
);

export const reorderFromOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== user._id.toString()) {
      return res.status(403).json({ message: "You cannot reorder this order" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Invalid order" });
    }

    if (!["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: "Reorder is available only for completed orders",
      });
    }

    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant no longer available" });
    }

    if (!restaurant.isOpen) {
      return res.status(400).json({
        message: "Restaurant is currently closed. Try again later.",
      });
    }

    const unavailable: string[] = [];
    const validItems: { itemId: string; quantity: number }[] = [];

    for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.itemId);

      if (!menuItem || !menuItem.isAvailable) {
        unavailable.push(item.name);
        continue;
      }

      validItems.push({ itemId: item.itemId, quantity: item.quauntity });
    }

    if (validItems.length === 0) {
      return res.status(400).json({
        message: "None of the items from this order are available anymore",
        unavailable,
      });
    }

    await Cart.deleteMany({ userId: user._id });

    for (const { itemId, quantity } of validItems) {
      await Cart.findOneAndUpdate(
        { userId: user._id, restaurantId: order.restaurantId, itemId },
        {
          $set: {
            userId: user._id,
            restaurantId: order.restaurantId,
            itemId,
            quauntity: quantity,
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      message:
        unavailable.length > 0
          ? `Added ${validItems.length} item(s). Unavailable: ${unavailable.join(", ")}`
          : "Items added to your cart",
      unavailable,
      restaurantId: order.restaurantId,
      itemCount: validItems.length,
    });
  }
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const allowedNext = SELLER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status transition",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }

    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    if (restaurant.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to update this order",
      });
    }

    order.status = status;

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `restaurant:${order.restaurantId}`,
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    if (status === "ready_for_rider") {
      console.log(
        "Publishing Order ready for rider event for order",
        order._id
      );

      await publishEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        restaurantId: restaurant._id.toString(),
        location: restaurant.autoLocation,
      });

      console.log("Event Published successfully");
    }

    res.json({
      message:
        status === "cancelled"
          ? "Order cancelled successfully"
          : "order status updated successfully",
      order,
    });
  }
);

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });

  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json(order);
  }
);

export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderName, riderPhone } = req.body;

  if (!orderId || !riderId) {
    return res.status(400).json({ message: "orderId and riderId are required" });
  }

  const orderAvailable = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  });

  if (orderAvailable) {
    return res.status(400).json({
      message: "You already have an order",
    });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null, status: "ready_for_rider" },
    {
      riderId,
      riderName,
      riderPhone,
      status: "rider_assigned",
    },
    { new: true }
  );

  if (!orderUpdated) {
    return res.status(409).json({
      message: "Order already taken or not ready for rider",
      success: false,
    });
  }

  const headers = { "x-internal-key": process.env.INTERNAL_SERVICE_KEY! };

  await Promise.all([
    axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${orderUpdated.userId}`,
        payload: orderUpdated,
      },
      { headers }
    ),
    axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${orderUpdated.restaurantId}`,
        payload: orderUpdated,
      },
      { headers }
    ),
    axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${orderUpdated.userId}`,
        payload: { orderId: orderUpdated._id, status: orderUpdated.status },
      },
      { headers }
    ),
  ]);

  res.json({
    message: "Rider Assigned Successfully",
    success: true,
    order: orderUpdated,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { riderId } = req.query;

  if (!riderId || typeof riderId !== "string") {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const order = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  }).populate("restaurantId");

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json(order);
});

export const updateOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.status === "rider_assigned") {
    order.status = "picked_up";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  if (order.status === "picked_up") {
    order.status = "delivered";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  return res.status(400).json({
    message: "Invalid order status for rider update",
  });
});

export const getOrderDispatchStatus = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { orderId } = req.params;
  const order = await Order.findById(orderId).select("status riderId");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({
    status: order.status,
    riderId: order.riderId,
    assigned: order.riderId !== null,
  });
});

export const getRiderEarningsAnalytics = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { riderId } = req.query;

  if (!riderId || typeof riderId !== "string") {
    return res.status(400).json({ message: "Rider id is required" });
  }

  const orders = await Order.find({
    riderId,
    status: "delivered",
  }).sort({ updatedAt: -1 });

  const restaurantIds = [...new Set(orders.map((o) => o.restaurantId))];
  const restaurants = await Restaurant.find({
    _id: { $in: restaurantIds },
  }).select("name autoLocation");

  const restaurantById = new Map(
    restaurants.map((r) => [r._id.toString(), r])
  );

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  let todayEarnings = 0;
  let weekEarnings = 0;
  let totalEarnings = 0;

  for (const order of orders) {
    totalEarnings += order.riderAmount;
    const deliveredAt = new Date(order.updatedAt);
    if (deliveredAt >= todayStart) todayEarnings += order.riderAmount;
    if (deliveredAt >= weekStart) weekEarnings += order.riderAmount;
  }

  const daily: {
    label: string;
    date: string;
    earnings: number;
    trips: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      const deliveredAt = new Date(order.updatedAt);
      return deliveredAt >= start && deliveredAt < end;
    });

    daily.push({
      label: start.toLocaleDateString("en-IN", { weekday: "short" }),
      date: start.toISOString().slice(0, 10),
      earnings: dayOrders.reduce((sum, order) => sum + order.riderAmount, 0),
      trips: dayOrders.length,
    });
  }

  const trips = orders.slice(0, 30).map((order) => {
    const restaurant = restaurantById.get(order.restaurantId);
    const coords = restaurant?.autoLocation?.coordinates;

    return {
      _id: order._id,
      restaurantName: order.restaurantName,
      riderAmount: order.riderAmount,
      distance: order.distance,
      deliveredAt: order.updatedAt,
      deliveryAddress: order.deliveryAddress.fromattedAddress,
      pickup:
        coords && coords.length === 2
          ? { latitude: coords[1], longitude: coords[0] }
          : null,
      dropoff: {
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
      },
    };
  });

  res.json({
    summary: {
      todayEarnings,
      weekEarnings,
      totalEarnings,
      totalTrips: orders.length,
    },
    daily,
    trips,
  });
});
