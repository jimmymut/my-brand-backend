// Runs before every test file (see "jest.setupFiles" in package.json).
// Tests never touch a database: every Mongoose query is mocked. These env
// values make token signing / hashing deterministic and independent of .env
// (dotenv never overrides variables that are already set).
process.env.NODE_ENV = "test";
process.env.SECRET_KEY = "test-jwt-secret";
process.env.VERIFY_SECRET_KEY = "test-verify-secret";
process.env.JWT_EXPIRATION_TIME = "2h";
process.env.SALT_ROUND = "4";
process.env.BASE_URL = "http://api.test";
process.env.FRONTEND_BASE_URL = "http://frontend.test";
process.env.OWN_EMAIL = "owner@example.com";
process.env.SENDER_EMAIL = "sender@example.com";
process.env.SENDER_EMAIL_PASSWORD = "sender-password";
process.env.GOOGLE_CLIENT_ID = "google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
process.env.CLOUD_NAME = "cloud";
process.env.CLOUDINARY_API_KEY = "key";
process.env.CLOUDINARY_API_SECRET = "secret";

// If a query slips through un-mocked, fail fast instead of buffering for 10s.
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);
