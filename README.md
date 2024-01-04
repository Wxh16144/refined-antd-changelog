# refined-antd-changelog

清理 Ant Design 的 changelog，折叠不推荐使用的版本（不适合生产环境），计算最佳建议版本。(油猴脚本)

## Development

```bash
curl -L -o public/antd.json https://registry.npmjs.org/antd # download antd.json
curl -L -o public/BUG_VERSIONS.json https://unpkg.com/antd/BUG_VERSIONS.json # download bug_versions.json
```
