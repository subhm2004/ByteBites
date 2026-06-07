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
  max: 150,
  message: { message: "Too many requests. Please try again later." },
});
