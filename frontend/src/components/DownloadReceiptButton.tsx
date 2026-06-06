import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BiDownload, BiLoader } from "react-icons/bi";
import { restaurantService } from "../main";
import { useAppData } from "../context/useAppData";
import { downloadOrderReceipt } from "../utils/generateReceiptPdf";
import type { IOrder } from "../types";
import { AppButton } from "./ui/AppUI";

type Props = {
  orderId?: string;
  order?: IOrder | null;
  paymentId?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  label?: string;
  retryUntilPaid?: boolean;
};

async function fetchOrderById(orderId: string): Promise<IOrder> {
  const { data } = await axios.get(
    `${restaurantService}/api/order/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return data;
}

async function fetchOrderWithRetry(
  orderId: string,
  maxAttempts = 6
): Promise<IOrder> {
  for (let i = 0; i < maxAttempts; i++) {
    const order = await fetchOrderById(orderId);
    if (order.paymentStatus === "paid") return order;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return fetchOrderById(orderId);
}

const DownloadReceiptButton = ({
  orderId,
  order: orderProp,
  paymentId,
  variant = "secondary",
  className = "",
  label = "Download receipt (PDF)",
  retryUntilPaid = false,
}: Props) => {
  const { user } = useAppData();
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!user) {
      toast.error("Please log in to download receipt");
      return;
    }

    setLoading(true);
    try {
      let order = orderProp;
      if (!order && orderId) {
        order = retryUntilPaid
          ? await fetchOrderWithRetry(orderId)
          : await fetchOrderById(orderId);
      }
      if (!order) {
        toast.error("Order not found");
        return;
      }

      downloadOrderReceipt(
        order,
        { name: user.name, email: user.email },
        paymentId || order.paymentId
      );
      toast.success("Receipt downloaded!");
    } catch {
      toast.error("Could not download receipt");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId && !orderProp) return null;

  return (
    <AppButton
      variant={variant}
      className={className}
      disabled={loading}
      onClick={handleDownload}
    >
      {loading ? (
        <BiLoader className="h-4 w-4 animate-spin" />
      ) : (
        <BiDownload size={16} />
      )}
      {loading ? "Preparing PDF..." : label}
    </AppButton>
  );
};

export default DownloadReceiptButton;
