import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fetch from 'isomorphic-fetch'
import fs from 'fs-extra'
import fetchJSONFactory, { CDN } from '../src/fetchJSON'
import type { CDN_ITEM } from '../src/type'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fetchJSON = fetchJSONFactory(fetch)
const outputDir = path.resolve(__dirname, '../public')

if (!fs.existsSync(outputDir))
  fs.mkdirSync(outputDir)

async function main() {
  async function download(cdn: CDN_ITEM) {
    for (const [key, url] of Object.entries(cdn)) {
      try {
        const json = await fetchJSON(url)
        await fs.writeJson(path.resolve(outputDir, `${key}.json`), json, { spaces: 2 })
      }
      catch (error) {
        console.error(error)
      }
    }
  };

  await download(CDN.remote).catch(() => {
    console.warn('remote failed, try cnpm')
    return download(CDN.cnpm)
  })
}

main()
  .then(() => console.log('✅ sync-dev-deps.ts done!'))
  .catch(e => console.error('❌ sync-dev-deps.ts failed!', e))
