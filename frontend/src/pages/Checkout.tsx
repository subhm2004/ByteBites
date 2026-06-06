import { useEffect, useState } from "react";
import { useAppData } from "../context/useAppData";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { Link, useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader, BiMapPin } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";
import type { RazorpaySuccessResponse } from "../types/razorpay";
import {
  AppButton,
  AppCard,
  AppPage,
  EmptyState,
  PageHeader,
} from "../components/ui/AppUI";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
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

  if (!cart || cart.length === 0) {
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

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch {
      toast.error("Failed to create Order");
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
            <p className="py-4 text-center text-sm text-gray-500">
              Loading addresses...
            </p>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <BiMapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No address saved yet</p>
              <Link to="/address">
                <AppButton className="mt-4 w-auto px-6">Add address</AppButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((add) => (
                <label
                  key={add._id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    selectedAddressId === add._id
                      ? "border-[#E23744] bg-red-50/50 ring-1 ring-[#E23744]/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1 accent-[#E23744]"
                    checked={selectedAddressId === add._id}
                    onChange={() => setselectedAddressId(add._id)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {add.formattedAddress}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      📞 {add.mobile}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </AppCard>

        <AppCard className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Order summary</h3>

          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            return (
              <div
                className="flex justify-between text-sm text-gray-600"
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

          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal ({quauntity} items)</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>₹{platformFee}</span>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-lg font-black">
            <span>To pay</span>
            <span className="text-[#E23744]">₹{grandTotal}</span>
          </div>
        </AppCard>

        <AppCard className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Pay securely</h3>
          {!selectedAddressId && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Select a delivery address to enable payment
            </p>
          )}

          <AppButton
            disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
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
            disabled={!selectedAddressId || loadingStripe || creatingOrder}
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
