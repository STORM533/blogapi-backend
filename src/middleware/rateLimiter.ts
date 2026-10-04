import rateLimit from "express-rate-limit";

// In tests the high limit prevents suites from triggering 429s while still
// preserving normal RateLimit headers. Never use Infinity here — it breaks
// the draft-8 headers express-rate-limit emits.
const isTest = process.env.NODE_ENV === "test";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1_000_000 : 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1_000_000 : 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
});
