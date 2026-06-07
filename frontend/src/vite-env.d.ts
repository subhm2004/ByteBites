/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE?: string;
  readonly VITE_RESTAURANT_SERVICE?: string;
  readonly VITE_UTILS_SERVICE?: string;
  readonly VITE_REALTIME_SERVICE?: string;
  readonly VITE_RIDER_SERVICE?: string;
  readonly VITE_ADMIN_SERVICE?: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_INTERNAL_SERVICE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
