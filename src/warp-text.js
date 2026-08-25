/* ============================================================
   WarpText —— 原生 ESM 移植版
   移植自 React Bits 的 WarpText（JavaScript + CSS 变体）
   效果：文字渲染为 WebGL 纹理 → fbm 流动弯曲 + 指针透镜放大
        + 波纹涟漪 + RGB 玻璃色差折射
   依赖：本地 vendor/ogl（ESM 版）
   用法：
     <h1 data-warp-text data-text="第一行&#10;第二行">fallback</h1>
   可选 data 属性：
     data-text           文本（含 \n 换行）
     data-color          文字颜色（默认继承 CSS color）
     data-warp-strength  环境弯曲强度
     data-warp-scale     弯曲单元尺度
     data-speed          流动速度
     data-pointer-influence  指针影响半径
     data-pointer-strength   指针弯曲强度
     data-refraction     RGB 色差强度
     data-ripple         "false" 关闭波纹
     data-line-height    覆盖行高
     data-letter-spacing 覆盖字距
     data-font-size / data-font-weight / data-font-family
     data-max-width      文字最大宽度比例（默认 0.86）
     data-max-height     文字最大高度比例（默认 0.78）
   全局 API：window.warpText
     setTextFor(el, text)  更新某元素文本纹理
     refreshColors()       按当前 CSS 颜色刷新
     getInstances()
   ============================================================ */
import { Renderer, Program, Mesh, Triangle, Texture } from './vendor/ogl/src/index.js';

