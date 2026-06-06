import toast from "react-hot-toast";
import { adminService } from "../main";
import axios from "axios";
import type { IRider } from "../types";
import { AppButton, AppCard } from "./ui/AppUI";

const RiderAdmin = ({
  rider,
  onVerify,
}: {
  rider: IRider;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Rider verified");
      onVerify();
    } catch {
      toast.error("failed ot verify rider");
    }
  };

  return (
    <AppCard className="overflow-hidden !p-0">
      <img
        src={rider.picture}
        className="h-44 w-full object-cover"
        alt=""
      />
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rider.phoneNumber}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Aadhar: {rider.aadharNumber}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          DL: {rider.drivingLicenseNumber}
        </p>
        <AppButton onClick={verify} className="mt-2 !bg-emerald-600 hover:!bg-emerald-700">
          ✓ Verify rider
        </AppButton>
      </div>
    </AppCard>
  );
};

export default RiderAdmin;
