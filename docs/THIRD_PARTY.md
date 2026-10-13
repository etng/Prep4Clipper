# 第三方依赖

## Prism 1.30.0

- 来源：[Prism 官方仓库的 v1.30.0](https://github.com/PrismJS/prism/tree/v1.30.0)。
- 文件：`extension/vendor/prism.js`，内置约 28 KB 的压缩版本。
- 许可证：MIT，原文完整保留在 `extension/vendor/LICENSE-Prism`，安装包也包含该文件。
- 组件：核心、Markup、CSS、C-like、JavaScript、Bash、Python、JSON、YAML，以及这些组件自带的语言别名。
- `normalize.js` 中 Tomorrow Night 和 Solarized Light 配色参考 Prism 官方主题，样式限定到本扩展生成的代码块。

Prism 只为整理后的代码添加高亮 `span`。`prism-config.js` 设置手动高亮并禁用 Worker 消息处理；扩展不从远程地址加载语言组件。

更新第三方代码时应同时更新版本说明，保留版权和许可证，并运行现有验证页面。不要把临时下载的页面、个人数据或调试产物放入 `vendor/`。
