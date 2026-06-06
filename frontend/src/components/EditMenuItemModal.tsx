import axios from "axios";
import { useState } from "react";
import { BiUpload, BiX } from "react-icons/bi";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import type { IMenuItem } from "../types";

type EditMenuItemModalProps = {
  item: IMenuItem;
  onClose: () => void;
  onUpdated: () => void;
};

const EditMenuItemModal = ({ item, onClose, onUpdated }: EditMenuItemModalProps) => {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(String(item.price));
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      toast.error("Name and price are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    formData.append("price", price);
    if (image) formData.append("file", image);

    try {
      setLoading(true);
      await axios.put(`${restaurantService}/api/item/${item._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item updated");
      onUpdated();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Edit menu item
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BiX size={22} />
          </button>
        </div>

        <img
          src={image ? URL.createObjectURL(image) : item.image}
          alt={item.name}
          className="h-32 w-full rounded-xl object-cover"
        />

        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <textarea
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <input
          type="number"
          placeholder="Price ₹"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-200">
          <BiUpload className="h-5 w-5 shrink-0 text-[#E23744]" />
          <span className="truncate">
            {image ? image.name : "Change image (optional)"}
          </span>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-[#E23744] py-3 text-sm font-semibold text-white hover:bg-[#c9303c] disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default EditMenuItemModal;