/* ---------------- Shaders（与 React Bits 原版一致） ---------------- */
const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
vUv = uv;
gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;
in vec2 vUv;
out vec4 fragColor;
float hash(vec2 p) {
p = fract(p * vec2(123.34, 456.21));
p += dot(p, p + 45.32);
return fract(p.x * p.y);
}
float noise(vec2 p) {
vec2 i = floor(p);
vec2 f = fract(p);
vec2 u = f * f * (3.0 - 2.0 * f);
float a = hash(i);
float b = hash(i + vec2(1.0, 0.0));
float c = hash(i + vec2(0.0, 1.0));
float d = hash(i + vec2(1.0, 1.0));
return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
float value = 0.0;
float amplitude = 0.5;
for (int i = 0; i < 4; i++) {
value += amplitude * noise(p);
p *= 2.02;
amplitude *= 0.5;
}
return value;
}
vec4 sampleText(vec2 uv) {
if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
return vec4(0.0);
}
return texture(uTextTexture, uv);
}
void main() {
vec2 uv = vUv;
float aspect = uResolution.x / max(uResolution.y, 1.0);
float time = uTime * uSpeed;
float scale = max(uWarpScale, 0.001);
vec2 drift = vec2(time * 0.055, -time * 0.045);
float n1 = fbm(uv * scale * 3.1 + drift);
float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;
vec2 pointerDelta = uv - uPointer;
vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
float dist = length(aspectDelta);
float radius = max(uPointerInfluence, 0.001);
float t = clamp(dist / radius, 0.0, 1.0);
float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);
float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
float rippleRing = (rippleWave - 0.5) * uRipple;
vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;
vec2 displaced = uv + ambient + pointerWarp;
vec2 splitDir = ambient + pointerWarp;
float splitLen = length(splitDir);
splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);
vec4 base = sampleText(displaced);
float r = sampleText(displaced + split).r;
float g = base.g;
float b = sampleText(displaced - split).b;
float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);
vec3 color = vec3(r, g, b) + lens * base.a * 0.055;
fragColor = vec4(color, a);
}
`;

/* ---------------- 文字纹理绘制 ---------------- */
const getFontValue = (value) => (typeof value === 'number' ? `${value}px` : value);

const measureLine = (ctx, line, letterSpacing) => {
  const chars = Array.from(line);
  const textWidth = chars.reduce((width, char) => width + ctx.measureText(char).width, 0);
  return textWidth + Math.max(0, chars.length - 1) * letterSpacing;
};

const drawLine = (ctx, line, x, y, letterSpacing) => {
  const chars = Array.from(line);
  let cursor = x - measureLine(ctx, line, letterSpacing) / 2;
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing);
  });
};

const buildTextCanvas = ({ container, width, height, dpr, props }) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const probe = document.createElement('span');
  probe.textContent = props.text || '';
  Object.assign(probe.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    inset: '0 auto auto 0',
    fontFamily: props.fontFamily,
    fontSize: getFontValue(props.fontSize),
    fontWeight: String(props.fontWeight),
    letterSpacing: getFontValue(props.letterSpacing),
    lineHeight: typeof props.lineHeight === 'number' ? String(props.lineHeight) : props.lineHeight,
  });
  container.appendChild(probe);
  const computed = window.getComputedStyle(probe);
  let fontSizePx = parseFloat(computed.fontSize) || 96;
  const fontFamily = computed.fontFamily || 'sans-serif';
  const fontWeight = computed.fontWeight || String(props.fontWeight);
  let letterSpacing = computed.letterSpacing === 'normal' ? 0 : parseFloat(computed.letterSpacing) || 0;
  let lineHeight = parseFloat(computed.lineHeight);
  if (Number.isFinite(lineHeight)) {
    // CSS 无单位/相对行高（如 1.1、1.1em）是相对字号的值，需换算为像素
    if (!computed.lineHeight.endsWith('px')) lineHeight *= fontSizePx;
  } else {
    lineHeight = fontSizePx * (typeof props.lineHeight === 'number' ? props.lineHeight : 0.92);
  }
  probe.remove();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = props.color;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const lines = String(props.text || '').split('\n');
  const applyFont = () => {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  };
  applyFont();

  const maxWidth = width * (props.maxWidthRatio ?? 0.86);
  const maxHeight = height * (props.maxHeightRatio ?? 0.78);
  const align = props.textAlign === 'left' ? 'left' : 'center';

  // 按单词自动换行，避免溢出容器
  const wrapLine = (line) => {
    if (measureLine(ctx, line, letterSpacing) <= maxWidth) return [line];
    const words = line.split(/\s+/).filter(Boolean);
    const out = [];
    let cur = '';
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (cur && measureLine(ctx, test, letterSpacing) > maxWidth) {
        out.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
    return out;
  };
  const wrapped = [];
  for (const line of lines) wrapped.push(...wrapLine(line));

  const widest = Math.max(...wrapped.map((line) => measureLine(ctx, line, letterSpacing)), 1);
  const blockHeight = Math.max(lineHeight * wrapped.length, 1);
  const fit = Math.min(1, maxWidth / widest, maxHeight / blockHeight);
  if (fit < 1) {
    fontSizePx *= fit;
    letterSpacing *= fit;
    lineHeight *= fit;
    applyFont();
  }

  const startY = height / 2 - (lineHeight * (wrapped.length - 1)) / 2;
  wrapped.forEach((line, index) => {
    const lineX = align === 'left' ? width * 0.07 + measureLine(ctx, line, letterSpacing) / 2 : width / 2;
    drawLine(ctx, line, lineX, startY + index * lineHeight, letterSpacing);
  });
  return canvas;
};

/* ---------------- 默认参数（与 React Bits 一致） ---------------- */
const DEFAULTS = {
  text: null,
  color: null,
  warpStrength: 0.08,
  warpScale: 1.7,
  speed: 0.55,
  pointerInfluence: 0.42,
  pointerStrength: 0.38,
  refraction: 0.018,
  ripple: true,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit',
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  maxWidthRatio: 0.86,
  maxHeightRatio: 0.78,
};

const FLOAT_ATTRS = ['warpStrength', 'warpScale', 'speed', 'pointerInfluence', 'pointerStrength', 'refraction'];

const parseOptions = (el, user = {}) => {
  const d = el.dataset;
  const opts = { ...DEFAULTS, ...user };
  if (d.text) opts.text = d.text;
  if (d.color) opts.color = d.color;
  for (const key of FLOAT_ATTRS) {
    if (d[key] !== undefined && d[key] !== '') opts[key] = parseFloat(d[key]);
  }
  if (d.ripple !== undefined) opts.ripple = d.ripple !== 'false';
  if (d.lineHeight !== undefined && d.lineHeight !== '') opts.lineHeight = parseFloat(d.lineHeight);
  if (d.letterSpacing !== undefined && d.letterSpacing !== '') opts.letterSpacing = d.letterSpacing;
  if (d.fontSize) opts.fontSize = d.fontSize;
  if (d.fontWeight) opts.fontWeight = d.fontWeight;
  if (d.fontFamily) opts.fontFamily = d.fontFamily;
  if (d.maxWidthRatio !== undefined && d.maxWidthRatio !== '') opts.maxWidthRatio = parseFloat(d.maxWidthRatio);
  if (d.maxHeightRatio !== undefined && d.maxHeightRatio !== '') opts.maxHeightRatio = parseFloat(d.maxHeightRatio);
  if (!opts.text) opts.text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  if (!opts.color) opts.color = getComputedStyle(el).color;
  return opts;
};

const syncUniforms = (program, props) => {
  const u = program.uniforms;
  u.uWarpStrength.value = props.warpStrength;
  u.uWarpScale.value = props.warpScale;
  u.uSpeed.value = props.speed;
  u.uPointerInfluence.value = props.pointerInfluence;
  u.uPointerStrength.value = props.pointerStrength;
  u.uRefraction.value = props.refraction;
  u.uRipple.value = props.ripple ? 1 : 0;
};

/* ---------------- WarpText 实例 ---------------- */
const instances = new Set();

class WarpText {
  constructor(el, options = {}) {
    this.el = el;
    this.options = parseOptions(el, options);
    this._originalHTML = el.innerHTML;
    this._disposed = false;
    this._contextLost = false;
    this._visible = true;
    this._pageVisible = !document.hidden;
    this._reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this._raf = 0;
    this._rasterVersion = 0;
    this.pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    this.startTime = performance.now();
    this._init();
  }

  _init() {
    const el = this.el;
    let renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch (error) {
      console.warn('WarpText: WebGL 初始化失败，保留原始文本。', error);
      return;
    }
    const gl = renderer.gl;
    if (!gl) {
      console.warn('WarpText: 无法创建 WebGL 上下文，保留原始文本。');
      return;
    }
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');

    // 接管：清空原始文本，以 canvas 纹理渲染
    el.textContent = '';
    el.classList.add('warp-text');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', this.options.text);
    el.appendChild(canvas);

    // 守护 warp-text 标记：React 等框架重渲染时会用它自己记录的 className
    // 整体覆盖真实 className（Deep Woods 场景切换即触发），导致 warp-text
    // 类被抹掉、撑高 CSS（.warp-text / .hero-desc.warp-text 的 min-height）
    // 失效，元素塌陷为 0x0、canvas 悬空错位。监听 class 变化，一旦丢失
    // 立即补回（MutationObserver 在浏览器绘制前的微任务阶段执行，无闪烁）。
    this._classGuard = new MutationObserver(() => {
      if (!el.classList.contains('warp-text')) {
        el.classList.add('warp-text');
      }
    });
    this._classGuard.observe(el, { attributes: true, attributeFilter: ['class'] });

    this._renderer = renderer;
    this._gl = gl;
    this._canvas = canvas;

    this._texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });
    this._geometry = new Triangle(gl);
    this._program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: this._texture },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: this.options.warpStrength },
        uWarpScale: { value: this.options.warpScale },
        uSpeed: { value: this.options.speed },
        uPointerInfluence: { value: this.options.pointerInfluence },
        uPointerStrength: { value: this.options.pointerStrength },
        uRefraction: { value: this.options.refraction },
        uRipple: { value: this.options.ripple ? 1 : 0 },
        uMotion: { value: this._reduceMotion ? 0 : 1 },
      },
    });
    this._mesh = new Mesh(gl, { geometry: this._geometry, program: this._program });

    // 事件
    this._onPointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      this.pointer.tx = (event.clientX - rect.left) / rect.width;
      this.pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      this.pointer.activeTarget = 1;
    };
    this._onPointerLeave = () => {
      this.pointer.activeTarget = 0;
    };
    this._onContextLost = (event) => {
      event.preventDefault();
      this._contextLost = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    };
    this._onVisibility = () => {
      this._pageVisible = !document.hidden;
      if (this._pageVisible && this._visible && !this._raf) this._raf = requestAnimationFrame(this._loop);
      if (!this._pageVisible && this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }
    };
    this._onReducedMotion = (event) => {
      this._reduceMotion = event.matches;
      this._program.uniforms.uMotion.value = this._reduceMotion ? 0 : 1;
      this._renderOnce();
    };

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(el);
    this._intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this._visible = entry.isIntersecting;
        if (this._visible && this._pageVisible && !this._raf) this._raf = requestAnimationFrame(this._loop);
        if (!this._visible && this._raf) {
          cancelAnimationFrame(this._raf);
          this._raf = 0;
        }
      },
      { threshold: 0 }
    );
    this._intersectionObserver.observe(el);
    this._mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerleave', this._onPointerLeave);
    canvas.addEventListener('webglcontextlost', this._onContextLost, false);
    document.addEventListener('visibilitychange', this._onVisibility);
    this._mediaQuery?.addEventListener('change', this._onReducedMotion);

    syncUniforms(this._program, this.options);
    this._resize();
    this._raf = requestAnimationFrame(this._loop);
  }

  _renderOnce() {
    if (this._disposed || this._contextLost || !this._renderer) return;
    this._renderer.render({ scene: this._mesh });
  }

  async _rasterize() {
    const version = ++this._rasterVersion;
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {}
    }
    if (this._disposed || this._contextLost || version !== this._rasterVersion) return;
    const rect = this.el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const props = { ...this.options, textAlign: getComputedStyle(this.el).textAlign };
    const textCanvas = buildTextCanvas({
      container: this.el,
      width: rect.width,
      height: rect.height,
      dpr,
      props,
    });
    this._texture.image = textCanvas;
    this._texture.needsUpdate = true;
    this._renderOnce();
  }

  _resize() {
    if (this._disposed || this._contextLost) return;
    const rect = this.el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this._renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._renderer.setSize(rect.width, rect.height);
    this._program.uniforms.uResolution.value[0] = this._gl.drawingBufferWidth;
    this._program.uniforms.uResolution.value[1] = this._gl.drawingBufferHeight;
    this._rasterize();
  }

  _loop = (now) => {
    if (this._disposed || this._contextLost) return;
    const elapsed = (now - this.startTime) * 0.001;
    const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12;
    const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1;
    const targetX = this.pointer.activeTarget > 0 ? this.pointer.tx : idleX;
    const targetY = this.pointer.activeTarget > 0 ? this.pointer.ty : idleY;
    const damping = this.pointer.activeTarget > 0 ? 0.12 : 0.035;
    this.pointer.x += (targetX - this.pointer.x) * damping;
    this.pointer.y += (targetY - this.pointer.y) * damping;
    this.pointer.active += ((this.pointer.activeTarget > 0 ? 1 : 0.18) - this.pointer.active) * 0.06;
    const u = this._program.uniforms;
    u.uPointer.value[0] = this.pointer.x;
    u.uPointer.value[1] = this.pointer.y;
    u.uPointerActive.value = this._reduceMotion ? this.pointer.active * 0.35 : this.pointer.active;
    u.uTime.value = this._reduceMotion ? 0 : elapsed;
    this._renderOnce();
    this._raf = requestAnimationFrame(this._loop);
  };

  /* 更新参数（可部分传入） */
  update(options = {}) {
    Object.assign(this.options, options);
    syncUniforms(this._program, this.options);
    if (
      options.text !== undefined ||
      options.color !== undefined ||
      options.maxWidthRatio !== undefined ||
      options.maxHeightRatio !== undefined ||
      options.fontSize !== undefined ||
      options.lineHeight !== undefined
    ) {
      if (options.text !== undefined) this.el.setAttribute('aria-label', this.options.text);
      this._rasterize();
    }
  }

  /* 更新文本（重绘纹理） */
  setText(text) {
    this.options.text = text;
    this.el.setAttribute('aria-label', text);
    this._rasterize();
  }

  /* 按当前 CSS 颜色刷新文字颜色（用于场景换肤联动） */
  refreshColor() {
    const color = getComputedStyle(this.el).color;
    if (color && color !== this.options.color) {
      this.options.color = color;
      this._rasterize();
    }
  }

  destroy() {
    this._disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._classGuard?.disconnect();
    this._resizeObserver?.disconnect();
    this._intersectionObserver?.disconnect();
    if (this._canvas) {
      this._canvas.removeEventListener('pointermove', this._onPointerMove);
      this._canvas.removeEventListener('pointerleave', this._onPointerLeave);
      this._canvas.removeEventListener('webglcontextlost', this._onContextLost);
    }
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._mediaQuery?.removeEventListener('change', this._onReducedMotion);
    if (this._gl && !this._contextLost) {
      try {
        if (this._texture?.texture) this._gl.deleteTexture(this._texture.texture);
        this._geometry?.remove?.();
        this._program?.remove?.();
        this._gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) {}
    }
    if (this._canvas && this._canvas.parentNode === this.el) this.el.removeChild(this._canvas);
    this.el.classList.remove('warp-text');
    this.el.removeAttribute('role');
    this.el.removeAttribute('aria-label');
    this.el.innerHTML = this._originalHTML;
    instances.delete(this);
  }
}

/* ---------------- 自动初始化 ---------------- */
const initAll = () => {
  document.querySelectorAll('[data-warp-text]').forEach((el) => {
    if (el.__warpText) return;
    const wt = new WarpText(el);
    if (wt._renderer && wt._gl) {
      el.__warpText = wt;
      instances.add(wt);
    }
  });
};

/* 场景换肤联动：body[data-scene] 变化时，按新 CSS 颜色刷新所有纹理 */
const observeScene = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-scene' && mutation.target === document.body) {
        instances.forEach((inst) => inst.refreshColor());
        break;
      }
    }
  });
  observer.observe(document.body, { attributes: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAll();
    observeScene();
  });
} else {
  initAll();
  observeScene();
}

/* ---------------- 全局 API（供普通脚本使用） ---------------- */
window.warpText = {
  getInstances: () => Array.from(instances),
  setTextFor(el, text) {
    if (el && el.__warpText) el.__warpText.setText(text);
    else if (el) el.textContent = text;
  },
  refreshColors: () => instances.forEach((inst) => inst.refreshColor()),
};
