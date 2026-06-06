import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import type { IRestaurant } from "../types";
import { AppButton, AppCard } from "./ui/AppUI";
import { BiMapPin, BiPhone } from "react-icons/bi";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: IRestaurant;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Restaurant verified");
      onVerify();
    } catch {
      toast.error("failed ot verify restaurant");
    }
  };

  return (
    <AppCard className="overflow-hidden !p-0">
      <img
        src={restaurant.image}
        className="h-44 w-full object-cover"
        alt=""
      />
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{restaurant.name}</h3>
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <BiPhone className="text-[#E23744]" /> {restaurant.phone}
        </p>
        <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <BiMapPin className="mt-0.5 shrink-0 text-[#E23744]" />
          {restaurant.autoLocation?.formattedAddress}
        </p>
        <AppButton onClick={verify} className="!bg-emerald-600 hover:!bg-emerald-700">
          ✓ Verify restaurant
        </AppButton>
      </div>
    </AppCard>
  );
};

export default AdminRestaurantCard;
