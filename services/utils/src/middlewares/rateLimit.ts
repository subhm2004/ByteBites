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

export const paymentLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 20,
  message: {
    message: "Too many payment requests. Please wait before retrying.",
  },
});

export const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Too many uploads. Please try again in a minute.",
  },
});
