# 核心文件现状（Core Files Status）

> 更新日期：2026-08-26 ｜ HEAD：`8673d54`
>
> 给维护 / 接手本网站的人看的「每个核心文件是什么、什么状态、动它要小心什么」，
> 以及从历史踩坑里总结的「不该犯的错」清单。动手改代码前建议先通读一遍。

---

## 一、总览

| 文件 | 职责 | 状态 |
| --- | --- | --- |
| `index.html` | HTML 入口：字体预连接、favicon、`<div id="root">` | ✅ 稳定 |
| `vite.config.ts` | Vite 配置（仅 react 插件） | ✅ 稳定 |
| `src/main.tsx` | React 挂载（StrictMode） | ✅ 稳定 |
| `src/App.tsx` | HashRouter + 三路由（`/` `/console` `/skills`） | ✅ 稳定 |
| `src/index.css` | Tailwind + 玻璃拟态 + WarpText 撑高 + 转场遮罩 + 动画 | ✅ 稳定（撑高数字勿乱改） |
| `src/warp-text.js` | WarpText 原生 ESM 模块（WebGL 文字动效） | ✅ 稳定（见「不该犯的错」） |
| `src/vendor/ogl/` | 本地 OGL WebGL 库（ESM 源码，未走 npm） | ✅ 可用（体积待裁剪） |

| `src/pages/Home.tsx` | 首页（视频背景 + WarpText + 订阅 + 转场） | ✅ 稳定（导航已改为站内路由） |
| `src/pages/Console.tsx` | 工作台（玻璃 UI + 账号 + 登出） | ✅ 稳定（设置页为占位） |
| `src/pages/Skills.tsx` + `skills.css` | 技能档案（AccordionGallery） | ✅ 稳定 |
| `src/components/AccordionGallery.tsx` + `.css` | GSAP 手风琴画廊 | ✅ 稳定（相对原版有扩展） |
| `src/data/skills.ts` | 技能数据（14 组 / 144 包） | ⚠️ 自动生成，勿手改 |
| `scripts/gen-skills.mjs` | 扫描 `~/.claude/skills` 重新生成数据 | ✅ 可用 |
| `REACT_BITS_NOTES.md` | WarpText 移植踩坑笔记 | ✅ 必读 |
| `README.md` | 网站完整 Readme（功能 / 部署 / 维护） | ✅ 当前 |

---

## 二、各核心文件详述

### 1. 路由与入口（App.tsx / main.tsx / index.html）

- 使用 **HashRouter**，所以地址是 `#/`、`#/console`、`#/skills`——静态托管零配置，不需要 rewrite。
- `main.tsx` 用了 StrictMode（开发期 effect 会双跑，WarpText 的动态 import 已做幂等处理）。
- `index.html` 标题为「冬だが暖かい — Warm Even in Winter」，字体 Instrument Serif（Google Fonts 预连接）。

### 2. 首页 Home.tsx

- 4 段 CloudFront AI 视频做背景，交叉淡入（1s），透明 PNG 火车图层带 `train-bob` 上下浮动。
- WarpText 只作用于 **h1 和 hero 描述**两个元素；底部统计条等普通文字**不要**再加 `data-warp-text`（见坑 9）。
- 场景换肤：切到 Deep Woods（activeVideo === 2）文字变深蓝 `#182C41`，延迟 **800ms** 再 `refreshColors()`（见坑 4）。
- 邮箱订阅 → `POST /api/early-access`（占位接口，纯静态托管下 404 走错误态）。
- 订阅成功后按钮变「登录」，账号存 `localStorage['lumora.user']`，进入 `#/console`。

- ✅ `NAV_LINKS` 与「进入工作台」走站内路由（HashRouter）：作品集 → `#/skills`，工作台 → `#/console`，**仅 2 个入口**——后端未部署时 `/portfolio`、`/workbench` 会 404，故暂不放。`href` 带 `#` 前缀，JS 未执行或中键新标签打开也不会 404。后端上线后把 `NAV_LINKS` 改回 `${BACKEND}/...` 即可。

### 3. 控制台 Console.tsx

- 全屏《夏日重现》背景（`src/assets/summer.jpg`）+ `bg-black/15` 暗化，保证玻璃文字可读且透图。
- 玻璃体系：`liquid-glass`（胶囊 / 边框）、`glass-panel`（面板）、`glass-text`（文字）——都定义在 `src/index.css`。
- 顶栏显示 `localStorage['lumora.user'] || '访客'`，登出时清除 localStorage 并回首页。
- 「我的 Skills」跳 `#/skills`；「设置」是建设中占位。

### 4. Skills 技能档案页（Skills.tsx + skills.css）

- 用 `AccordionGallery`：`trigger="hover"`（悬停展开）、`expandRatio=0.58`、`height=540`、紫色 accent。
- 14 组数据来自 `src/data/skills.ts`（脚本生成），`TOTAL_SKILLS` 实时汇总。
- 详情卡片（`.ag-card`）在 `skills.css`：技能标签墙可滚动、安装命令块点击复制、来源链接（有 github 才渲染成链接，否则纯文本）。

### 5. AccordionGallery（组件）

