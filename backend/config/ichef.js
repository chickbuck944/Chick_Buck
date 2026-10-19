export const ICHEF_WB_SLOTS = Object.freeze(Array.from({ length: 15 }, (_, index) => `WB-${index + 1}`));
export const ICHEF_WB_SECTION_ID = Number(process.env.ICHEF_WB_SECTION_ID || 4);

export const isIchefConfigured = () => Boolean(
  process.env.ICHEF_DB_SERVER &&
  process.env.ICHEF_DB_NAME &&
  process.env.ICHEF_DB_USER &&
  process.env.ICHEF_DB_PASSWORD
);

export const isIchefTestMode = () => process.env.ICHEF_TEST_MODE !== 'false';

// This intentionally requires an explicit opt-in and is never available in
// production. It exists only for a supervised local iChef KOT test before
// Razorpay is connected.
export const isLocalIchefTestOrderEnabled = () =>
  process.env.NODE_ENV === 'development' && process.env.ICHEF_LOCAL_TEST_ORDERS === 'true';

// The native order wrapper creates real iChef records. Keep it local and
// explicitly disabled until the supervised KOT test is ready.
export const isNativeIchefOrderEnabled = () =>
  process.env.NODE_ENV === 'development' && process.env.ICHEF_NATIVE_ORDERS_ENABLED === 'true';

export const ichefConnectionSettings = () => ({
  server: process.env.ICHEF_DB_SERVER,
  port: Number(process.env.ICHEF_DB_PORT || 1433),
  database: process.env.ICHEF_DB_NAME || 'ICHEF_LIVE',
  user: process.env.ICHEF_DB_USER,
  password: process.env.ICHEF_DB_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true },
  connectionTimeout: Number(process.env.ICHEF_DB_CONNECTION_TIMEOUT_MS || 5000),
  requestTimeout: Number(process.env.ICHEF_DB_REQUEST_TIMEOUT_MS || 10000),
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
});
