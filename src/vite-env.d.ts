/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_AZURE_CLIENT_ID: string
  readonly VITE_AZURE_CLIENT_SECRET: string
  readonly VITE_AZURE_TENANT_ID: string
  readonly VITE_AZURE_REDIRECT_URI: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_GITHUB_OWNER: string
  readonly VITE_GITHUB_REPO: string
  readonly VITE_APP_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly NODE_ENV: 'development' | 'production'
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}