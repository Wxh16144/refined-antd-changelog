# refined-antd-changelog

清理 Ant Design 的 changelog，折叠不推荐使用（不适合生产环境）的版本，计算最佳建议版本。(油猴脚本)

[Install on Greasyfork](https://greasyfork.org/en/scripts/484164-refined-ant-design-changelog) | [Ant Design 版本控，更新日志清爽利器 - 掘金](https://juejin.cn/post/7321164229545377831)

## Screenshot

### antd5.x

[![antd5](https://github.com/Wxh16144/refined-antd-changelog/assets/32004925/c269e70e-e8c0-4815-b5ef-0c502d2f2600)](https://ant.design/changelog-cn)

### antd4.x

[![antd4](https://github.com/Wxh16144/refined-antd-changelog/assets/32004925/44eefee9-fe5a-4159-9f9f-da99f01078f4)](https://4x.ant.design/changelog-cn)

## Development

为了方便本地调试而不频繁调用 CDN 浪费资源，建议将资源下载到本地进一步调试。

```bash
curl -L -o public/antd.json https://registry.npmjs.org/antd # download antd.json
curl -L -o public/BUG_VERSIONS.json https://unpkg.com/antd/BUG_VERSIONS.json # download bug_versions.json
```

**构建**

本地编译将在根目录生成 `index.user.js` 文件， 阅读 [How to edit scripts with your favorite editor?](https://violentmonkey.github.io/posts/how-to-edit-scripts-with-your-favorite-editor/) 文档，按照提示进行开发调试即可。

```bash
npm run start
```
