import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/useSocket";
import axios from "axios";
import { restaurantService } from "../main";
import { BiChevronRight } from "react-icons/bi";
import {
  AppCard,
  AppPage,
  EmptyState,
  LoadingScreen,
  PageHeader,
  StatusBadge,
} from "../components/ui/AppUI";
import DownloadReceiptButton from "../components/DownloadReceiptButton";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return <LoadingScreen message="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <AppPage narrow>
        <PageHeader title="My Orders" />
        <EmptyState
          emoji="📦"
          title="No orders yet"
          subtitle="Your order history will show up here once you place your first order"
        />
      </AppPage>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <AppPage narrow>
      <PageHeader
        eyebrow="Orders"
        title="My Orders"
        subtitle={`${orders.length} total orders`}
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Active · {activeOrders.length}
          </h2>

          {activeOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No active orders right now</p>
          ) : (
            activeOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Past · {completedOrders.length}
          </h2>

          {completedOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No completed orders yet</p>
          ) : (
            completedOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))
          )}
        </section>
      </div>
    </AppPage>
  );
};

export default Orders;

const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => (
  <AppCard
    hover
    className="cursor-pointer !p-4"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-bold text-gray-900 dark:text-white">
          Order #{order._id.slice(-6).toUpperCase()}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {order.items.map((item, i) => (
            <span key={i}>
              {item.name} × {item.quauntity}
              {i < order.items.length - 1 && " · "}
            </span>
          ))}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
      <span className="text-lg font-black text-[#E23744]">
        ₹{order.totalAmount}
      </span>
      <div className="flex items-center gap-2">
        {order.paymentStatus === "paid" && (
          <DownloadReceiptButton
            order={order}
            variant="ghost"
            className="!w-auto !py-2 !px-3 text-xs"
            label="Receipt"
          />
        )}
        <span className="flex items-center gap-0.5 text-sm font-medium text-gray-500">
          View details <BiChevronRight />
        </span>
      </div>
    </div>
  </AppCard>
);
