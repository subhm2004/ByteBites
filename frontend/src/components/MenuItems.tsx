import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiPencil, BiTrash } from "react-icons/bi";
import EditMenuItemModal from "./EditMenuItemModal";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/useAppData";
import { getErrorMessage } from "../utils/errors";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const { fetchCart } = useAppData();

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      fetchCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update cart"));
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No menu items yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {editingItem && (
        <EditMenuItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={onItemDeleted}
        />
      )}
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            className={`flex gap-4 rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800/50 ${
              !item.isAvailable ? "opacity-70" : ""
            }`}
            key={item._id}
          >
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt=""
                className={`h-24 w-24 rounded-xl object-cover ${
                  !item.isAvailable ? "grayscale" : ""
                }`}
              />
              {!item.isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-[10px] font-bold uppercase text-white">
                  Unavailable
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                {item.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-black text-[#E23744]">₹{item.price}</p>

                {isSeller && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      title="Edit item"
                    >
                      <BiPencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAvailiblity(item._id)}
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      {item.isAvailable ? (
                        <BsEye size={18} />
                      ) : (
                        <FiEyeOff size={18} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>
                )}

                {!isSeller && (
                  <button
                    type="button"
                    disabled={!item.isAvailable || isLoading}
                    onClick={() => addToCart(item.restaurantId, item._id)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      !item.isAvailable || isLoading
                        ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        : "bg-[#E23744] text-white hover:bg-[#c9303c] shadow-sm shadow-[#E23744]/25"
                    }`}
                  >
                    {isLoading ? (
                      <VscLoading size={16} className="animate-spin" />
                    ) : (
                      <BsCartPlus size={16} />
                    )}
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
