import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AccordionGallery, { type AccordionItem } from '../components/AccordionGallery'
import { SKILL_CATEGORIES, type SkillCategory } from '../data/skills'

import './skills.css'

const TOTAL_SKILLS = SKILL_CATEGORIES.reduce(
  (acc, c) => acc + c.skills.length,
  0
)

function CardBody({ cat }: { cat: SkillCategory }) {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  }

  return (
    <div className="ag-card">
      <div className="ag-card__head">
        <span className="ag-card__emoji">{cat.emoji}</span>
        <div className="ag-card__head-text">
          <h3 className="ag-card__title">{cat.title}</h3>
          <span className="ag-card__sub">{cat.sub}</span>
        </div>
      </div>

      <p className="ag-card__tagline">{cat.tagline}</p>
      <p className="ag-card__desc">{cat.desc}</p>

      <div className="ag-card__block">
        <h4 className="ag-card__h4">技能包</h4>
        <div className="ag-card__chips">
          {cat.skills.map((s) => (
            <span className="ag-card__chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {cat.install && (
        <div className="ag-card__block">
          <h4 className="ag-card__h4">安装指引</h4>
          <button
            type="button"
            className="ag-card__cmd"
            onClick={() => copy(cat.install as string)}
            title="点击复制命令"
          >
            <code className="ag-card__code">{cat.install}</code>
            <span className={`ag-card__copy${copied ? ' ag-card__copy--ok' : ''}`}>
              {copied ? '✓ 已复制' : '复制'}
            </span>
          </button>
        </div>
      )}

      <a
        className="ag-card__src"
        href={cat.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {cat.sourceName} ↗
      </a>
    </div>
  )
}

const ITEMS: AccordionItem[] = SKILL_CATEGORIES.map((c) => ({
  image: c.image,
  gradient: c.gradient,
  label: c.title,
  content: <CardBody cat={c} />
}))

function Skills() {
  const navigate = useNavigate()

  return (
    <section className="skills-page">
      <div className="skills-glow skills-glow--a" aria-hidden="true" />
      <div className="skills-glow skills-glow--b" aria-hidden="true" />

      <header className="skills-head">
        <button
          type="button"
          className="skills-back"
          onClick={() => navigate('/console')}
        >
          <ArrowLeft className="w-4 h-4" />
          返回控制台
        </button>
        <h1 className="skills-title">我的 Skills</h1>
        <p className="skills-sub">
          {SKILL_CATEGORIES.length} 组技能档案 · {TOTAL_SKILLS} 个真实技能包 · 点击展开详情 · 再次点击收起
        </p>
      </header>

      <div className="skills-stage">
        <AccordionGallery
          items={ITEMS}
          defaultIndex={0}
          trigger="click"
          expandRatio={0.58}
          height={540}
          gap={12}
          radius={18}
          duration={0.6}
          tilt={10}
          parallax={0.45}
          overlayColor="#0a0515"
          accentColor="#c084fc"
        />
      </div>

      <footer className="skills-foot">
        <span>↑ 内容面板可滚动 · ← → 方向键切换 · Tab + Enter 键盘可达</span>
      </footer>
    </section>
  )
}

export default Skills
