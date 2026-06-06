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

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platfromFee = 7;
  const grandTotal = subTotal + deliveryFee + platfromFee;

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
                <p className="text-sm text-gray-500">₹{item.price} each</p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition hover:bg-gray-100 disabled:opacity-50"
                    disabled={isLoading}
                    onClick={() => decreaseQty(item._id)}
                  >
                    {isLoading ? (
                      <VscLoading size={14} className="animate-spin" />
                    ) : (
                      <BiMinus size={14} />
                    )}
                  </button>
                  <span className="min-w-[1.5rem] text-center font-bold">
                    {cartItem.quauntity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E23744]/30 bg-red-50 text-[#E23744] transition hover:bg-red-100 disabled:opacity-50"
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

        <AppCard className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Bill details</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items ({quauntity})</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery fee</span>
              <span className={deliveryFee === 0 ? "font-medium text-emerald-600" : ""}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform fee</span>
              <span>₹{platfromFee}</span>
            </div>
          </div>

          {subTotal < 250 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Add ₹{250 - subTotal} more for free delivery 🎉
            </p>
          )}

          <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-lg font-black">
            <span>Total</span>
            <span className="text-[#E23744]">₹{grandTotal}</span>
          </div>

          <AppButton
            onClick={() => navigate("/checkout")}
            disabled={!restaurant.isOpen}
            className="mt-2"
          >
            {!restaurant.isOpen ? "Restaurant is closed" : "Proceed to checkout"}
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
