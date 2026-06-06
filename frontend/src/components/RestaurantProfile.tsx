import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave, BiStar, BiTime } from "react-icons/bi";
import { useAppData } from "../context/useAppData";
import { getErrorMessage } from "../utils/errors";
import { formatETARange, estimateETA } from "../utils/eta";
import { AppButton } from "./ui/AppUI";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
  distanceKm?: number;
}

const RestaurantProfile = ({
  restaurant,
  isSeller,
  onUpdate,
  distanceKm,
}: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: unknown) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("loggedOut successfully");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      {restaurant.image && (
        <div className="relative h-52 w-full">
          <img
            src={restaurant.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              isOpen
                ? "bg-emerald-500 text-white"
                : "bg-gray-900/80 text-white backdrop-blur-sm"
            }`}
          >
            {isOpen ? "Open now" : "Closed"}
          </span>
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg font-bold text-gray-900 outline-none focus:border-[#E23744]/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            ) : (
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{restaurant.name}</h2>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <BiStar className="fill-amber-400 text-amber-400" />
                {(restaurant.reviewCount ?? 0) > 0
                  ? `${restaurant.avgRating?.toFixed(1)} · ${restaurant.reviewCount} ratings`
                  : "New · no ratings yet"}
              </span>
              {distanceKm != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                  <BiTime />
                  {formatETARange(estimateETA(distanceKm))}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E23744]" />
              <span>
                {restaurant.autoLocation.formattedAddress ||
                  "Location unavailable"}
              </span>
            </div>
          </div>

          {isSeller && (
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <BiEdit size={18} />
            </button>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#E23744]/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows={3}
          />
        ) : (
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {restaurant.description || "No description added yet"}
          </p>
        )}

        {isSeller && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            {editMode && (
              <AppButton
                onClick={saveChanges}
                disabled={loading}
                className="!w-auto px-5"
              >
                <BiSave size={16} /> Save changes
              </AppButton>
            )}

            <AppButton
              variant={isOpen ? "danger" : "primary"}
              onClick={toggleOpenStatus}
              className="!w-auto px-5"
            >
              {isOpen ? "Close restaurant" : "Open restaurant"}
            </AppButton>

            <AppButton variant="secondary" onClick={logoutHandler} className="!w-auto px-5">
              Logout
            </AppButton>
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Listed since {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
