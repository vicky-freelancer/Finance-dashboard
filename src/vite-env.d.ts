/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETS_WEB_APP_URL?: string;
  readonly VITE_SHEETS_APP_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
