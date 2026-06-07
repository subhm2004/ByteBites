import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../context/useAppData";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { Link, useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader, BiMapPin, BiTag, BiTime } from "react-icons/bi";
import { getDistanceKm, formatETAShort, estimateETA } from "../utils/eta";
import {
  calculateOrderPricing,
  MIN_ORDER_AMOUNT,
} from "../utils/orderPricing";
import { loadStripe } from "@stripe/stripe-js";
import type { RazorpaySuccessResponse } from "../types/razorpay";
import {
  AppButton,
  AppCard,
  AppInput,
  AppPage,
  EmptyState,
  PageHeader,
} from "../components/ui/AppUI";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
  location?: {
    coordinates: [number, number];
  };
}

interface AppliedCoupon {
  couponCode: string;
  discountAmount: number;
  description: string;
}

const Checkout = () => {
  const { cart, subTotal, quauntity } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setselectedAddressId] = useState<string | null>(
    null
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  const navigate = useNavigate();

  const restaurant = (cart?.[0]?.restaurantId as IRestaurant | undefined) ?? null;

  const deliveryDistanceKm = useMemo(() => {
    if (!selectedAddressId || !restaurant?.autoLocation?.coordinates) return undefined;

    const selected = addresses.find((a) => a._id === selectedAddressId);
    const coords = selected?.location?.coordinates;
    if (!coords) return undefined;

    const [delLng, delLat] = coords;
    const [resLng, resLat] = restaurant.autoLocation.coordinates;
    return getDistanceKm(delLat, delLng, resLat, resLng);
  }, [selectedAddressId, addresses, restaurant]);

  const deliveryEta = useMemo(() => {
    if (deliveryDistanceKm == null) return null;
    return estimateETA(deliveryDistanceKm);
  }, [deliveryDistanceKm]);

  if (!cart || cart.length === 0 || !restaurant) {
    return (
      <AppPage narrow>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          action={
            <AppButton onClick={() => navigate("/explore")} className="w-auto px-8">
              Browse restaurants
            </AppButton>
          }
        />
      </AppPage>
    );
  }

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const pricing = calculateOrderPricing({
    subtotal: subTotal,
    distanceKm: deliveryDistanceKm,
    discountAmount,
  });

  const applyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/coupon/validate`,
        {
          code: couponInput.trim(),
          subtotal: subTotal,
          distanceKm: deliveryDistanceKm,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAppliedCoupon({
        couponCode: data.couponCode,
        discountAmount: data.discountAmount,
        description: data.description,
      });
      toast.success(data.description || "Coupon applied!");
    } catch (error) {
      setAppliedCoupon(null);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(String(error.response.data.message));
      } else {
        toast.error("Invalid coupon");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
          couponCode: appliedCoupon?.couponCode || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(String(error.response.data.message));
      } else {
        toast.error("Failed to create Order");
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "ByteBites",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successfull 🎉");
            navigate(
              `/paymentsuccess/${response.razorpay_payment_id}?orderId=${orderId}`
            );
          } catch {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#E23744",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;

      try {
        await stripePromise;

        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          { orderId }
        );

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("failed to create payment session");
        }
      } catch {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <AppPage narrow>
      <PageHeader
        eyebrow="Checkout"
        title="Almost there!"
        subtitle={`Ordering from ${restaurant.name}`}
      />

      <div className="space-y-5">
        {deliveryEta && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/40">
            <BiTime className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Estimated delivery {formatETAShort(deliveryEta)}
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                Based on distance + prep time ({deliveryEta.min}–{deliveryEta.max} min range)
              </p>
            </div>
          </div>
        )}

        <AppCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">Delivery address</h3>
            <Link
              to="/address"
              className="text-sm font-semibold text-[#E23744] hover:underline"
            >
              + Add new
            </Link>
          </div>

          {loadingAddress ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading addresses...
            </p>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
              <BiMapPin className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No address saved yet
              </p>
              <Link to="/address">
                <AppButton className="mt-4 w-auto px-6">Add address</AppButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((add) => {
                const selected = selectedAddressId === add._id;
                return (
                  <label
                    key={add._id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-[#E23744] bg-red-50/60 ring-1 ring-[#E23744]/20 dark:border-[#E23744]/70 dark:bg-red-950/25 dark:ring-[#E23744]/30"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-1 accent-[#E23744]"
                      checked={selected}
                      onChange={() => setselectedAddressId(add._id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                        {add.formattedAddress}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <BiMapPin className="h-3.5 w-3.5 shrink-0 text-[#E23744] dark:text-[#ff6b7a]" />
                        {add.mobile}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </AppCard>

        <AppCard className="space-y-3">
          <div className="flex items-center gap-2">
            <BiTag className="h-5 w-5 text-[#E23744]" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              Apply coupon
            </h3>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {appliedCoupon.couponCode}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/80">
                  {appliedCoupon.description}
                </p>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <AppInput
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="!py-2.5"
              />
              <AppButton
                variant="secondary"
                className="!w-auto shrink-0 px-5"
                disabled={validatingCoupon}
                onClick={applyCoupon}
              >
                {validatingCoupon ? (
                  <BiLoader className="animate-spin" />
                ) : (
                  "Apply"
                )}
              </AppButton>
            </div>
          )}
        </AppCard>

        <AppCard className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Order summary</h3>

          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            return (
              <div
                className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                key={cartItem._id}
              >
                <span>
                  {item.name} × {cartItem.quauntity}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{item.price * cartItem.quauntity}
                </span>
              </div>
            );
          })}

          <hr className="border-gray-100 dark:border-gray-800" />

          <div className="space-y-2.5 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/60">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal ({quauntity} items)</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{subTotal}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>
                Delivery
                {deliveryDistanceKm != null && (
                  <span className="ml-1 text-[11px] text-gray-400">
                    ({deliveryDistanceKm.toFixed(1)} km)
                  </span>
                )}
              </span>
              <span
                className={
                  pricing.isFreeDelivery
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "font-medium text-gray-900 dark:text-gray-100"
                }
              >
                {pricing.isFreeDelivery ? "Free" : `₹${pricing.deliveryFee}`}
              </span>
            </div>
            {pricing.smallOrderFee > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Small order fee</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ₹{pricing.smallOrderFee}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Platform fee</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{pricing.platformFee}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                <span>Coupon discount</span>
                <span>−₹{discountAmount}</span>
              </div>
            )}
          </div>

          {!pricing.meetsMinimumOrder && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              Minimum order is ₹{MIN_ORDER_AMOUNT}. Add ₹{pricing.amountToMinimum}{" "}
              more to continue.
            </p>
          )}

          {pricing.meetsMinimumOrder && pricing.amountToFreeDelivery > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Add ₹{pricing.amountToFreeDelivery} more for free delivery 🎉
            </p>
          )}

          <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-black dark:border-gray-800">
            <span className="text-gray-900 dark:text-white">To pay</span>
            <span className="text-[#E23744]">₹{pricing.grandTotal}</span>
          </div>
        </AppCard>

        <AppCard className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Pay securely</h3>
          {!selectedAddressId && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Select a delivery address to enable payment
            </p>
          )}
          {!pricing.meetsMinimumOrder && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
              Cart total must be at least ₹{MIN_ORDER_AMOUNT} to place an order
            </p>
          )}

          <AppButton
            disabled={
              !selectedAddressId ||
              !pricing.meetsMinimumOrder ||
              loadingRazorpay ||
              creatingOrder
            }
            onClick={payWithRazorpay}
            className="!bg-[#E23744]"
          >
            {loadingRazorpay ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (
              <BiCreditCard size={18} />
            )}
            Pay with Razorpay · UPI / Cards
          </AppButton>

          <AppButton
            variant="dark"
            disabled={
              !selectedAddressId ||
              !pricing.meetsMinimumOrder ||
              loadingStripe ||
              creatingOrder
            }
            onClick={payWithStripe}
          >
            {loadingStripe ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (
              <BiCreditCard size={18} />
            )}
            Pay with Stripe · International
          </AppButton>
        </AppCard>
      </div>
    </AppPage>
  );
};

export default Checkout;
