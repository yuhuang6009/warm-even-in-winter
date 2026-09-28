# 冬だが暖かい — Warm Even in Winter

> *Already finding warmth in a noisy world*

一个 AI 学习者的个人网站。站名「冬だが暖かい」（冬日却温暖）即站点气质：在喧嚣世界里已经找到了暖意。

**线上地址：<https://yuhuang6009.github.io/warm-even-in-winter/>**

> ⚠️ 本仓库只装「三站合一」中的**前端首页 SPA**。完整的网站还包含一个 FastAPI 后端，
> 在独立仓库 [`yuhuang6009/AI-Workbench`](https://github.com/yuhuang6009/AI-Workbench)。

---

## 一、整站由三部分组成

| 部分 | 内容 | 技术栈 | 代码位置 | 线上状态 |
| --- | --- | --- | --- | --- |
| ① **前端首页 SPA** | 首页 / 控制台 / 技能档案 | React 18 + Vite + TS | **本仓库** | ✅ 已上线 |
| ② **作品集站** | `/portfolio`、项目页、小暖聊天 | FastAPI + 原生 JS/CSS | `AI-Workbench` 仓库 | ⬜ 未部署 |
| ③ **Workbench** | `/workbench`、天气 / 算力 / 计划 | FastAPI + 原生 JS/CSS | `AI-Workbench` 仓库 | ⬜ 未部署 |

本仓库的构建产物 `dist/` 在完整架构下会被 FastAPI 托管为 `/`，两个部分通过
`VITE_BACKEND_URL` 环境变量拼接（见「构建与部署」）。

---

## 二、本仓库已上线的三个页面

站点用 **HashRouter**，所有路由都是 `#/xxx`，静态托管零配置。

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `#/` | 4 段 AI 生成视频背景可切换（Golden Hour / Still Water / Deep Woods / Quiet Dawn）+ 透明 PNG 火车图层 + WarpText WebGL 文字动效 + 邮件订阅 + 全站页面转场 |
| 控制台 | `#/console` | 全屏《夏日重现》背景 + 玻璃拟态 UI（`liquid-glass` / `glass-panel` / `glass-text`）+ 顶栏账号（localStorage 记忆）+ 登出 + 移动端抽屉导航 |
| 技能档案 | `#/skills` | 手风琴画廊（AccordionGallery，GSAP）展示 **14 组 / 144 个真实技能包**，悬停展开、方向键切换、详情卡片含技能标签墙与可复制安装命令 |

---

## 三、技术栈

- **框架**：React 18 + TypeScript（`tsc -b` 严格构建）
- **构建**：Vite 8 + Oxlint
- **样式**：Tailwind CSS 3 + 手写 CSS（玻璃拟态、动画、响应式）
- **路由**：react-router-dom 7，**HashRouter**（`#/xxx`，静态托管零配置）
- **动效**：
  - *WarpText*：WebGL 文字弯曲 / 透镜 / 波纹 / RGB 折射（原生 ESM + 本地 `vendor/ogl`，非 React 组件）
  - *AccordionGallery*：GSAP 手风琴画廊
- **图标**：lucide-react
- **字体**：Instrument Serif（Google Fonts）+ system-ui 中文

---

## 四、本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（Vite dev server）
npm run lint       # Oxlint 静态检查
npm run build      # 类型检查 + 生产构建 → dist/
npm run preview    # 本地预览构建产物（默认 http://localhost:4173）
```

---

## 五、构建与部署

### 自动部署（当前方式）

推送到 `main` 即由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages：

```
push main → npm ci → npm run build → 上传 dist/ → deploy-pages
```

**改仓库名不需要重新配置**：`vite.config.ts` 里 `base: './'` 是相对路径，产物在任何子目录下都能跑。

### 手动 / 其他平台

因是 HashRouter，**不需要任何服务端 rewrite 配置**，把 `dist/` 原样上传即可：

- **Vercel / Netlify**：构建命令 `npm run build`，发布目录 `dist`
- **本地（Python）**：`cd dist && python -m http.server 8000` → `http://127.0.0.1:8000/#/`
- **本地（Node）**：`npm run preview`（默认 4173 端口）
- **Nginx**：root 指向 `dist/`，无需 `try_files` 重写

### 接入后端时

后端部署好后，构建时注入后端地址，首页导航会自动切换为跳转后端页面：

```bash
VITE_BACKEND_URL=https://你的后端域名 npm run build
```

（在 GitHub Actions 里则加为该 job 的 `env`。）

---

## 六、当前限制（纯静态托管下）

本仓库目前只做了纯静态部署，以下功能**有意未接入**：

- **首页导航只有 2 个入口**（作品集 → `#/skills`、工作台 → `#/console`）。
  后端的 `/portfolio`、`/workbench` 等尚未部署，指向它们会 404，故暂不放。
  后端上线后把 `Home.tsx` 的 `NAV_LINKS` 改回 `${BACKEND}/...` 即可——
  `go()` 按 `href.startsWith('#')` 分流，两种跳转都支持。
- **邮件订阅**调用 `POST /api/early-access`，纯静态下该接口不存在会 404，
  前端已兜底显示错误态，属占位演示；接入真实后端后无需改前端。
- **控制台「设置」页**为建设中占位。

---

## 七、技能数据维护（重要）

`src/data/skills.ts` 由 `scripts/gen-skills.mjs` **自动生成**，**不要手改**。
它扫描本机 `~/.claude/skills` 的真实技能包，按 14 条正则规则分组，
并挑出带 `github` frontmatter 的技能作为该组来源链接。

新增 / 删除本机技能后重新生成：

```bash
node scripts/gen-skills.mjs   # 重新扫描并写回 src/data/skills.ts
npm run build                 # 重新构建
```

分组规则、图片循环、frontmatter 解析（含折叠多行 description）都在脚本里，改分组前先读脚本。

---

## 八、目录结构

```
.
├─ index.html                     # 入口 HTML（字体预连接 + favicon）
├─ src/
│  ├─ main.tsx                    # React 挂载入口
│  ├─ App.tsx                     # HashRouter 路由（/  /console  /skills）
│  ├─ index.css                   # Tailwind + 玻璃拟态 + WarpText 撑高 + 转场遮罩
│  ├─ warp-text.js                # WarpText 原生 ESM 模块（data-warp-text 自动初始化）
│  ├─ vendor/ogl/                 # 本地裁剪的 OGL（WebGL 库，ESM 源码）
│  ├─ assets/                     # 图片（技能封面 1015/1018/1039/1043、summer.jpg 等）
│  ├─ components/
│  │  ├─ AccordionGallery.tsx     # GSAP 手风琴画廊组件
│  │  └─ AccordionGallery.css     # 组件配套 CSS
│  ├─ data/skills.ts              # 技能数据（脚本自动生成，勿手改）
│  └─ pages/
│     ├─ Home.tsx                 # 首页
│     ├─ Console.tsx              # 控制台
│     └─ Skills.tsx + skills.css  # 技能档案页
├─ scripts/gen-skills.mjs         # 扫描 ~/.claude/skills 重新生成技能数据
├─ public/                        # favicon.svg、icons.svg
├─ docs/CORE_FILES.md             # 核心文件现状 + 「不该犯的错」清单（维护前必读）
├─ REACT_BITS_NOTES.md            # WarpText 移植踩坑全记录（必读）
└─ .github/workflows/deploy.yml   # GitHub Pages 自动部署
```

---

## 九、关键实现说明

### 页面转场

全站统一使用固定定位的 `page-transition` 遮罩：进入页面淡出、点击跳转前淡入（420ms），
并由 `pageshow`（bfcache）事件兜底，避免浏览器前进 / 后退残留黑屏。

### WarpText（WebGL 文字）

- 以**原生 ESM + data 属性**方式集成（`data-warp-text` / `data-text`），React 只负责挂载，
  动效层完全独立自管理——因为 WarpText 会清空元素文本、注入 canvas、直接改 class，与 React 重渲染天然冲突。
- 切换 Deep Woods 深色场景时，等待 `transition-colors`（700ms）结束后延迟 800ms 调
  `window.warpText.refreshColors()` 刷新纹理颜色。
- 所有踩坑（文本塌陷、class 被 React 覆盖、字体时机、单位换算、上下文丢失等）详见 **`REACT_BITS_NOTES.md`**。

### AccordionGallery（技能档案）

- 直接使用 React Bits 的 JS+CSS 变体，依赖仅 `gsap`；本站扩展了 `content` 字段（展开时显示详情卡片）、
  `active=null`（再次点击收起）、渐变占位、移动端自动变纵向。
- Skills 页以 `trigger="hover"` 悬停展开，`← →` 方向键 / Tab+Enter 键盘可达。

---

## 十、相关仓库与文档

- **后端仓库**：[`yuhuang6009/AI-Workbench`](https://github.com/yuhuang6009/AI-Workbench)
  —— FastAPI 后端（作品集站 + Workbench + 全部 API）
- **`docs/CORE_FILES.md`** —— 核心文件现状 + 「不该犯的错」清单（维护网站前建议先读）
- **`REACT_BITS_NOTES.md`** —— WarpText 从 React Bits 移植的完整踩坑记录与验证方法论
