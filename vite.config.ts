import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { isCI } from 'ci-info'
import banner from 'vite-plugin-banner'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const outDir = process.cwd()

  return {
    // https://vitejs.dev/config/#using-environment-variables-in-config
    define: {
      LOCAL: JSON.stringify(process.env.LOCAL || env.LOCAL),
    },
    plugins: [banner({
      content: (fileName: string) => {
        if (fileName.endsWith('.user.js'))
          return readFileSync(join(__dirname, 'src/meta.user.js'), 'utf-8')

        return null
      },
      outDir,
      verify: false,
    })],
    server: {
      strictPort: true,
      port: Number(env.SERVER_PORT) ?? 8089,
    },
    build: {
      minify: false,
      copyPublicDir: false,
      watch: isCI ? null : { include: 'src/**' },
      lib: {
        entry: join(__dirname, 'src/main.ts'),
        name: 'rac',
        fileName: () => 'index.user.js',
        formats: ['iife'],
      },
      outDir,
    },
  }
})
