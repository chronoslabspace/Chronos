/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_MOCK_ACCESS_REQUESTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
