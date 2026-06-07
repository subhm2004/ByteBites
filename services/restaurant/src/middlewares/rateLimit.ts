import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

export const isInternalRequest = (req: Request): boolean =>
  Boolean(
    process.env.INTERNAL_SERVICE_KEY &&
      req.headers["x-internal-key"] === process.env.INTERNAL_SERVICE_KEY
  );

const rateLimitHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction,
  options: { message: unknown }
) => {
  res.status(429).json(options.message);
};

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: isInternalRequest,
  handler: rateLimitHandler,
};

export const generalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Too many requests. Please try again later." },
});

export const orderCreateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 10,
  message: {
    message: "Too many orders placed. Please wait a minute before trying again.",
  },
});

export const orderWriteLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 15,
  message: { message: "Too many requests. Please try again later." },
});

export const couponLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Too many coupon attempts. Please try again in a minute.",
  },
});
