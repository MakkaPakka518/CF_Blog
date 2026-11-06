# CF_Blog

一个可运行的个人博客：Cloudflare Worker 直接渲染页面，D1 保存文章和设置。前台阅读不依赖 JavaScript，后台使用 Markdown 写作。

## 已有功能

- 首页精选文章、文章列表、分类/标签筛选、搜索和按时间归档。
- 文章详情、章节跟随目录、代码复制、RSS、站点地图和关于页。
- 明暗主题、手机导航、响应式阅读与键盘访问。
- 管理口令登录、草稿、预览、发布、更新、撤回、回收站恢复和 JSON 文章导出。
- 保存失败保留输入，本地草稿恢复，多窗口版本冲突检测。
- 站点名称、署名、简介、关于内容、正式域名和联系链接可在后台修改。

默认名称是“个人博客”，名称、署名和真实内容可自行配置。正式迁移不会创建虚构文章；`test/demo.sql` 仅供本地演示，界面会显示演示标记。

## 本地运行

需要 Node.js 22 或更新版本。

```sh
git clone https://github.com/MakkaPakka518/CF_Blog.git
cd CF_Blog
npm install
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars`，将 `ADMIN_PASSWORD` 设置为自己的管理口令，至少 16 个字符。然后运行：

```sh
npm run db:local
npm run dev
```

打开 `http://127.0.0.1:8787`，管理后台是 `/admin`。

如需查看带示例文章的效果，另开终端在项目目录运行：

```sh
npm run demo
```

此命令只操作本地 D1，不会向远程数据库写入示例。

## 部署 Cloudflare

1. 登录并创建数据库：

```sh
npx wrangler login
npx wrangler d1 create personal-blog
```

2. 编辑 `wrangler.jsonc`：把 `database_id` 的全零占位值替换为创建结果中的真实 ID，并按需修改 Worker 的 `name`。

3. 初始化远程数据库并部署：

```sh
npm run db:remote
npm run deploy
npx wrangler secret put ADMIN_PASSWORD
```

4. 在 Worker 的域名设置中绑定自己的域名，访问 `/admin` 登录。在“站点设置”里填写博客名称、作者署名和正式站点地址。

`.dev.vars` 只用于本地；线上口令通过 Worker Secret 设置。未配置管理口令时，后台登录会显示明确的配置提示，不会放行。

## 写作说明

- **保存草稿**只保存，不公开；**发布文章**才让文章出现在前台。
- 已发布文章的默认保存动作是**更新文章**；按 Enter 不会意外撤回文章。
- **撤回为草稿**与**移入回收站**会立即从公开页面、搜索、RSS 和站点地图中隐藏文章。
- 回收站恢复会保留原正文和原发布状态。
- Markdown 支持标题、列表、引用、代码块、表格、链接和图片；原始 HTML 会转义，避免文章执行脚本。
- 封面可使用 HTTPS 图床地址或 `/assets/` 下的静态资源路径。图片文件不存入 D1。
- 草稿自动备份在当前浏览器标签页的 `sessionStorage` 中。旧版本草稿会提示对照，不会静默覆盖新版本。

## 文件结构

```text
src/worker.js       请求路由、页面响应与后台操作
src/store.js        D1 查询和带版本检查的保存
src/security.js     会话、CSRF、登录限制与响应头
src/content.js      Markdown、字段校验与 RSS
src/views.js        服务端 HTML
public/assets/     样式、前端脚本、图标和自托管字体
migrations/        正式 D1 结构迁移
test/              API/数据库测试与本地浏览器验收
vendor/leibox/     保留的 LeiBox 完整原始组件包
DESIGN.md          已实现的设计系统
```

## 设计整合

| Skill | 在项目中的作用 |
| --- | --- |
| Hallmark | Vellum 靛蓝出版物风格、版式与视觉检查 |
| Impeccable | 阅读/写作流程、响应式、状态、独立终审与设计记录 |
| Apple Design | 即时按压反馈、可中断目录跟随、键盘和减少动态效果 |
| Apple Design Review | 对比度、输入错误定位、发布操作和移动端检查 |
| LeiBox | 实时检索并接入章节跟随能力，适配为书签指示器 |

LeiBox 原包保留在 `vendor/leibox/sailing-toc/`，博客使用适配后的 `public/assets/contents.js`，不加载原演示文章、帆船或内嵌字体。来源和署名见该目录的 README。

显示字体与正文字体均自托管，中文显示字体按 Unicode 子集加载；OFL 许可保存在 `public/assets/fonts/`。不会在阅读时请求 Google Fonts。

## 验证

```sh
npm test
npm run check
```

浏览器验收使用本地 Worker 和真实本地 D1。先运行开发服务器和本地示例，再执行：

```sh
npx playwright install chromium
BLOG_TEST_PASSWORD="你的本地管理口令" node test/browser.mjs
```

也可以用 `CHROMIUM_PATH=/path/to/chromium` 指定浏览器。

已通过 8 项单元/API 检查，以及草稿隔离、发布、键盘保存、版本冲突、回收站、预览错误定位、复制成功/失败、375/768/1440 布局和禁用 JavaScript 阅读的浏览器验收。设计终审提出的两项交互问题已修复并复核。

## 发布说明

本仓库提供可部署源码。远程 D1、Worker 和域名需要在自己的 Cloudflare 账户中配置。

字体、图标和 LeiBox 参考源码保留各自的许可与署名；参见 `public/assets/NOTICE.md`、`public/assets/fonts/*-OFL.txt` 和 `vendor/leibox/README.md`。
