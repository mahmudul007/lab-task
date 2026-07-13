/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_PROD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}