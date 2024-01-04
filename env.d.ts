/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SERVER_PORT: number
  readonly LOCAL: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
