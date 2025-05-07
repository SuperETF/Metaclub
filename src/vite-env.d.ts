/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // 필요하면 추가 환경 변수도 여기에…
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  