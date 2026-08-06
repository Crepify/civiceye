/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_AUTHORITIES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
