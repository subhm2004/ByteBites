import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import { getCouponCollection } from "../util/collection.js";

type CouponType = "flat" | "percent_cap";

const normalizeCode = (code: string) => code.trim().toUpperCase();

const validateCouponPayload = (body: Record<string, unknown>, isUpdate = false) => {
  const type = body.type as CouponType | undefined;
  const value = Number(body.value);
  const maxDiscount =
    body.maxDiscount != null ? Number(body.maxDiscount) : null;
  const minOrderAmount = Number(body.minOrderAmount ?? 0);
  const usageLimit = body.usageLimit != null ? Number(body.usageLimit) : null;
  const perUserLimit = Number(body.perUserLimit ?? 1);
  const expiresAt = body.expiresAt ? new Date(String(body.expiresAt)) : null;

  if (!isUpdate) {
    if (!body.code || typeof body.code !== "string") {
      throw new Error("Coupon code is required");
    }
    if (!type || !["flat", "percent_cap"].includes(type)) {
      throw new Error("Type must be flat or percent_cap");
    }
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      throw new Error("Valid expiry date is required");
    }
  }

  if (body.value != null && (Number.isNaN(value) || value <= 0)) {
    throw new Error("Value must be greater than 0");
  }

  if (type === "percent_cap" || body.type === "percent_cap") {
    const pct = type === "percent_cap" ? value : Number(body.value);
    if (pct > 100) {
      throw new Error("Percentage cannot exceed 100");
    }
    if (!isUpdate && (maxDiscount == null || maxDiscount <= 0)) {
      throw new Error("Max discount cap is required for percent coupons");
    }
  }

  if (minOrderAmount < 0) {
    throw new Error("Minimum order cannot be negative");
  }

  if (perUserLimit < 1) {
    throw new Error("Per user limit must be at least 1");
  }

  if (usageLimit != null && usageLimit < 1) {
    throw new Error("Usage limit must be at least 1");
  }

  return {
    code: body.code ? normalizeCode(String(body.code)) : undefined,
    type,
    value,
    maxDiscount,
    minOrderAmount,
    usageLimit,
    perUserLimit,
    expiresAt,
    description: body.description ? String(body.description) : "",
    isActive: body.isActive !== false,
  };
};

export const listCoupons = TryCatch(async (_req, res) => {
  const coupons = await (await getCouponCollection())
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ count: coupons.length, coupons });
});

export const createCoupon = TryCatch(async (req, res) => {
  let payload;
  try {
    payload = validateCouponPayload(req.body);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid payload",
    });
  }

  const existing = await (await getCouponCollection()).findOne({
    code: payload.code,
  });

  if (existing) {
    return res.status(409).json({ message: "Coupon code already exists" });
  }

  const now = new Date();
  const doc = {
    code: payload.code!,
    type: payload.type!,
    value: payload.value,
    maxDiscount: payload.type === "percent_cap" ? payload.maxDiscount : null,
    minOrderAmount: payload.minOrderAmount,
    usageLimit: payload.usageLimit,
    usedCount: 0,
    perUserLimit: payload.perUserLimit,
    expiresAt: payload.expiresAt!,
    isActive: payload.isActive,
    description: payload.description,
    createdAt: now,
    updatedAt: now,
  };

  const result = await (await getCouponCollection()).insertOne(doc);

  res.status(201).json({
    message: "Coupon created",
    coupon: { _id: result.insertedId, ...doc },
  });
});

export const updateCoupon = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid coupon id" });
  }

  let payload;
  try {
    payload = validateCouponPayload(req.body, true);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid payload",
    });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (payload.code) update.code = payload.code;
  if (payload.type) update.type = payload.type;
  if (req.body.value != null) update.value = payload.value;
  if (req.body.maxDiscount !== undefined) update.maxDiscount = payload.maxDiscount;
  if (req.body.minOrderAmount != null)
    update.minOrderAmount = payload.minOrderAmount;
  if (req.body.usageLimit !== undefined) update.usageLimit = payload.usageLimit;
  if (req.body.perUserLimit != null) update.perUserLimit = payload.perUserLimit;
  if (payload.expiresAt) update.expiresAt = payload.expiresAt;
  if (req.body.description != null) update.description = payload.description;
  if (req.body.isActive != null) update.isActive = Boolean(req.body.isActive);

  const result = await (await getCouponCollection()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );

  if (!result) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  res.json({ message: "Coupon updated", coupon: result });
});

export const toggleCoupon = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid coupon id" });
  }

  const coupon = await (await getCouponCollection()).findOne({
    _id: new ObjectId(id),
  });

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  const result = await (await getCouponCollection()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        isActive: !coupon.isActive,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  res.json({
    message: `Coupon ${result?.isActive ? "activated" : "deactivated"}`,
    coupon: result,
  });
});

export const deleteCoupon = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid coupon id" });
  }

  const result = await (await getCouponCollection()).deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  res.json({ message: "Coupon deleted" });
});
