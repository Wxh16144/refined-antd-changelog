import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const metaPath = path.join(__dirname, 'src/meta.user.js')

function run() {
  const { version, name } = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const content = fs.readFileSync(metaPath, 'utf8')

  const newContent = content
    .replace(
      /\/\/ @version\s+.*$/m,
      `// @version      ${version}`,
    )
    .replace(
      /\/\/ @require\s+.*https:\/\/registry\.npmmirror\.com\/refined-antd-changelog.*$/m,
      `// @require     https://registry.npmmirror.com/${name}/${version}/files/index.user.js`,
    )
    .replace(
     /;var __rac_version__ =.*;/,
      `;var __rac_version__ = "${version}";`,
    )

  fs.writeFileSync(metaPath, newContent, 'utf8')
}

run()
