/// <reference types="vite/client" />

// Backend vars (usadas apenas no SSR / servidor)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_LOJA_NOME: string
  readonly VITE_WHATSAPP_NUMBER: string
  readonly VITE_INSTAGRAM: string
  readonly VITE_DESCONTO_PIX: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SITE_URL: string
  readonly VITE_GA_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}