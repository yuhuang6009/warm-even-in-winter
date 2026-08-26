import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Settings, LogOut, Menu, X } from 'lucide-react'

import summerBg from '../assets/summer.jpg'

const UI_FONT = { fontFamily: "'system-ui', sans-serif" }

type Tab = 'dashboard' | 'skills' | 'settings'

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'skills', label: '我的Skills', icon: Package },
  { id: 'settings', label: '设置', icon: Settings },
]

function Console() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const email = localStorage.getItem('lumora.user') || '访客'

  // 进入控制台时首屏遮罩淡出
  const [pageIn, setPageIn] = useState(true)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPageIn(false))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const logout = () => {
    localStorage.removeItem('lumora.user')
    navigate('/')
  }

  const switchTab = (t: Tab) => {
    if (t === 'skills') {
      setMenuOpen(false)
      navigate('/skills')
      return
    }
    setTab(t)
    setMenuOpen(false)
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* 全屏背景图：夏日重现 */}
      <img
        src={summerBg}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 轻微暗化，让玻璃文字更清晰但依然透图 */}
      <div className="absolute inset-0 bg-black/15" />

      {/* 内容层 */}
      <div className="relative z-[2] flex flex-col h-full">
        {/* 顶栏 */}
        <header
          className="flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-6"
          style={UI_FONT}
        >
          <span className="glass-text font-serif italic text-lg sm:text-xl text-white">
            🌙 冬だが暖かい · 控制台
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="liquid-glass rounded-full px-4 py-2 text-xs sm:text-sm text-white/90 max-w-[140px] sm:max-w-[220px] truncate">
              {email}
            </span>
            <button
              onClick={logout}
              className="liquid-glass rounded-full px-4 py-2 text-xs sm:text-sm text-white/90 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 mt-4 sm:mt-6">
          {/* 左侧导航（桌面） */}
          <aside className="hidden md:flex items-start pl-6 sm:pl-8 pr-4">
            <nav className="liquid-glass rounded-2xl p-2 flex flex-col gap-1 w-44">
              {NAV.map((item) => {
                const Icon = item.icon
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-white text-black font-medium'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* 移动端导航按钮 */}
          <button
            className="md:hidden liquid-glass rounded-full w-10 h-10 flex items-center justify-center ml-5 shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="导航"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0 px-5 sm:px-8 pb-6">
            {tab === 'dashboard' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h2
                  className="glass-text font-serif font-normal text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
                  style={{ textShadow: '0 2px 32px rgba(0,0,0,0.45)' }}
                >
                  おかえり，{email} 🌸
                </h2>
              </div>
            )}

            {tab === 'settings' && (
              <div className="h-full flex items-center justify-center">
                <div className="glass-panel rounded-3xl px-8 py-6 text-center">
                  <Settings className="w-8 h-8 text-white/80 mx-auto mb-3" />
                  <p className="glass-text text-white/90 text-base" style={UI_FONT}>
                    设置 建设中…
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 移动端导航抽屉 */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm menu-backdrop-in flex items-center justify-center md:hidden"
          style={UI_FONT}
        >
          <div className="flex flex-col items-center gap-6">
            {NAV.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`menu-link-in flex items-center gap-3 text-2xl ${
                    tab === item.id ? 'text-white' : 'text-white/60'
                  }`}
                  style={{ animationDelay: `${100 + i * 50}ms` }}
                >
                  <Icon className="w-6 h-6" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 页面转场遮罩：进入时淡出 */}
      <div aria-hidden className={`page-transition ${pageIn ? 'page-transition-on' : ''}`} />
    </section>
  )
}

export default Console
