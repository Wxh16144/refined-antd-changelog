import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const metaPath = path.join(__dirname, 'src/meta.js')

function run() {
  const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const content = fs.readFileSync(metaPath, 'utf8')

  const newContent = content
    .replace(
      /\/\/ @version\s+.*$/m,
      `// @version      ${version}`,
    )
    .replace(
      /\/\/ @require\s+.*https:\/\/registry\.npmmirror\.com\/refined-antd-changelog.*$/m,
      `// @require     https://registry.npmmirror.com/refined-antd-changelog/${version}/files/index.user.js`,
    )

  fs.writeFileSync(metaPath, newContent, 'utf8')
}

run()
