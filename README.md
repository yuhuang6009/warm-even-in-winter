# 冬だが暖かい — Warm Even in Winter

> 一个 AI 学习者的个人网站。有动漫风格的沉浸式首页、功能完整的工作台（控制台）、
> 以及把本机真实安装的 Claude Skills 全部搬上网页的「技能档案」页。

网站标题「冬だが暖かい」（冬日却温暖）即站点气质：在喧嚣世界里已经找到了暖意。
首页副标题：*Already finding warmth in a noisy world*。

## 功能总览

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `#/` | 四段 AI 生成视频背景可切换（Golden Hour / Still Water / Deep Woods / Quiet Dawn）+ 透明 PNG 火车图层 + WarpText WebGL 文字动效 + 邮件订阅 + 全站页面转场 |
| 工作台 / 控制台 | `#/console` | 全屏《夏日重现》背景 + 玻璃拟态 UI（liquid-glass / glass-panel / glass-text）+ 顶栏账号（localStorage 记忆）+ 登出 + 移动端抽屉导航 |
| Skills 技能档案 | `#/skills` | 手风琴画廊（AccordionGallery，GSAP）展示 **14 组 / 144 个真实技能包**，悬停展开、方向键切换、详情卡片含技能标签墙与可复制安装命令 |

## 技术栈

- **框架**：React 18 + TypeScript（`tsc -b` 严格构建）
- **构建**：Vite 8 + Oxlint
- **样式**：Tailwind CSS 3 + 手写 CSS（玻璃拟态、动画、响应式）
- **路由**：react-router-dom 7，**HashRouter**（`#/xxx`，静态托管零配置）
- **动效**：
  - WarpText：WebGL 文字弯曲 / 透镜 / 波纹 / RGB 折射（原生 ESM + 本地 `vendor/ogl`，非 React 组件）
  - AccordionGallery：GSAP 手风琴画廊
- **图标**：lucide-react
- **字体**：Instrument Serif（Google Fonts）+ system-ui 中文

## 项目结构

```
lumora/
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
│     ├─ Console.tsx              # 工作台 / 控制台
│     └─ Skills.tsx + skills.css  # 技能档案页
├─ scripts/
│  └─ gen-skills.mjs              # 扫描 ~/.claude/skills 重新生成技能数据
├─ public/                        # favicon.svg、icons.svg
├─ REACT_BITS_NOTES.md            # WarpText 移植踩坑全记录（必读）
└─ docs/CORE_FILES.md             # 核心文件现状 + 「不该犯的错」清单
```

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（Vite dev server）
npm run lint       # Oxlint 静态检查
npm run build      # 类型检查 + 生产构建 → dist/
npm run preview    # 本地预览构建产物（默认 http://localhost:4173）
```

## 构建与部署

### 1. 构建

```bash
npm run build
```

产物在 `dist/`（纯静态 SPA：`index.html` + assets）。当前构建已验证通过（`tsc -b` + Vite 8，约 12s）。

### 2. 部署（任选其一）

因为是 **HashRouter**，所有路由都是 `#/xxx` 的 hash，**不需要任何服务端 rewrite 配置**，上传 `dist/` 即可。

- **Vercel / Netlify / GitHub Pages**：构建命令 `npm run build`，发布目录 `dist`，零额外配置。
- **本地 / 内网（Python）**：
  ```bash
  cd dist
  python -m http.server 8000
  # 访问 http://127.0.0.1:8000/#/
  ```
- **本地（Node）**：`npm run preview`（Vite preview，默认 4173 端口）。
- **Nginx**：root 指向 `dist/`，无需 try_files 重写（hash 路由）。

### 3. 部署注意事项

- 首页订阅按钮调用 `POST /api/early-access`；**纯静态托管下该接口不存在会返回 404**，前端已兜底显示错误态，属占位演示，接入真实后端后无需改前端逻辑。
- 首页导航（作品集 / 工作台 / 项目 / 聊天）当前仍指向旧站路由（`/portfolio*`、`/workbench`），在纯 lumora 托管下这些地址不存在。若全面切换，需在 `Home.tsx` 的 `NAV_LINKS` 与移动菜单中改为站内路由。

## 技能数据维护（重要）

`src/data/skills.ts` 由 `scripts/gen-skills.mjs` **自动生成**，**不要手改**。它扫描本机 `~/.claude/skills` 的真实技能包，按 14 条正则规则分组，并挑出带 `github` frontmatter 的技能作为该组来源链接。

新增 / 删除本机技能后重新生成：

```bash
node scripts/gen-skills.mjs   # 重新扫描并写回 src/data/skills.ts
npm run build                 # 重新构建
```

分组规则、图片循环、frontmatter 解析（含折叠多行 description）都在脚本里，改分组前先读脚本。

## 关键实现说明

### 页面转场

全站统一使用固定定位的 `page-transition` 遮罩：进入页面淡出、点击跳转前淡入（420ms），并由 `pageshow`（bfcache）事件兜底，避免浏览器前进 / 后退残留黑屏。

### WarpText（WebGL 文字）

- 以**原生 ESM + data 属性**方式集成（`data-warp-text` / `data-text`），React 只负责挂载，动效层完全独立自管理——因为 WarpText 会清空元素文本、注入 canvas、直接改 class，与 React 重渲染天然冲突。
- 切换 Deep Woods 深色场景时，等待 `transition-colors`（700ms）结束后延迟 800ms 调 `window.warpText.refreshColors()` 刷新纹理颜色。
- 所有踩坑（文本塌陷、class 被 React 覆盖、字体时机、单位换算、上下文丢失等）详见 **`REACT_BITS_NOTES.md`**。

### AccordionGallery（技能档案）

- 直接使用 React Bits 的 JS+CSS 变体，依赖仅 `gsap`；本站扩展了 `content` 字段（展开时显示详情卡片）、`active=null`（再次点击收起）、渐变占位、移动端自动变纵向。
- Skills 页以 `trigger="hover"` 悬停展开，`← →` 方向键 / Tab+Enter 键盘可达。

## 已知限制 / 后续计划

- [ ] 邮件订阅接入真实后端（当前为占位 API）
- [ ] 首页导航改为站内路由（移除旧站 `/portfolio*` 链接）
- [ ] Console「设置」页为建设中占位
- [ ] OGL 含大量未用模块，可 tree-shake 减小体积（约 63KB / gzip 18.8KB）

## 相关文档

- `docs/CORE_FILES.md` — 核心文件现状 + 「不该犯的错」清单（维护网站前建议先读）
- `REACT_BITS_NOTES.md` — WarpText 从 React Bits 移植的完整踩坑记录与验证方法论
- `Accordion Gallery.md`（上级目录）— AccordionGallery 原始提示词 / 源码 / 属性表

---

*构建信息（2026-08-26）*：HEAD `8673d54`，`npm run build` 通过，产物为 index.html + 4 张技能封面 + summer.jpg + CSS + warp-text chunk + 主 bundle。
