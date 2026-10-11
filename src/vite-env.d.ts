/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_COACH_ENDPOINT?: string; readonly VITE_REPO_URL?: string }
interface ImportMeta { readonly env: ImportMetaEnv }
