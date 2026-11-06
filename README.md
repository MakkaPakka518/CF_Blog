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

编辑 `.dev.vars`，将 `ADMIN_PASSWORD` 设置为自己的非空管理口令，建议使用 16 字符以上的强口令。然后运行：

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

可以使用下面的**网页手动部署**，或使用后面的 **Wrangler 命令行部署**。

<a id="manual-deploy"></a>

### 网页手动部署（单文件版）

使用 **[only/worker.js](only/worker.js)**。这个文件已经打包了博客后端、Markdown 解析器、前端脚本、CSS、图标和自托管字体，**不用安装 Node.js，不用连接 GitHub 构建，也不用上传 `public/` 或添加 `ASSETS` 绑定**。

#### 1. 创建并初始化 D1

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，打开 **存储和数据库（Storage & Databases）→ D1 SQL Database**。
2. 点击 **创建数据库（Create Database）**，例如命名为 `cf-blog-db`。
3. 进入数据库的 **控制台（Console）**，打开本仓库的 **[migrations/0001_blog.sql](migrations/0001_blog.sql)**，复制完整 SQL，粘贴到 Console 后点击 **Execute / 执行**。
4. 在 Tables 页面确认已经有 `posts`、`settings`、`login_attempts` 和 `sessions` 四张表。

已有本博客数据库且已初始化时，直接使用原数据库，跳过初始化 SQL。不要为更新 Worker 重新创建数据库或重跑建表文件。

建表全部成功后，再在同一 Console 执行下面这段 SQL，记录迁移状态。这样以后切换到 Wrangler 部署也能识别已经完成的初始化：

```sql
CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0001_blog.sql');
```

#### 2. 获取单文件代码

打开 **[only/worker.js 的 Raw 原始文件](https://raw.githubusercontent.com/MakkaPakka518/CF_Blog/main/only/worker.js)**，复制全部内容。

文件包含完整中文字体，约 4.6 MiB。GitHub 普通页面可能不显示大文件预览，使用上面的 Raw 链接，或下载原始文件后用文本编辑器全选复制。不要复制 GitHub 网页 HTML，也不要用 `src/worker.js` 代替这个单文件。

#### 3. 在网页创建 Worker 并粘贴代码

1. 回到 **Workers & Pages → Create application / 创建应用**。
2. 选择 **Start with Hello World!**，创建一个 JavaScript Worker，例如命名为 `cf-blog`，先点击 **Deploy / 部署**。
3. 进入这个 Worker，点击 **Edit code / 编辑代码**。
4. 打开默认 JavaScript 入口（通常叫 `worker.js`），全选原来的 Hello World 代码，替换为 `only/worker.js` 的完整内容。
5. 点击 **Save and Deploy / 保存并部署**。代码本身已经包含 `export default`，不需要再套其他模板。

#### 4. 添加数据库绑定和管理口令

在这个 Worker 的配置页完成：

| 位置 | 配置 |
| --- | --- |
| **Bindings → Add binding → D1 database** | Variable name 必须为 **`DB`**，选择刚才的 `cf-blog-db` |
| **Settings → Variables and Secrets** | 新增 **Secret**，名称为 **`ADMIN_PASSWORD`**，值为自己的非空管理口令，建议 16 字符以上 |
| **Settings → Runtime → Compatibility date** | 使用 `2026-11-01` 或更新的兼容日期 |

保存绑定和 Secret，并按控制台提示部署新版本。`ADMIN_PASSWORD` 是 **Worker 运行时 Secret**，不是 Build 构建变量，不要把真实口令写进公开仓库。

网页方式通过绑定选择数据库，脚本里不用填写数据库 ID。单文件版只需要 `DB` 和 `ADMIN_PASSWORD`，不需要 KV、R2 或 `ASSETS`。

#### 5. 打开博客

1. 在**浏览器新标签页**打开 Cloudflare 提供的 `https://cf-blog.你的子域.workers.dev` 地址。
2. 访问 `/admin`，输入刚设置的管理口令。
3. 在“站点设置”中填写博客名称、作者署名、关于内容和正式站点地址，再发布第一篇文章。
4. 如需自定义域名，在 **Settings → Domains & Routes → Add → Custom domain** 中添加，随后更新博客后台的正式站点地址。

请用完整的 `workers.dev` 或自定义域名测试；控制台内嵌预览可能受页面的防嵌入策略限制。首次首页没有文章是正常状态，正式初始化不会导入演示文章。

#### 常见问题与更新

- **提示“博客数据库尚未配置”**：检查 D1 绑定名是否精确为 `DB`，并确认绑定修改已部署。
- **提示数据库未初始化 / no such table**：在已绑定的数据库中执行第 1 步的初始化 SQL。
- **提示未读取到 `ADMIN_PASSWORD`**：检查运行时变量或 Secret 的名称和值，并确认已保存部署。口令只要求非空，不会因为不足 16 字符而被判定为未配置；建议使用 16 字符以上的强口令。
- **出现模块导入或 ASSETS 错误**：确认粘贴的是 `only/worker.js` 的完整原始内容。
- **更新单文件版**：用新版 `only/worker.js` 替换 Worker 代码，保留原来的 D1 绑定和 Secret；只有新增数据库迁移时才执行对应的新 SQL。

单文件版的静态资源也由 Worker 返回，会计入 Worker 请求用量；浏览器通过 ETag 校验缓存。脚本大小限制以 [Cloudflare Workers 官方限制](https://developers.cloudflare.com/workers/platform/limits/#worker-size) 为准。

### Wrangler 命令行部署（源码版）

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
only/worker.js      网页控制台使用的完整单文件版本
public/assets/     样式、前端脚本、图标和自托管字体
migrations/        正式 D1 结构迁移
test/              API/数据库测试与本地浏览器验收
vendor/leibox/     保留的 LeiBox 完整原始组件包
DESIGN.md          已实现的设计系统
wrangler.only.jsonc 单文件版本的本地验证/命令行配置
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

维护源码后，重新生成并验证单文件版：

```sh
npm run build:only
npm test
npm run check:only
```

`only/worker.js` 是自动生成的发布文件。修改 `src/` 或 `public/` 后需要重新打包；单文件不会自动读取仓库里的其他文件。`test/only.test.mjs` 会逐个核对内嵌资源，并用同一组数据库和鉴权用例测试单文件版本。

浏览器验收使用本地 Worker 和真实本地 D1。先运行开发服务器和本地示例，再执行：

```sh
npx playwright install chromium
BLOG_TEST_PASSWORD="你的本地管理口令" node test/browser.mjs
```

也可以用 `CHROMIUM_PATH=/path/to/chromium` 指定浏览器。

测试覆盖基础单元/API、单文件资源一致性，以及草稿隔离、发布、键盘保存、版本冲突、回收站、预览错误定位、复制成功/失败、375/768/1440 布局和禁用 JavaScript 阅读的浏览器验收。设计终审提出的两项交互问题已修复并复核。

## 发布说明

本仓库提供可部署源码。远程 D1、Worker 和域名需要在自己的 Cloudflare 账户中配置。

字体、图标和 LeiBox 参考源码保留各自的许可与署名；参见 `public/assets/NOTICE.md`、`public/assets/fonts/*-OFL.txt` 和 `vendor/leibox/README.md`。
