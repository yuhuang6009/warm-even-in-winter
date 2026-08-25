# React Bits 组件移植笔记（WarpText 踩坑全记录）

> 网站：lumora（React 18 + Vite + Tailwind CSS 3）
> 组件来源：https://www.reactbits.dev/（免费提示词 / Copy & Paste 代码）
> 本文件记录 WarpText 移植全过程与所有踩坑，供后续移植其他组件时参考。

## 一、WarpText 是什么

文字渲染为 WebGL 纹理 → fbm 噪声流动弯曲 + 指针透镜放大 + 波纹涟漪 + RGB 玻璃色差折射。

- 依赖：OGL（轻量 WebGL 库），本地 `src/vendor/ogl`（ESM 源码，未走 npm）
- 本站以**原生 ESM + data 属性**方式集成（`data-warp-text`），而不是 React 组件形式
  - 原因：WarpText 要清空元素文本、注入 canvas、直接操作 class，React 重渲染会与它冲突（见坑3）
  - 所以让 React 只管挂载，动效层完全独立自管理

## 二、当前架构（如何工作的）

- `src/warp-text.js`：原生 ESM 模块，`document.querySelectorAll('[data-warp-text]')` 自动初始化
- 元素用法：
  ```html
  <h1 data-warp-text data-text="第一行&#10;第二行">fallback 文本</h1>
  ```
- `App.tsx` 动态加载：`import('./warp-text.js')`（副作用式，模块自己扫描初始化）
- 场景换肤联动：`MutationObserver` 监听 `body[data-scene]` → 调 `window.warpText.refreshColors()`
- 全局 API：`window.warpText.{ setTextFor, refreshColors, getInstances }`

## 三、踩坑清单（按重要性排序）

### 坑3（最严重）：React 重渲染覆盖 className，抹掉 warp-text 类 → 布局错位
- **现象**：切到 Deep Woods（`darkMode=true`）后，h1/描述的 rect 变成 `[x, y, 0, 0]`，订阅表单、场景切换器全部上移挤成一团
- **根因**：
  1. WarpText 清空文本后靠 `.warp-text` 类的 `min-height` 撑高（见坑1）
  2. `warp-text` 类是 WarpText 用 `el.classList.add('warp-text')` 直接加到 DOM 的
  3. React 重渲染时用**它自己记录的 className 整体覆盖真实 DOM 的 className**
     （`el.className = newString`），把 `warp-text` 抹掉了
  4. 类没了 → 撑高 CSS 失效 → 元素塌陷为 0x0
- **定位方法**：Playwright 打印切换前后元素的 `className + offsetHeight + rect`，
  对比发现 `warp-text` 类消失
- **修复**：WarpText 内加 MutationObserver 守护类，被抹掉就立即补回
  （MutationObserver 在浏览器绘制前的微任务阶段执行，**无闪烁**）：
  ```js
  this._classGuard = new MutationObserver(() => {
    if (!el.classList.contains('warp-text')) el.classList.add('warp-text')
  })
  this._classGuard.observe(el, { attributes: true, attributeFilter: ['class'] })
  // destroy() 时记得 this._classGuard?.disconnect()
  ```
- **通用教训**：**任何直接操作宿主元素 class / style / children 的动效组件，
  放进 React 都会被 React 的 reconciliation 覆盖**。防御手段（从推荐到兜底）：
  a) 用 MutationObserver 守护自己的 class；
  b) 用 inline style（React 只 diff 自己管理的 style 键，不会删别人的键）；
  c) 干脆原生 ESM + data 属性初始化，React 只负责挂载（本站采用，最省心）。

### 坑1：元素文本被清空后塌陷为 0x0
- **现象**：WarpText 接管时 `el.textContent = ''`，flex 布局下 h1/p 高度塌陷
- **修复**：`src/index.css` 撑高规则：
  ```css
  .warp-text { position: relative; display: block; width: 100%; min-height: 2.82em; }
  .hero-desc.warp-text { min-height: 8.5em; }
  ```
- **换算**（写死这个数字前先算清楚）：
  - h1：两行文字 2 × 行高1.1em = 2.2em，÷ 纹理最大占比 0.78 ≈ 2.82em
  - 描述：4 行 × 行高1.625 = 6.5em，÷ 0.78 ≈ 8.3em，取 8.5em 保证 16px 原字号
- **要点**：min-height 用 **em**（基于元素自身字号），正好跟随 Tailwind
  响应式字号类（`text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem]`），天然适配各级断点。

