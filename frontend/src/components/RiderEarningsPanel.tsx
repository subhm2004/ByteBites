import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BiCheckCircle, BiRupee, BiTrendingUp } from "react-icons/bi";
import { riderService } from "../main";
import { AppCard, LoadingScreen } from "./ui/AppUI";
import TripMapSnapshot from "./TripMapSnapshot";

type RiderTrip = {
  _id: string;
  restaurantName: string;
  riderAmount: number;
  distance: number;
  deliveredAt: string;
  deliveryAddress: string;
  pickup: { latitude: number; longitude: number } | null;
  dropoff: { latitude: number; longitude: number };
};

type RiderEarningsData = {
  summary: {
    todayEarnings: number;
    weekEarnings: number;
    totalEarnings: number;
    totalTrips: number;
  };
  daily: {
    label: string;
    date: string;
    earnings: number;
    trips: number;
  }[];
  trips: RiderTrip[];
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { trips: number } }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="text-sm font-bold text-[#E23744] dark:text-[#ff6b7a]">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-gray-500">{payload[0].payload.trips} trips</p>
    </div>
  );
};

const RiderEarningsPanel = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [data, setData] = useState<RiderEarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"earnings" | "history">("earnings");

  const fetchEarnings = useCallback(async () => {
    try {
      const { data: res } = await axios.get(
        `${riderService}/api/rider/earnings`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setData(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings, refreshKey]);

  if (loading) {
    return <LoadingScreen message="Loading earnings..." />;
  }

  if (!data) {
    return (
      <AppCard className="text-center text-sm text-gray-500">
        Could not load earnings data
      </AppCard>
    );
  }

  const { summary, daily, trips } = data;

  const statCards = [
    {
      label: "Today",
      value: `₹${summary.todayEarnings.toLocaleString("en-IN")}`,
      icon: BiRupee,
      accent: "text-[#E23744] dark:text-[#ff6b7a]",
    },
    {
      label: "This week",
      value: `₹${summary.weekEarnings.toLocaleString("en-IN")}`,
      icon: BiTrendingUp,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "All time",
      value: `₹${summary.totalEarnings.toLocaleString("en-IN")}`,
      icon: BiCheckCircle,
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total trips",
      value: String(summary.totalTrips),
      icon: BiCheckCircle,
      accent: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(["earnings", "history"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              tab === key
                ? "bg-white text-[#E23744] shadow-sm dark:bg-gray-900 dark:text-[#ff6b7a]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {key === "earnings" ? "💰 Earnings" : "🗺️ Trip history"}
          </button>
        ))}
      </div>

      {tab === "earnings" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <AppCard key={card.label} className="!p-4">
                <card.icon className={`mb-2 h-5 w-5 ${card.accent}`} />
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </AppCard>
            ))}
          </div>

          <AppCard>
            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
              Last 7 days
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="earnings" fill="#E23744" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AppCard>
        </>
      ) : trips.length === 0 ? (
        <AppCard className="py-10 text-center">
          <p className="text-3xl">🛵</p>
          <p className="mt-2 font-semibold text-gray-900 dark:text-white">
            No trips yet
          </p>
          <p className="text-sm text-gray-500">
            Completed deliveries will show up here with route maps
          </p>
        </AppCard>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <AppCard key={trip._id} className="!p-0 overflow-hidden">
              <TripMapSnapshot pickup={trip.pickup} dropoff={trip.dropoff} />
              <div className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {trip.restaurantName}
                    </p>
                    <p className="line-clamp-1 text-xs text-gray-500">
                      {trip.deliveryAddress}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-black text-emerald-600 dark:text-emerald-400">
                    +₹{trip.riderAmount}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{trip.distance.toFixed(1)} km</span>
                  <span>
                    {new Date(trip.deliveredAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderEarningsPanel;
