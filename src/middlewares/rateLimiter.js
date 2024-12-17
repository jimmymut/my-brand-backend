import rateLimiter from "express-rate-limit";

export const limitThreeRequestsInOneHour = rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: "Too many requests, please try gain after one hour",
    passOnStoreError: true,
})