### 坑4：refreshColors 取到过渡中间色
- **现象**：切 Deep Woods 后纹理颜色 `rgb(29,49,69)` 与 computedColor `rgb(24,44,65)` 不一致（偏浅）
- **根因**：`transition-colors duration-700`，而 refreshColors 在 600ms 时执行，读到过渡中间色
- **修复**：延迟改为 **800ms**（等 700ms 过渡彻底完成后刷新）。

### 坑9：别把不该套效果的统计条/普通文字也加上 data-warp-text
- **现象**：底部 stats 行（"4 Open Source Projects …"）也加了 data-warp-text，文字和布局全乱
- **修复**：移除，WarpText 只用于 h1 和 hero 描述两个元素。

### 坑5：文本宽度溢出容器
- 长英文句子（描述）可能超宽 → `wrapLine` 按单词自动换行；
  `maxWidth = width × 0.86`，`fit = min(1, maxWidth/最宽行, maxHeight/总行高)`，必要时整体缩放字号。

### 坑6：字体加载时机
- 必须在光栅化前 `await document.fonts.ready`，否则用 fallback 字体生成纹理，字体会「变」。

### 坑7：行高单位换算
- 相对行高（`1.1` / `1.1em`）是相对字号的值，要乘 fontSizePx 换算成 px；
  判断 `computed.lineHeight` 是否以 `px` 结尾，非 px 则换算。

### 坑2：撑高 CSS 依赖字号语义
- 见坑1，em 单位 + 响应式字号类 = 每个断点高度自动正确；不要写死 px。

### 坑8：WebGL 上下文丢失
- 监听 `webglcontextlost` → 暂停 RAF；`destroy()` 时 `loseContext()` 释放 GPU 资源。

### 坑10：本地 OGL 依赖
- npm 上的 ogl 与 ESM/Vite 结合有版本兼容风险 → 直接把 OGL ESM 源码放进
  `src/vendor/ogl`，用相对路径导入（`import { Renderer, ... } from './vendor/ogl/src/index.js'`）。
- 注意体积：OGL 带 GLTF 等大量未用模块，后续可做 tree-shake / 按需裁剪。

### 坑11：初始化时机竞态
- 模块在 `DOMContentLoaded` 或立即执行 `initAll()`；App.tsx 用动态 import 保证 DOM 已就绪。
- `ResizeObserver` 监听容器尺寸 → 响应式字号 / 换肤时自动重光栅化。

## 四、验证方法论（很重要）

- 用 **Playwright（channel: 'msedge'）headless 诊断脚本**直接读 DOM：
  - 元素 `rect / offsetHeight / className / canvas 尺寸 / 纹理 ink（canvas 像素 alpha 统计）`
  - 对比**切换场景前后**所有元素 rect，任何变化即布局漂移
- **桌面 + 移动端双视口**验证（1440×900 / 375×812）
- 脚本位于 `workstation/ai-workbench/`：
  - `diag-dom.js` 单页 DOM 快照
  - `repro-deepwoods.js` 复现 Deep Woods 切换的布局/颜色问题
  - `verify-warp.js` WarpText 接管状态检查
  - `verify-scenes.js` 全场景 × 双视口布局稳定性回归
- 本地静态服务器：`http://127.0.0.1:8000`（或 vite dev / preview）

## 五、下次从 React Bits 移植新组件 Checklist

1. **拿全材料**：组件代码（Copy & Paste）+ 它要求的依赖（framer-motion、tw-animate-css、
   lucide 图标等）——只给组件代码不够，配套 CSS/依赖漏了必炸
2. **核对技术栈**：React 18 + Vite + Tailwind 3 与 React Bits 完全兼容，可直用
3. 组件文件放 `src/components/`（或对应目录）
4. **配套 CSS 别漏**：React Bits 很多组件要 `tw-animate-css` 或在 `index.css`
   手动补 @keyframes（如菜单入场动画）
5. 图标用 lucide-react（本站已装）
6. **直接操作 DOM 的组件**（WarpText / Spotlight / GlareCard / Tilt 等）：
   默认会用 React 包一层，注意 class/style 被覆盖问题，参照坑3 的防御手段
7. 大依赖库（OGL / three / GSAP）优先本地 vendor 裁剪，控制 bundle 体积
8. 响应式 + `prefers-reduced-motion` + 移动端验证（坑8 的上下文丢失同理）
9. `npm run build` 通过 + Playwright 双视口回归（第四节脚本套路）
