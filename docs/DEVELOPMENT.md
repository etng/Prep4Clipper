# 开发与发布

## 目录

```text
extension/              可直接加载的扩展源码
  manifest.json         扩展权限、脚本顺序和唯一版本来源
  prism-config.js       Prism 运行配置
  vendor/               内置 Prism 与原始许可证
  normalize.js          代码提取、转换、高亮、配色及内部恢复逻辑
  title.js              当前文章标题和已有元数据整理
  auto.js               DOM 观察与本地配色变更监听
  popup.*               配色选择界面
  icons/                图标 PNG、SVG 源文件和预览页面
tests/                  使用虚构数据的浏览器验证页面
scripts/                检查和打包脚本，无第三方 Node.js 依赖
docs/                   开发、隐私及第三方依赖说明
.github/workflows/      CI 检查与 Release 发布
dist/                   自动生成，Git 忽略
```

内容脚本按 manifest 中的顺序在 `document_end` 执行：先配置并加载 Prism，再整理代码与标题，最后监听后续变化。工具栏弹窗只修改本地配色。运行时不需要 Node.js，也没有打包器。

## 本地验证

在仓库根目录运行：

```sh
node scripts/check.mjs
```

需要 Node.js 22+ 和已安装的 Chrome / Chromium。脚本检查 JavaScript 语法及 manifest 引用，再用独立的临时浏览器配置运行 `tests/normalize.html`；不会使用个人浏览器配置或安装依赖。成功时输出「全部 23 项检查通过」。如果无法自动找到浏览器，可通过 `CHROME_BIN` 指定可执行文件。

也可用浏览器直接打开 `tests/normalize.html`。现有 23 项检查覆盖文本保真、逐行提取、显式语言和默认 Bash、恢复、重复整理、普通表格、标题与元数据、动态代码块、配色和观察器循环。浏览器 API 在此页面使用测试替身，因此仍需手工加载 `extension/`，检查实际网页和 Web Clipper 预览。

图标使用「文档 + 扳手」的通用轮廓。打开 `extension/icons/preview.html` 可对比 16、32、48、128 像素图标在不同背景下的效果。

## 本地打包

```sh
node scripts/package.mjs
```

打包脚本从 manifest 和弹窗的资源引用计算文件清单，只包含运行资源、项目 LICENSE 和 Prism LICENSE。图标源文件、预览页、测试、开发文档及隐藏文件不进入安装包。增加新的运行资源时，需要同步维护 `scripts/extension-files.mjs` 的资源收集规则。

产物是 `dist/prep4clipper-版本号.zip` 及同名 `.sha256` 文件。ZIP 根目录直接包含 `manifest.json`，可解压后加载。固定文件顺序、权限和 ZIP 时间戳，移除 ZIP 额外元数据；在相同 `zip` 版本下，相同源码会生成相同 ZIP。整个过程不访问网络。

## 创建版本 tag

先提交本次功能改动与 `CHANGELOG.md`，确保工作区干净，再在仓库根目录运行：

```sh
node scripts/tag.mjs 0.2.6
git push --atomic origin main v0.2.6
```

版本参数也可写成 `v0.2.6`。脚本更新 `extension/manifest.json` 的 `version`，运行检查，仅提交 manifest 的版本变更，再创建带说明的 tag。无需手工改 manifest，也不会自动推送。若版本已经一致（例如首次发布），直接验证并创建 tag。已有 tag、版本倒退或未提交的文件会被拒绝。使用普通 `git tag` 会绕过这个脚本，建议始终使用脚本。

## GitHub Actions 发布

`ci.yml` 在提交到 `main` 和打开 PR 时运行检查与试打包，使用只读仓库权限。`release.yml` 在推送 `v*` tag 时运行，也支持在 Actions 页面输入**已有 tag** 手动运行。

workflow 校验 tag 与 manifest 版本完全一致，再验证、打包并通过 GitHub CLI 创建 Release，上传 ZIP 和 SHA-256 文件。发布使用 GitHub 自动提供的 `GITHUB_TOKEN`，无需配置个人令牌；只有发布 workflow 申请 `contents: write`。相关机制见 [GitHub workflow 权限说明](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions) 和 [GitHub CLI Release 文档](https://cli.github.com/manual/gh_release_create)。

在 Actions 中应看到检查和发布成功，在对应 Release 中应看到两个附件。失败时先查看日志，修复源码后使用新版本 tag 发布；同一 tag 不覆盖已发布的附件。尚未发布的失败草稿可删除后重跑。不要提交 `dist/`。

## 公开仓库约定

文档和测试使用通用说明或虚构数据，不提交个人文章清单、绝对本机路径、真实网页快照、私人笔记、密钥或调试日志。公开 Git 提交使用 GitHub 的 noreply 邮箱。第三方许可证中的原作者署名必须保留。
