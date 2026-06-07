import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/useAppData";
import { useSocket } from "../context/useSocket";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload, BiStar } from "react-icons/bi";
import type { IOrder, IRider } from "../types";
import { getErrorMessage } from "../utils/errors";
import audio from "../assets/faaah.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import RiderEarningsPanel from "../components/RiderEarningsPanel";
import {
  AppButton,
  AppCard,
  AppInput,
  LoadingScreen,
  RoleShell,
} from "../components/ui/AppUI";

interface IRiderProfile extends IRider {
  isVerified: boolean;
  isAvailble: boolean;
  avgRating?: number;
  reviewCount?: number;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [earningsRefreshKey, setEarningsRefreshKey] = useState(0);
  const [dashboardTab, setDashboardTab] = useState<"active" | "earnings">(
    "active"
  );
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound Enabled");
    } catch {
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: !profile?.isAvailble,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile?.isAvailble ? "You are offline" : "You are online"
        );
        fetchProfile();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to update availability"));
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();

      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message);
        fetchProfile();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to submit profile"));
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <RoleShell>
        <p className="py-20 text-center text-gray-500">
          You are not registered as a rider
        </p>
      </RoleShell>
    );
  }

  if (loading) {
    return (
      <RoleShell>
        <LoadingScreen message="Loading rider profile..." />
      </RoleShell>
    );
  }

  if (!profile) {
    return (
      <RoleShell>
        <div className="mx-auto max-w-lg">
          <div className="mb-6 text-center">
            <span className="text-4xl">🛵</span>
            <h1 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              Join as a rider
            </h1>
            <p className="text-sm text-gray-500">
              Complete your profile to start delivering
            </p>
          </div>

          <AppCard className="space-y-4">
            <AppInput
              type="number"
              placeholder="Aadhar number"
              value={aadharNumber}
              onChange={(e) => setaadharNumber(e.target.value)}
            />
            <AppInput
              type="number"
              placeholder="Contact number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <AppInput
              type="text"
              placeholder="Driving licence number"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 transition hover:border-[#E23744]/30 hover:bg-red-50/30 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-[#E23744]/40 dark:hover:bg-red-950/20">
              <BiUpload className="h-5 w-5 shrink-0 text-[#E23744]" />
              <span className="truncate">
                {image ? image.name : "Upload profile photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <AppButton disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit profile"}
            </AppButton>
          </AppCard>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl bg-[#E23744]/10 px-4 py-2 text-center text-sm font-semibold text-[#E23744]">
          🛵 Rider Dashboard
        </div>

        <div className="flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {(["active", "earnings"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setDashboardTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                dashboardTab === tab
                  ? "bg-white text-[#E23744] shadow-sm dark:bg-gray-900 dark:text-[#ff6b7a]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab === "active" ? "📦 Active" : "💰 Earnings"}
            </button>
          ))}
        </div>

        {dashboardTab === "earnings" ? (
          <RiderEarningsPanel refreshKey={earningsRefreshKey} />
        ) : (
          <>
        <AppCard className="text-center">
          <img
            src={profile.picture}
            className="mx-auto h-24 w-24 rounded-2xl object-cover ring-4 ring-gray-100"
            alt=""
          />
          <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500">{profile.phoneNumber}</p>

          {(profile.reviewCount ?? 0) > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <BiStar className="fill-amber-400 text-amber-400" />
              {profile.avgRating?.toFixed(1)} · {profile.reviewCount} ratings
            </div>
          )}

          <div className="mt-3 flex justify-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                profile.isVerified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {profile.isVerified ? "✓ Verified" : "⏳ Pending verification"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                profile.isAvailble
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {profile.isAvailble ? "🟢 Online" : "⚫ Offline"}
            </span>
          </div>

          <p className="mt-4 rounded-xl bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
            Stay within 500m of a restaurant. Orders go to the nearest online
            rider first — you get 10 seconds to accept before the next rider.
          </p>

          {profile.isVerified && !currentOrder && (
            <AppButton
              className="mt-4"
              variant={profile.isAvailble ? "secondary" : "primary"}
              onClick={toggleAvailiblity}
              disabled={toggling}
            >
              {toggling
                ? "Updating..."
                : profile.isAvailble
                ? "Go offline"
                : "Go online"}
            </AppButton>
          )}
        </AppCard>

        {!audioUnlocked && (
          <AppCard className="flex items-center justify-between gap-3 !py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Enable sound alerts
                </p>
                <p className="text-xs text-gray-500">Get notified for new orders</p>
              </div>
            </div>
            <AppButton onClick={unlockAudio} className="!w-auto shrink-0 px-4">
              Enable
            </AppButton>
          </AppCard>
        )}

        {profile.isAvailble && incomingOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Incoming orders
            </h3>
            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onDismiss={() => {
                  setIncomingOrders((prev) => prev.filter((oid) => oid !== id));
                }}
                onAccepted={() => {
                  setIncomingOrders((prev) => prev.filter((oid) => oid !== id));
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        )}

        {currentOrder && (
          <div className="space-y-4">
            <RiderCurrentOrder
              order={currentOrder}
              onStatusUpdate={() => {
                fetchCurrentOrder();
                setEarningsRefreshKey((k) => k + 1);
              }}
            />
            <AppCard className="!p-0 overflow-hidden">
              <RiderOrderMap order={currentOrder} />
            </AppCard>
          </div>
        )}
          </>
        )}
      </div>
    </RoleShell>
  );
};

export default RiderDashboard;
