# Prep4Clipper · 剪藏前整理

Chrome / Edge 扩展，在使用 [Obsidian Web Clipper](https://github.com/obsidianmd/obsidian-clipper) 前整理文章标题和代码块，也可用于日常阅读。采用 Manifest V3，源码可直接加载，运行时无需联网或下载依赖。

## 功能

- 将 **Urvanov / Crayon Syntax Highlighter** 的代码表格转换为标准 `<pre><code>`，去掉行号和工具栏，保留代码标题、缩进、空行及特殊字符。
- 使用内置 Prism 高亮；保留明确的语言标记，没有标记时默认使用 Bash。
- 根据当前文章标题中的 `rel="bookmark"` 链接整理网页标题，并同步已有的 Open Graph、Twitter 和当前文章 JSON-LD 标题。
- 自动处理后续动态加载的目标代码块，支持跟随页面、浅色、深色、Tomorrow Night 和 Solarized Light 配色。

## 安装

1. 在 [Releases](https://github.com/etng/Prep4Clipper/releases/latest) 下载 `prep4clipper-版本号.zip` 并解压。请使用这个安装包；GitHub 自动生成的 **Source code** 是完整源码。
2. Chrome 打开 `chrome://extensions`，Edge 打开 `edge://extensions`。
3. 开启「开发者模式」，点击「加载已解压的扩展程序」，选择解压后**直接包含 `manifest.json` 的目录**。
4. 将扩展固定到工具栏，刷新已经打开的文章。

也可以克隆仓库后直接加载 `extension/` 目录。当前通过开发者模式安装，未发布到浏览器扩展商店。

## 使用

打开文章后会自动整理，直接使用 Web Clipper 检查预览并剪藏。如果预览已打开，先关闭再打开，让它重新读取页面。点击扩展图标可以选择配色，设置保存在本机，也会应用到已打开的页面。

更新时先解压新版到原安装目录，在扩展管理页点击「重新加载」，然后刷新文章。暂时禁用扩展后刷新，可恢复网站的原始显示。

## 范围与限制

- 仅整理主文档中匹配 Urvanov / Crayon 结构的代码块，保留普通表格；不处理 iframe、Shadow DOM 或其他高亮器。
- 标题只使用匹配当前 URL 或 canonical URL 的文章标题链接；没有唯一匹配时保留原标题。
- 不自动识别编程语言。未内置的语言仍保留 `language-*` 标记，并使用基础高亮。
- 面向 Chrome / Edge Manifest V3；Firefox / Safari 尚未验证。剪藏结果仍需根据 Web Clipper 版本和模板检查预览。

## 权限与隐私

扩展通过内容脚本在 HTTP / HTTPS 页面自动运行，因此浏览器会提示网页访问权限；`storage` 权限仅用于保存配色。处理在当前浏览器内完成，不上传网页、代码或笔记，不包含统计、账号或远程服务。详见 [隐私说明](docs/PRIVACY.md)。

## 开发与发布

源码无需构建。维护检查与打包使用 Node.js 22+、本机 Chrome / Chromium 和系统 `zip`，不需要 `npm install`。在仓库根目录执行：

```sh
node scripts/check.mjs
node scripts/package.mjs
```

`dist/` 是自动生成的本地产物，已由 Git 忽略。提交和 PR 会执行检查。发布新版本时运行：

```sh
node scripts/tag.mjs 0.2.6
git push --atomic origin main v0.2.6
```

脚本自动更新 manifest、验证并提交版本变更、创建 tag；推送后 GitHub Actions 自动发布 ZIP 和 SHA-256 校验文件到 Release，无需手工提交 ZIP。

目录职责、验证方法及发布细节见 [开发说明](docs/DEVELOPMENT.md)，版本变化见 [CHANGELOG](CHANGELOG.md)。

## 许可证

项目使用 [MIT 许可证](LICENSE)。内置 Prism 1.30.0 的原始许可证保留在 `extension/vendor/LICENSE-Prism`；来源和组件见 [第三方依赖说明](docs/THIRD_PARTY.md)。
