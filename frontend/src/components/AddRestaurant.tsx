import { useState } from "react";
import { useAppData } from "../context/useAppData";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";
import { getErrorMessage } from "../utils/errors";
import { AppButton, AppCard, AppInput } from "./ui/AppUI";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All field are required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Added successfully");
      fetchMyRestaurant();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add restaurant"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <span className="text-4xl">🍽️</span>
        <h1 className="mt-2 text-2xl font-black text-gray-900">
          Register your restaurant
        </h1>
        <p className="text-sm text-gray-500">
          Join ByteBites and start receiving orders
        </p>
      </div>

      <AppCard className="space-y-4">
        <AppInput
          type="text"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AppInput
          type="number"
          placeholder="Contact number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          placeholder="Tell customers about your restaurant..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E23744]/40 focus:ring-2 focus:ring-[#E23744]/10"
          rows={3}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 transition hover:border-[#E23744]/30 hover:bg-red-50/30">
          <BiUpload className="h-5 w-5 text-[#E23744]" />
          {image ? image.name : "Upload restaurant cover photo"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
          <BiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#E23744]" />
          <div className="text-sm text-gray-600">
            {loadingLocation
              ? "Fetching your location..."
              : location?.formattedAddress || "Location not available"}
          </div>
        </div>

        <AppButton disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Register restaurant"}
        </AppButton>
      </AppCard>
    </div>
  );
};

export default AddRestaurant;
