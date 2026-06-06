import { jsPDF } from "jspdf";
import type { IOrder } from "../types";

type CustomerInfo = {
  name: string;
  email: string;
};

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatMoney = (n: number) => `Rs. ${n.toFixed(2)}`;

export function downloadOrderReceipt(
  order: IOrder,
  customer: CustomerInfo,
  paymentIdOverride?: string
) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const paymentId = paymentIdOverride || order.paymentId || "N/A";

  doc.setFillColor(226, 55, 68);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ByteBites", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Order Receipt", pageWidth - margin, 18, { align: "right" });

  y = 40;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt Details", margin, y);
  y += 8;

  doc.setFontSize(9);
  const details: [string, string][] = [
    ["Order ID:", order._id],
    ["Date:", formatDate(order.createdAt)],
    ["Customer:", customer.name],
    ["Email:", customer.email],
    ["Restaurant:", order.restaurantName],
    ["Order Status:", order.status.replace(/_/g, " ")],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 35, y);
    y += 6;
  });

  y += 4;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Item", margin, y);
  doc.text("Qty", pageWidth - margin - 50, y);
  doc.text("Amount", pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  order.items.forEach((item) => {
    const lineTotal = item.price * item.quauntity;
    doc.text(item.name, margin, y);
    doc.text(String(item.quauntity), pageWidth - margin - 50, y);
    doc.text(formatMoney(lineTotal), pageWidth - margin, y, { align: "right" });
    y += 6;
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
  });

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const totals: [string, number][] = [
    ["Subtotal", order.subtotal],
    ["Delivery fee", order.deliveryFee],
    ["Platform fee", order.platfromFee],
  ];

  totals.forEach(([label, amount]) => {
    doc.text(label, margin, y);
    doc.text(formatMoney(amount), pageWidth - margin, y, { align: "right" });
    y += 7;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", margin, y);
  doc.text(formatMoney(order.totalAmount), pageWidth - margin, y, {
    align: "right",
  });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const addrLines = doc.splitTextToSize(
    order.deliveryAddress.fromattedAddress,
    pageWidth - 2 * margin
  );
  doc.text(addrLines, margin, y);
  y += addrLines.length * 5 + 4;
  doc.text(`Mobile: ${order.deliveryAddress.mobile}`, margin, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Payment", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Method: ${order.paymentMethod}`, margin, y);
  y += 5;
  doc.text(`Status: ${order.paymentStatus}`, margin, y);
  y += 5;
  const paymentLines = doc.splitTextToSize(
    `Payment ID: ${paymentId}`,
    pageWidth - 2 * margin
  );
  doc.text(paymentLines, margin, y);
  y += paymentLines.length * 5 + 12;

  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Thank you for ordering with ByteBites!",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  doc.text(
    "This is a computer-generated receipt.",
    pageWidth / 2,
    y + 5,
    { align: "center" }
  );

  const shortId = order._id.slice(-6).toUpperCase();
  doc.save(`ByteBites-Receipt-${shortId}.pdf`);
}
