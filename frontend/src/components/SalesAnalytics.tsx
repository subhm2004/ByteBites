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
import { restaurantService } from "../main";
import { LoadingScreen } from "./ui/AppUI";
import { BiRupee, BiPackage, BiCheckCircle, BiTrendingUp } from "react-icons/bi";

type SalesAnalyticsData = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    averageOrderValue: number;
  };
  daily: {
    label: string;
    date: string;
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

const statCards = (
  data: SalesAnalyticsData["summary"]
): {
  label: string;
  value: string;
  icon: typeof BiRupee;
  accent: string;
}[] => [
  {
    label: "Total revenue",
    value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
    icon: BiRupee,
    accent: "from-[#E23744]/15 to-red-500/5 text-[#E23744] dark:from-[#E23744]/25 dark:to-red-900/10 dark:text-[#ff6b7a]",
  },
  {
    label: "Total orders",
    value: String(data.totalOrders),
    icon: BiPackage,
    accent: "from-blue-500/15 to-cyan-500/5 text-blue-600 dark:from-blue-500/20 dark:to-cyan-900/10 dark:text-blue-400",
  },
  {
    label: "Delivered",
    value: String(data.deliveredOrders),
    icon: BiCheckCircle,
    accent: "from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:from-emerald-500/20 dark:to-teal-900/10 dark:text-emerald-400",
  },
  {
    label: "Avg order value",
    value: `₹${data.averageOrderValue.toLocaleString("en-IN")}`,
    icon: BiTrendingUp,
    accent: "from-amber-500/15 to-orange-500/5 text-amber-600 dark:from-amber-500/20 dark:to-orange-900/10 dark:text-amber-400",
  },
];

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
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {payload[0].payload.orders} orders
      </p>
    </div>
  );
};

const SalesAnalytics = ({ restaurantId }: { restaurantId: string }) => {
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await axios.get(
          `${restaurantService}/api/order/analytics/${restaurantId}`,
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
  }, [restaurantId]);

  if (loading) {
    return <LoadingScreen message="Loading sales data..." />;
  }

  if (!data) {
    return (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Could not load sales analytics
      </p>
    );
  }

  const maxItemRevenue = Math.max(...data.topItems.map((i) => i.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards(data.summary).map((stat) => (
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Revenue — last 7 days
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Food sales (subtotal) from paid orders
            </p>
          </div>
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
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(226,55,68,0.06)" }} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
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
            Top selling items
          </h3>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            By revenue from all paid orders
          </p>

          {data.topItems.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No sales yet
            </p>
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

        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Order status
          </h3>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Breakdown of all paid orders
          </p>

          <div className="space-y-3">
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
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {row.label}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {row.value}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
