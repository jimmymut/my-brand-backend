import "dotenv/config";

export const port = process.env.PORT || 4432;
export const test_port  = process.env.TEST_PORT || 5541;
export const node_env  = process.env.NODE_ENV || "development";
export const dev_db  = process.env.DEV_DB;
export const remote_db  = process.env.REMOTE_DB;
export const test_db  = process.env.TEST_DB;
export const own_email  = process.env.OWN_EMAIL;
export const google_client_id  = process.env.GOOGLE_CLIENT_ID;
export const google_client_secret  = process.env.GOOGLE_CLIENT_SECRET;
export const sender_email  = process.env.SENDER_EMAIL;
export const email_password  = process.env.SENDER_EMAIL_PASSWORD;
export const base_url = process.env.BASE_URL;
export const frontend_base_url = process.env.FRONTEND_BASE_URL;
export const jwt_expiry_time = process.env.JWT_EXPIRATION_TIME;
export const jwt_secret_key = process.env.SECRET_KEY;
export const jwt_verify_secret_key = process.env.VERIFY_SECRET_KEY;
export const salt_round = parseInt(process.env.SALT_ROUND??"8");