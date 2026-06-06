import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../main";
import { AppButton, AppCard, AppInput, EmptyState } from "./ui/AppUI";
import { BiLoader, BiTrash } from "react-icons/bi";

export type CouponType = "flat" | "percent_cap";

export interface ICoupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  expiresAt: string;
  isActive: boolean;
  description?: string;
}

const emptyForm = {
  code: "",
  type: "flat" as CouponType,
  value: "",
  maxDiscount: "",
  minOrderAmount: "0",
  usageLimit: "",
  perUserLimit: "1",
  expiresAt: "",
  description: "",
};

const AdminCouponPanel = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/coupons`, {
        headers: authHeaders,
      });
      setCoupons(data.coupons || []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!form.code || !form.value || !form.expiresAt) {
      toast.error("Code, value and expiry are required");
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${adminService}/api/v1/admin/coupon`,
        {
          code: form.code,
          type: form.type,
          value: Number(form.value),
          maxDiscount:
            form.type === "percent_cap" ? Number(form.maxDiscount) : null,
          minOrderAmount: Number(form.minOrderAmount) || 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          perUserLimit: Number(form.perUserLimit) || 1,
          expiresAt: form.expiresAt,
          description: form.description,
        },
        { headers: authHeaders }
      );
      toast.success("Coupon created!");
      setForm(emptyForm);
      fetchCoupons();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(String(error.response.data.message));
      } else {
        toast.error("Failed to create coupon");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (id: string) => {
    try {
      await axios.patch(
        `${adminService}/api/v1/admin/coupon/${id}/toggle`,
        {},
        { headers: authHeaders }
      );
      fetchCoupons();
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${adminService}/api/v1/admin/coupon/${id}`, {
        headers: authHeaders,
      });
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const typeLabel = (c: ICoupon) =>
    c.type === "flat"
      ? `Flat ₹${c.value} off`
      : `${c.value}% off · max ₹${c.maxDiscount}`;

  return (
    <div className="space-y-6">
      <AppCard className="space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Create coupon
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Flat = fixed ₹ off · Percent + cap = % discount with maximum limit
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AppInput
            placeholder="Coupon code e.g. BYTEBITES50"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as CouponType })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#E23744]/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="flat">Flat discount (₹)</option>
            <option value="percent_cap">Percent with cap (%)</option>
          </select>
          <AppInput
            type="number"
            placeholder={form.type === "flat" ? "Discount amount ₹" : "Percent %"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          {form.type === "percent_cap" && (
            <AppInput
              type="number"
              placeholder="Max discount cap ₹"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            />
          )}
          <AppInput
            type="number"
            placeholder="Min order ₹"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          />
          <AppInput
            type="number"
            placeholder="Total usage limit (optional)"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />
          <AppInput
            type="number"
            placeholder="Per user limit"
            value={form.perUserLimit}
            onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
          />
          <AppInput
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
          <AppInput
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2"
          />
        </div>

        <AppButton disabled={saving} onClick={handleCreate}>
          {saving ? <BiLoader className="animate-spin" /> : null}
          Create coupon
        </AppButton>
      </AppCard>

      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <EmptyState
          emoji="🎟️"
          title="No coupons yet"
          subtitle="Create your first discount coupon above"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((c) => (
            <AppCard key={c._id} className="relative space-y-3 !p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black tracking-wide text-[#E23744] dark:text-[#ff6b7a]">
                    {c.code}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {typeLabel(c)}
                  </p>
                  {c.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {c.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    c.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Min order: ₹{c.minOrderAmount}</span>
                <span>
                  Used: {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </span>
                <span>Per user: {c.perUserLimit}x</span>
                <span>
                  Expires:{" "}
                  {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <AppButton
                  variant="secondary"
                  className="!py-2 text-xs"
                  onClick={() => toggleCoupon(c._id)}
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </AppButton>
                <button
                  type="button"
                  onClick={() => deleteCoupon(c._id)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <BiTrash size={14} /> Delete
                </button>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCouponPanel;
