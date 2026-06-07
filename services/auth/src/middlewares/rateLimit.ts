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

/** Login / OAuth — IP-based, strict */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
});

/** Safety net for all auth routes */
export const generalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Too many requests. Please try again later." },
});
