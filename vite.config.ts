import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { isCI } from 'ci-info'
import banner from 'vite-plugin-banner'
import { name } from './package.json'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const outDir = process.cwd()

  const bannerText = readFileSync(join(__dirname, 'src/meta.user.js'), 'utf-8');
  const LOCAL = process.env.LOCAL || env.LOCAL

  return {
    // https://vitejs.dev/config/#using-environment-variables-in-config
    define: {
      // https://vitejs.dev/config/shared-options.html#envprefix
      'import.meta.env.LOCAL': JSON.stringify(LOCAL),
    },
    plugins: [
      banner({
        content: (fileName: string) => {
          if (fileName.endsWith('.user.js')) {
            return bannerText.replace(
              new RegExp(String.raw`// @require.*https://registry.npmmirror.com/${name}.*$`, 'm'),
              '',
            )
          }

          return null
        },
        outDir,
        verify: false,
      }),
      // https://github.com/vitejs/vite/issues/9825
      {
        name: 'remove-sourcemaps',
        transform(code) {
          return {
            code,
            map: { mappings: '' }
          }
        }
      }
    ],
    server: {
      strictPort: true,
      port: Number(env.SERVER_PORT) ?? 8089,
      open: true,
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
      // https://github.com/vitejs/vite/issues/9825
      // sourcemap: false,
    },
  }
})
