import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BiCheckCircle,
  BiPackage,
  BiRupee,
  BiStore,
  BiTrendingUp,
  BiUser,
} from "react-icons/bi";
import { MdDeliveryDining } from "react-icons/md";
import { adminService } from "../main";
import { LoadingScreen } from "./ui/AppUI";

type PlatformAnalyticsData = {
  summary: {
    gmv: number;
    totalCollected: number;
    platformFees: number;
    totalOrders: number;
    deliveredOrders: number;
    averageOrderValue: number;
  };
  platform: {
    totalUsers: number;
    bannedUsers: number;
    totalRestaurants: number;
    verifiedRestaurants: number;
    pendingRestaurants: number;
    totalRiders: number;
    verifiedRiders: number;
    pendingRiders: number;
  };
  daily: {
    label: string;
    date: string;
    gmv: number;
    orders: number;
  }[];
  topRestaurants: {
    name: string;
    revenue: number;
    orders: number;
  }[];
  topItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  statusBreakdown: {
    delivered: number;
    active: number;
    cancelled: number;
  };
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { orders: number } }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="text-sm font-bold text-[#E23744] dark:text-[#ff6b7a]">
        ₹{payload[0].value.toLocaleString("en-IN")} GMV
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {payload[0].payload.orders} orders
      </p>
    </div>
  );
};

const AdminPlatformAnalytics = () => {
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await axios.get(
          `${adminService}/api/v1/admin/analytics`,
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
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading platform analytics..." />;
  }

  if (!data) {
    return (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Could not load platform analytics
      </p>
    );
  }

  const gmvCards = [
    {
      label: "Platform GMV",
      value: `₹${data.summary.gmv.toLocaleString("en-IN")}`,
      sub: "Food sales (subtotal)",
      icon: BiRupee,
      accent:
        "from-[#E23744]/15 to-red-500/5 text-[#E23744] dark:from-[#E23744]/25 dark:to-red-900/10 dark:text-[#ff6b7a]",
    },
    {
      label: "Total collected",
      value: `₹${data.summary.totalCollected.toLocaleString("en-IN")}`,
      sub: "Incl. delivery & platform fees",
      icon: BiTrendingUp,
      accent:
        "from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:from-emerald-500/20 dark:to-teal-900/10 dark:text-emerald-400",
    },
    {
      label: "Total orders",
      value: String(data.summary.totalOrders),
      sub: `${data.summary.deliveredOrders} delivered`,
      icon: BiPackage,
      accent:
        "from-blue-500/15 to-cyan-500/5 text-blue-600 dark:from-blue-500/20 dark:to-cyan-900/10 dark:text-blue-400",
    },
    {
      label: "Platform fees",
      value: `₹${data.summary.platformFees.toLocaleString("en-IN")}`,
      sub: `AOV ₹${data.summary.averageOrderValue.toLocaleString("en-IN")}`,
      icon: BiCheckCircle,
      accent:
        "from-amber-500/15 to-orange-500/5 text-amber-600 dark:from-amber-500/20 dark:to-orange-900/10 dark:text-amber-400",
    },
  ];

  const platformCards = [
    {
      label: "Users",
      value: String(data.platform.totalUsers),
      sub: `${data.platform.bannedUsers} banned`,
      icon: BiUser,
    },
    {
      label: "Restaurants",
      value: String(data.platform.totalRestaurants),
      sub: `${data.platform.pendingRestaurants} pending verify`,
      icon: BiStore,
    },
    {
      label: "Riders",
      value: String(data.platform.totalRiders),
      sub: `${data.platform.pendingRiders} pending verify`,
      icon: MdDeliveryDining,
    },
  ];

  const maxRestaurantRevenue = Math.max(
    ...data.topRestaurants.map((r) => r.revenue),
    1
  );
  const maxItemRevenue = Math.max(...data.topItems.map((i) => i.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {gmvCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50"
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent}`}
            >
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-lg font-black text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {stat.label}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {platformCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-4 dark:border-gray-800 dark:from-gray-900/50 dark:to-gray-900/30"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E23744]/10 text-[#E23744] dark:bg-[#E23744]/20 dark:text-[#ff6b7a]">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            GMV — last 7 days
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platform-wide food sales from all paid orders
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(226,55,68,0.06)" }}
              />
              <Bar dataKey="gmv" radius={[8, 8, 0, 0]}>
                {data.daily.map((entry, index) => (
                  <Cell
                    key={entry.date}
                    fill={
                      index === data.daily.length - 1 ? "#E23744" : "#fb7185"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Top restaurants
          </h3>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            By GMV across the platform
          </p>

          {data.topRestaurants.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.topRestaurants.map((restaurant, i) => (
                <div key={`${restaurant.name}-${i}`}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {restaurant.name}
                    </span>
                    <span className="shrink-0 font-bold text-[#E23744] dark:text-[#ff6b7a]">
                      ₹{restaurant.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E23744] to-[#ff6b7a]"
                      style={{
                        width: `${(restaurant.revenue / maxRestaurantRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {restaurant.orders} orders
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Top items platform-wide
          </h3>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Best sellers across all restaurants
          </p>

          {data.topItems.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, i) => (
                <div key={`${item.name}-${i}`}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </span>
                    <span className="shrink-0 font-bold text-[#E23744] dark:text-[#ff6b7a]">
                      ₹{item.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E23744] to-[#ff6b7a]"
                      style={{
                        width: `${(item.revenue / maxItemRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.quantity} sold
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Order status breakdown
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          All paid orders on the platform
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Delivered",
              value: data.statusBreakdown.delivered,
              color: "bg-emerald-500",
            },
            {
              label: "Active / In progress",
              value: data.statusBreakdown.active,
              color: "bg-amber-500",
            },
            {
              label: "Cancelled",
              value: data.statusBreakdown.cancelled,
              color: "bg-gray-400",
            },
          ].map((row) => {
            const pct = data.summary.totalOrders
              ? Math.round((row.value / data.summary.totalOrders) * 100)
              : 0;

            return (
              <div
                key={row.label}
                className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50"
              >
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {row.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {row.label}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">{pct}% of orders</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPlatformAnalytics;
