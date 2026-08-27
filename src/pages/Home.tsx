import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const VIDEOS = [
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
    label: 'Golden Hour',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
    label: 'Still Water',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
    label: 'Deep Woods',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
    label: 'Quiet Dawn',
  },
]

const OVERLAY =
  'https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png'

// 后端地址：构建时通过 VITE_BACKEND_URL 注入（如 https://ai-workbench.onrender.com）。
// 目前仅邮件订阅用它；不设该变量时为空串 → 走同源相对路径。
const BACKEND = ((import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '').replace(/\/+$/, '')

// 纯静态托管（GitHub Pages）下只有 SPA 三个页面存在，导航走站内 hash 路由。
// 后端上线后改回 `${BACKEND}/portfolio` 等即可。
const NAV_LINKS = [
  { label: '作品集', href: '#/skills' },
  { label: '工作台', href: '#/console' },
]

const UI_FONT = { fontFamily: "'system-ui', sans-serif" }

const HERO_TITLE = 'Warm Even\nin Winter'

const HERO_DESC =
  'A personal site for one AI learner — an anime-style portfolio, a full-featured workbench, and Xiaonuan the AI hostess who keeps you company through weather, plans, and every small win. 🌸'

function Home() {
  const navigate = useNavigate()
  const [activeVideo, setActiveVideo] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  // 已登录过（localStorage 有用户）则按钮直接显示「登录」
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'subscribed' | 'error'>(
    () => (localStorage.getItem('lumora.user') ? 'subscribed' : 'idle'),
  )
  const darkMode = activeVideo === 2

  // ---- 全站页面转场 ----
  const [pageIn, setPageIn] = useState(true) // 首屏遮罩：初始盖住，随后淡出
  const [navLeaving, setNavLeaving] = useState(false) // 点击导航：遮罩淡入后跳转

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPageIn(false))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // ---- WarpText：动态加载无类型 JS 模块（副作用自动扫描 data-warp-text 并初始化）----
  useEffect(() => {
    let cancelled = false
    // @ts-ignore warp-text.js 为无类型 JS 模块
    import('../warp-text.js')
      .then(() => {
        if (!cancelled) console.log('[WarpText] 已就绪')
      })
      .catch((err) => {
        console.warn('[WarpText] 加载失败，保留原始文字。', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 浏览器后退/前进（bfcache 恢复）时重置转场状态，避免遮罩残留导致黑屏
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      // 解除“离开中”锁定，并重新走一遍首屏淡出
      setNavLeaving(false)
      setPageIn(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPageIn(false))
      })
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  const go = (href: string) => {
    if (navLeaving) return
    setNavLeaving(true)
    window.setTimeout(() => {
      // #/ 开头为 SPA 站内路由 → navigate()；其余（如后端 /portfolio）→ 整页跳转
      if (href.startsWith('#')) navigate(href.slice(1))
      else window.location.href = href
    }, 420)
  }

  const submitEmail = async () => {
    if (emailState === 'sending' || emailState === 'subscribed') return
    const value = email.trim()
    if (!value) return
    setEmailState('sending')
    try {
      const resp = await fetch(`${BACKEND}/api/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      })
      if (!resp.ok) throw new Error('bad response')
      setEmailState('subscribed')
    } catch {
      setEmailState('error')
    }
  }

  // 订阅成功后按钮变「登录」，点击进入控制台（邮箱存 localStorage）
  const login = () => {
    if (navLeaving) return
    const saved = localStorage.getItem('lumora.user')
    const value = (email.trim() || saved || '').trim()
    if (!value) return
    localStorage.setItem('lumora.user', value)
    setNavLeaving(true)
    window.setTimeout(() => navigate('/console'), 420)
  }

  const switchVideo = (i: number) => {
    if (i === activeVideo || isTransitioning) return
    setActiveVideo(i)
    setIsTransitioning(true)
    // 场景换肤（Deep Woods 深色文字）后，刷新 WarpText 纹理颜色
    // 等 transition-colors(700ms) 过渡完成后再刷新，避免取到中间色
    window.setTimeout(() => {
      ;(window as unknown as { warpText?: { refreshColors: () => void } }).warpText?.refreshColors()
    }, 800)
    window.setTimeout(() => setIsTransitioning(false), 1000)
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background video stack */}
      {VIDEOS.map((v, i) => (
        <video
          key={v.url}
          className={`absolute inset-0 w-full h-full object-cover video-layer ${
            i === activeVideo ? 'opacity-100' : 'opacity-0'
          }`}
          src={v.url}
          autoPlay
          muted
          loop
          playsInline
        />
      ))}

      {/* Transparent PNG overlay */}
      <div
        className="absolute inset-0 z-[1] bg-cover bg-center train-bob"
        style={{ backgroundImage: `url(${OVERLAY})` }}
      />

      {/* Content layer */}
      <div className="relative z-[2] flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-6">
          <span className="text-white italic text-xl sm:text-2xl font-serif">
            冬だが暖かい
          </span>

          <div
            className="hidden md:flex items-center liquid-glass rounded-full px-2 py-2 gap-1"
            style={UI_FONT}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(link.href)
                }}
                className="px-4 py-2 text-sm text-white/90 hover:text-white transition-colors rounded-full whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/console"
              onClick={(e) => {
                e.preventDefault()
                go('#/console')
              }}
              className="ml-1 bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              进入工作台 ⚡
            </a>
          </div>

          <button
            className="md:hidden liquid-glass rounded-full w-10 h-10 flex items-center justify-center relative"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Menu
              className={`absolute w-5 h-5 text-white transition-all duration-300 ${
                menuOpen
                  ? 'opacity-0 rotate-90 scale-75'
                  : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <X
              className={`absolute w-5 h-5 text-white transition-all duration-300 ${
                menuOpen
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 -rotate-90 scale-75'
              }`}
            />
          </button>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
          <div className="liquid-glass rounded-full px-4 sm:px-5 py-2 mb-5 sm:mb-7">
            <span
              className={`text-sm transition-colors duration-700 ${
                darkMode ? 'text-[#182C41]' : 'text-white/90'
              }`}
              style={UI_FONT}
            >
              Already finding warmth in a noisy world
            </span>
          </div>

          <h1
            data-warp-text
            data-text={HERO_TITLE}
            className={`relative font-serif font-normal transition-colors duration-700 text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] max-w-4xl ${
              darkMode ? 'text-[#182C41]' : 'text-white'
            }`}
          >
            Warm Even
            <br />
            in Winter
          </h1>

          <p
            data-warp-text
            data-text={HERO_DESC}
            className={`hero-desc mt-5 sm:mt-7 max-w-xl leading-relaxed transition-colors duration-700 ${
              darkMode ? 'text-[#182C41]/80' : 'text-white/80'
            }`}
            style={UI_FONT}
          >
            {HERO_DESC}
          </p>

          <div
            className={`liquid-glass rounded-full flex items-center max-w-[320px] sm:max-w-sm w-full mt-7 sm:mt-9 p-1.5 pl-1 transition-colors duration-700 ${
              darkMode ? 'text-[#182C41]' : 'text-white'
            }`}
            style={UI_FONT}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailState === 'error') setEmailState('idle')
              }}
              placeholder="你的邮箱"
              className={`bg-transparent outline-none flex-1 px-4 py-2.5 text-sm min-w-0 ${
                darkMode
                  ? 'text-[#182C41] placeholder-[#182C41]/50'
                  : 'text-white placeholder-white/50'
              }`}
            />
            <button
              onClick={emailState === 'subscribed' ? login : submitEmail}
              className="bg-white text-black rounded-full px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0"
            >
              {emailState === 'subscribed'
                ? '登录 →'
                : emailState === 'sending'
                  ? '…'
                  : '订阅更新'}
            </button>
          </div>

          {/* Video switcher */}
          <div className="flex items-center gap-4 sm:gap-6 mt-7 sm:mt-9" style={UI_FONT}>
            {VIDEOS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => switchVideo(i)}
                className={`text-sm transition-all duration-300 border-b-2 pb-1 ${
                  activeVideo === i
                    ? darkMode
                      ? 'text-[#182C41] border-[#182C41]'
                      : 'text-white border-white'
                    : `${darkMode ? 'text-[#182C41]' : 'text-white'} opacity-50 border-transparent hover:opacity-80`
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="pb-5 sm:pb-7 px-5">
          <div
            className="hidden sm:flex items-center justify-center gap-3 sm:gap-4 text-white/70 text-xs sm:text-sm flex-wrap"
            style={UI_FONT}
          >
            <span>4 Open Source Projects</span>
            <span className="opacity-40">|</span>
            <span>60 Study Sessions</span>
            <span className="opacity-40">|</span>
            <span>3 Skill Badges</span>
            <span className="opacity-40">|</span>
            <span>∞ Warmth</span>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm menu-backdrop-in flex items-center justify-center"
          style={UI_FONT}
        >
          <div className="flex flex-col items-center gap-7">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  go(link.href)
                }}
                className="text-white text-3xl menu-link-in font-serif"
                style={{ animationDelay: `${100 + i * 50}ms` }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/console"
              onClick={(e) => {
                e.preventDefault()
                setMenuOpen(false)
                go('#/console')
              }}
              className="bg-white text-black rounded-full px-8 py-3 text-base font-medium menu-btn-in mt-3"
              style={{ animationDelay: '350ms' }}
            >
              进入工作台 ⚡
            </a>
          </div>
        </div>
      )}

      {/* 全站页面转场遮罩：进入时淡出，点击导航时淡入 */}
      <div
        aria-hidden
        className={`page-transition ${pageIn || navLeaving ? 'page-transition-on' : ''}`}
      />
    </section>
  )
}

export default Home