- React Bits 的 JS+CSS 变体 + GSAP。相对原版扩展了：
  - `content?: ReactNode` 详情面板（blur 卡片，内部可滚动，`stopPropagation` 防止触发收起）；
  - `active` 支持 `null`：再次点击当前面板可收起；
  - `gradient` 渐变占位（无图时使用）；
  - 移动端 `@media (max-width: 520px)` 自动切纵向堆叠。
- 实现：`ResizeObserver` 测容器 → 设 `--ag-media-size` → `gsap.timeline()` 布局，首次渲染不播动画。

### 6. WarpText（warp-text.js + vendor/ogl）

- 原生 ESM：模块加载即扫描 `[data-warp-text]` 自动初始化；`window.warpText` 暴露全局 API（`setTextFor` / `refreshColors` / `getInstances`）。
- 依赖本地 `vendor/ogl`（ESM 源码 + 相对路径导入），未走 npm（坑 10）。
- 关键防御：`MutationObserver` 守护 `warp-text` class，防止 React 重渲染覆盖 className 导致塌陷（坑 3）。
- 撑高 CSS 在 `index.css`：`.warp-text { min-height: 2.82em }`、`.hero-desc.warp-text { min-height: 8.5em }`——**em 单位**跟随响应式字号类，各级断点天然正确，勿写死 px。

### 7. 技能数据（data/skills.ts + gen-skills.mjs）

- `src/data/skills.ts` 首行注明「自动生成，勿手改」，来源 `C:\Users\huang\.claude\skills`（144 个包）。
- 重新生成：`node scripts/gen-skills.mjs`。分组是 **14 条正则规则按顺序命中**，未命中落入兜底「效率小工具」。
- 4 张封面图（1015 / 1018 / 1039 / 1043）循环分配。

---

## 三、「不该犯的错」清单（按重要性排序）

> 每一条都是真踩过 / 可预见的坑。动手前先对照。

1. **React 重渲染覆盖动效组件的 class / style（最严重）**
   - 防御（从推荐到兜底）：a) MutationObserver 守护自己的 class；b) 用 inline style（React 只 diff 自己管理的 style 键）；c) 动效组件走原生 ESM + data 属性，React 只负责挂载（本站采用，最省心）。
2. **把不该套动效的文字也加上 `data-warp-text`**
   - 底部统计行加过，文字和布局全乱。WarpText 只用于 h1 和 hero 描述两个元素。
3. **切换场景后取到过渡中间色**
   - `transition-colors duration-700`，600ms 时刷新会读到过渡中间色；必须等过渡彻底完成（800ms）再 `refreshColors()`。
4. **文本清空后元素塌陷**
   - WarpText 接管时 `textContent = ''`，必须用 `.warp-text` 的 `min-height`（em 单位）撑高；数字按「行数 × 行高 ÷ 0.78」先算清楚，别拍脑袋。
5. **字体没就绪就光栅化**
   - 必须 `await document.fonts.ready`，否则用 fallback 字体生成纹理，字会「变」。
6. **行高单位混用**
   - 相对行高（`1.1` / `1.1em`）是相对字号的值，要乘 fontSizePx 换算；先判断 `computed.lineHeight` 是否以 `px` 结尾再处理。


7. ~~**首页导航仍指向旧站路由**~~（已修复）
   - 旧站 `/portfolio*`、`/workbench` 在本 SPA 中不存在。已改为站内路由（作品集 → `#/skills`、工作台 → `#/console`）；`go()` 按 `href.startsWith('#')` 分流——`#` 开头走 `navigate()`（SPA 站内），其余整页跳转（后端页面）。后端上线后把 `NAV_LINKS` 改回 `${BACKEND}/...` 即可，`go()` 两种都支持。
8. **邮件订阅没后端**
   - `POST /api/early-access` 在纯静态托管下 404。前端已兜底显示错误态；接入真实后端后无需改前端。
9. **WebGL 上下文丢失不处理**
   - 必须监听 `webglcontextlost` 暂停 RAF；`destroy()` 时 `loseContext()` 释放 GPU 资源。
10. **本地依赖走 npm 有兼容坑**
    - OGL 直接本地 vendor 化（ESM 源码 + 相对路径导入），别改回 npm 版。
11. **初始化时机竞态**
    - WarpText 靠 App.tsx 动态 `import('./warp-text.js')` 保证 DOM 就绪；`ResizeObserver` 监听容器尺寸变化自动重光栅化。
12. **手改自动生成文件**
    - `src/data/skills.ts` 是脚本产物；要改数据改 `scripts/gen-skills.mjs` 的规则后重新生成，别直接编辑（重新生成会覆盖你的改动）。

---

## 四、部署现状（2026-08-26 核查）

- 仓库：`D:\Claude Project\learning for myself\vibecoding\lumora`，git 干净，HEAD `8673d54`。
- 构建：`npm run build`（`tsc -b` + Vite 8）✅ 通过，产物在 `dist/`。
- 端口 8000：**当前无服务**（曾有临时静态服务器，会话结束后已停；该端口现被本机 KuGou 占用但不响应 HTTP）。
- 部署建议：HashRouter 无需 rewrite，上传 `dist/` 到任意静态托管即可；或 `cd dist && python -m http.server 8000`（详见 `README.md` 的「构建与部署」）。
