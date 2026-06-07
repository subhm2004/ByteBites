import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import {
  AppButton,
  AppCard,
  AppPage,
  EmptyState,
  PageHeader,
} from "../components/ui/AppUI";
import {
  calculateOrderPricing,
  MIN_ORDER_AMOUNT,
} from "../utils/orderPricing";

const Cart = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <AppPage narrow>
        <PageHeader title="Your Cart" subtitle="Items you add will appear here" />
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Browse restaurants and add your favourite dishes"
          action={
            <AppButton onClick={() => navigate("/explore")} className="w-auto px-8">
              Explore restaurants
            </AppButton>
          }
        />
      </AppPage>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const pricing = calculateOrderPricing({ subtotal: subTotal });

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear you cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchCart();
    } catch {
      toast.error("something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <AppPage narrow>
      <PageHeader
        eyebrow="Cart"
        title={restaurant.name}
        subtitle={restaurant.autoLocation.formattedAddress}
      />

      <div className="space-y-4">
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          const isLoading = loadingItemId === item._id;

          return (
            <AppCard key={item._id} className="flex items-center gap-4 !p-4">
              <img
                src={item.image}
                alt=""
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price} each</p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    disabled={isLoading}
                    onClick={() => decreaseQty(item._id)}
                  >
                    {isLoading ? (
                      <VscLoading size={14} className="animate-spin" />
                    ) : (
                      <BiMinus size={14} />
                    )}
                  </button>
                  <span className="min-w-[1.5rem] text-center font-bold text-gray-900 dark:text-white">
                    {cartItem.quauntity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E23744]/30 bg-red-50 text-[#E23744] transition hover:bg-red-100 disabled:opacity-50 dark:border-[#E23744]/40 dark:bg-red-950/40 dark:hover:bg-red-950/60"
                    disabled={isLoading}
                    onClick={() => increaseQty(item._id)}
                  >
                    <BiPlus size={14} />
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-right font-bold text-gray-900 dark:text-white">
                ₹{item.price * cartItem.quauntity}
              </p>
            </AppCard>
          );
        })}

        <AppCard className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Bill details</h3>

          <div className="space-y-2.5 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/60">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Items ({quauntity})</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{subTotal}
              </span>
            </div>
            {pricing.meetsMinimumOrder && (
              <>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery fee</span>
                  <span
                    className={
                      pricing.isFreeDelivery
                        ? "font-semibold text-emerald-600 dark:text-emerald-400"
                        : "font-medium text-gray-900 dark:text-gray-100"
                    }
                  >
                    {pricing.isFreeDelivery ? "FREE" : `₹${pricing.deliveryFee}`}
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
              </>
            )}
          </div>

          {!pricing.meetsMinimumOrder && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              Minimum order is ₹{MIN_ORDER_AMOUNT}. Add ₹{pricing.amountToMinimum}{" "}
              more to place your order.
            </p>
          )}

          {pricing.meetsMinimumOrder && pricing.amountToFreeDelivery > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Add ₹{pricing.amountToFreeDelivery} more for free delivery 🎉
            </p>
          )}

          {pricing.meetsMinimumOrder && (
            <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
              Final delivery fee is calculated at checkout based on your address
              distance.
            </p>
          )}

          <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-black dark:border-gray-800">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-[#E23744]">
              ₹{pricing.meetsMinimumOrder ? pricing.grandTotal : subTotal}
            </span>
          </div>

          <AppButton
            onClick={() => navigate("/checkout")}
            disabled={!restaurant.isOpen || !pricing.meetsMinimumOrder}
            className="mt-2"
          >
            {!restaurant.isOpen
              ? "Restaurant is closed"
              : !pricing.meetsMinimumOrder
                ? `Minimum order ₹${MIN_ORDER_AMOUNT}`
                : "Proceed to checkout"}
          </AppButton>

          <AppButton
            variant="secondary"
            onClick={clearCart}
            disabled={clearingCart}
          >
            Clear cart <TbTrash size={16} />
          </AppButton>
        </AppCard>
      </div>
    </AppPage>
  );
};

export default Cart;
