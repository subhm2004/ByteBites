import TryCatch from "../middlewares/trycatch.js";
import {
  getOrderCollection,
  getRestaurantCollection,
  getRiderCollection,
  getUserCollection,
} from "../util/collection.js";

type PaidOrder = {
  subtotal?: number;
  totalAmount?: number;
  deliveryFee?: number;
  platfromFee?: number;
  status?: string;
  createdAt?: Date;
  restaurantId?: string;
  restaurantName?: string;
  items?: { itemId?: string; name: string; price: number; quauntity: number }[];
};

export const getPlatformAnalytics = TryCatch(async (_req, res) => {
  const [ordersCol, usersCol, restaurantsCol, ridersCol] = await Promise.all([
    getOrderCollection(),
    getUserCollection(),
    getRestaurantCollection(),
    getRiderCollection(),
  ]);

  const orders = (await ordersCol
    .find({ paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .toArray()) as PaidOrder[];

  const now = new Date();
  const daily: {
    label: string;
    date: string;
    gmv: number;
    orders: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      if (!order.createdAt) return false;
      const created = new Date(order.createdAt);
      return created >= dayStart && created < dayEnd;
    });

    daily.push({
      label: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
      date: dayStart.toISOString().slice(0, 10),
      gmv: dayOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0),
      orders: dayOrders.length,
    });
  }

  const gmv = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  const totalCollected = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const platformFees = orders.reduce(
    (sum, order) =>
      sum + (order.deliveryFee || 0) + (order.platfromFee || 0),
    0
  );
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const restaurantTotals = new Map<
    string,
    { name: string; revenue: number; orders: number }
  >();

  for (const order of orders) {
    const id = String(order.restaurantId || "unknown");
    const existing = restaurantTotals.get(id) || {
      name: order.restaurantName || "Unknown restaurant",
      revenue: 0,
      orders: 0,
    };
    existing.revenue += order.subtotal || 0;
    existing.orders += 1;
    restaurantTotals.set(id, existing);
  }

  const topRestaurants = [...restaurantTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const itemTotals = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items || []) {
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

  const [
    totalUsers,
    totalRestaurants,
    verifiedRestaurants,
    pendingRestaurants,
    totalRiders,
    verifiedRiders,
    pendingRiders,
    bannedUsers,
  ] = await Promise.all([
    usersCol.countDocuments({}),
    restaurantsCol.countDocuments({}),
    restaurantsCol.countDocuments({ isVerified: true }),
    restaurantsCol.countDocuments({ isVerified: false }),
    ridersCol.countDocuments({}),
    ridersCol.countDocuments({ isVerified: true }),
    ridersCol.countDocuments({ isVerified: false }),
    usersCol.countDocuments({ isBanned: true }),
  ]);

  res.json({
    summary: {
      gmv,
      totalCollected,
      platformFees,
      totalOrders: orders.length,
      deliveredOrders,
      averageOrderValue: orders.length ? Math.round(gmv / orders.length) : 0,
    },
    platform: {
      totalUsers,
      bannedUsers,
      totalRestaurants,
      verifiedRestaurants,
      pendingRestaurants,
      totalRiders,
      verifiedRiders,
      pendingRiders,
    },
    daily,
    topRestaurants,
    topItems,
    statusBreakdown: {
      delivered: deliveredOrders,
      active: orders.filter(
        (order) => !["delivered", "cancelled"].includes(order.status || "")
      ).length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    },
  });
});
