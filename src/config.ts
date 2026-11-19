export const SHEETS_WEB_APP_URL = (import.meta.env.VITE_SHEETS_WEB_APP_URL ?? "").trim();
export const SHEETS_APP_TOKEN = (import.meta.env.VITE_SHEETS_APP_TOKEN ?? "").trim();
export const isSheetsConfigured = SHEETS_WEB_APP_URL.length > 0;
