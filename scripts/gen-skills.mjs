#!/usr/bin/env node
/**
 * 扫描本机 ~/.claude/skills 真实技能目录，按规则分组，
 * 生成 src/data/skills.ts（保持 SkillCategory 接口兼容）。
 *
 * 用法：node scripts/gen-skills.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

const SKILLS_DIR = resolve(process.env.USERPROFILE || homedir(), '.claude', 'skills')
const OUT = resolve(import.meta.dirname, '..', 'src', 'data', 'skills.ts')

// ---------- 分组规则（顺序即优先级，首个命中生效；未命中进「其他工具」） ----------
const CATEGORIES = [
  {
    id: 'deck', emoji: '🎞️', title: '演示文稿',
    tagline: '从翻页 PPT 到专业发布会风格',
    desc: '用 HTML/单文件生成高质感 PPT、slides 与演示文稿。',
    gradient: 'linear-gradient(135deg,#4a1d0f,#a03030)',
    match: /ppt|presentation|slide|deck/
  },
  {
    id: 'office', emoji: '📄', title: '文档与办公',
    tagline: '文档、表格、PDF 与知识沉淀',
    desc: 'docx/xlsx/pdf 处理、文档协作、本地化、清单与归档。',
    gradient: 'linear-gradient(135deg,#1a2e1a,#2f6f2f)',
    match: /docx|document|doc-coauthoring|localize|office-academic|invoice|file-organizer|changelog|^pdf$|xlsx/
  },
  {
    id: 'web-info', emoji: '🌐', title: '网络与信息获取',
    tagline: '联网搜索、抓取与资料调研',
    desc: '浏览器访问、视频下载、竞品信息提取、域名创意与关键词调研。',
    gradient: 'linear-gradient(135deg,#0f3460,#2e6f8b)',
    match: /web-access|video-downloader|extractor|lead-research|twitter|langsmith|domain-name/
  },
  {
    id: 'design', emoji: '🎨', title: '设计与视觉',
    tagline: 'UI/UX、品牌与图像创作',
    desc: '设计系统、前端界面、品牌规范、AI 生图、图像增强与动效。',
    gradient: 'linear-gradient(135deg,#533483,#e94560)',
    match: /^art|algorithmic|brand|canvas-design|^design|frontend|^ux-|theme-factory|flux|image-enhancer|gif-creator|vision|artifacts-builder|propagate-design|quick-design/
  },
  {
    id: 'game', emoji: '🕹️', title: '游戏开发',
    tagline: '从世界观到可玩验证',
    desc: '游戏概念、世界观、关卡、数值、测试与发布全流程。',
    gradient: 'linear-gradient(135deg,#2a1a3a,#5f3a8b)',
    match: /^game|playtest|map-systems/
  },
  {
    id: 'story', emoji: '🎭', title: '叙事与互动',
    tagline: '小说改编、剧情与角色塑造',
    desc: '小说转游戏、剧本分析、角色与世界塑造的叙事工作流。',
    gradient: 'linear-gradient(135deg,#4a0f2e,#a03060)',
    match: /novel|dev-story/
  },
  {
    id: 'team', emoji: '👥', title: '团队协作',
    tagline: '从站会到回顾的团队节奏',
    desc: '团队周报、会议洞察、协作沟通与成员对齐。',
    gradient: 'linear-gradient(135deg,#1a2b3c,#2e5d8b)',
    match: /^team|internal-comms|meeting-insights/
  },
  {
    id: 'agile', emoji: '🏃', title: '敏捷与项目管理',
    tagline: '需求拆解、迭代与发布节奏',
    desc: 'Sprint 规划、故事拆分、估算、里程碑、发布与上线检查。',
    gradient: 'linear-gradient(135deg,#2e3a1a,#6f8b2f)',
    match: /sprint|retrospective|vertical-slice|^story-|estimate|milestone|project-stage|gate-check|balance-check|scope-check|launch-checklist|release-checklist|^adopt$|^onboard$|^start$|day-one/
  },
  {
    id: 'arch', emoji: '🏗️', title: '架构与产品设计',
    tagline: '架构决策、需求规格与产品拆解',
    desc: '架构评审、史诗/故事拆分、资产规范、需求逆向与产品头脑风暴。',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)',
    match: /architecture|create-|review-all|tech-debt|^asset-|consistency|reverse-document|brainstorm|content-research|content-audit/
  },
  {
    id: 'quality', emoji: '✅', title: '测试与质量',
    tagline: '让每一次交付都经得起验证',
    desc: 'TDD、回归、冒烟、压力、Web 测试、Bug 管理、安全审计与代码评审。',
    gradient: 'linear-gradient(135deg,#1b2d2a,#2e5d4e)',
    match: /^test|testing|regression|smoke|soak|^qa-|^bug-|security-audit|perf-profile|code-review|verification/
  },
  {
    id: 'workflow', emoji: '🛠️', title: '开发工作流',
    tagline: '调试、规划与高效协作套路',
    desc: '系统化调试、计划执行、Git 工作树、热修复、子代理并行开发。',
    gradient: 'linear-gradient(135deg,#16213e,#0f3460)',
    match: /debugging|executing-plans|^writing-|superpowers|git-worktrees|finishing|hotfix|patch-notes|subagent|dispatching|setup-engine|prototype|template-skill|^help$/
  },
  {
    id: 'ai', emoji: '🤖', title: 'AI 与技能创作',
    tagline: '扩展 Claude 能力本身',
    desc: '技能创建/测试/分享、MCP、浏览器自动化与 API 集成。',
    gradient: 'linear-gradient(135deg,#0f3460,#533483)',
    match: /skill-creator|skill-improve|skill-share|skill-test|claude-api|mcp-builder|browserclaw|composio|^connect/
  },
  {
    id: 'learn', emoji: '🎓', title: '学习与求职',
    tagline: '作业、简历与成长分析',
    desc: '课件作业、简历定制、工程师成长分析与学术研究写作。',
    gradient: 'linear-gradient(135deg,#3a2f1a,#8b6f2f)',
    match: /chaoxing|resume|developer-growth|scientific|research-writing/
  },
  {
    id: 'misc', emoji: '📦', title: '效率小工具',
    tagline: '各种好用的一次性利器',
    desc: '未归类的实用小工具，开箱即用。',
    gradient: 'linear-gradient(135deg,#2a1a3a,#5f3a8b)',
    match: /.*/
  }
]

// ---------- 图片（4 张循环） ----------
const IMAGES = [
  "img1015", "img1018", "img1039", "img1043"
]

// ---------- 解析 SKILL.md frontmatter ----------
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const body = m[1]
  const get = (key) => {
    const re = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm')
    const line = body.match(re)
    if (!line) return undefined
    const first = line[1]
    // 折叠/多行 description：取后续以空白开头的行
    const rest = []
    const after = body.slice(line.index + line[0].length).split('\n')
    for (const l of after) {
      if (/^\s+\S/.test(l)) rest.push(l.trim())
      else break
    }
    const text = [first, ...rest].filter(Boolean).join(' ')
    return text.replace(/^["']|["']$/g, '').trim()
  }
  const github = body.match(/^github:[ \t]*(.*)$/m)
  return {
    name: get('name'),
    description: get('description'),
    github: github ? github[1].trim() : undefined
  }
}

function truncate(s, n) {
  if (!s) return ''
  const t = String(s).replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

// ---------- 主流程 ----------
if (!existsSync(SKILLS_DIR)) {
  console.error(`找不到技能目录: ${SKILLS_DIR}`)
  process.exit(1)
}

// 部分技能通过 npx skills 以符号链接安装，需一并纳入
const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() || d.isSymbolicLink())
  .map((d) => d.name)
  .sort()

const skills = []
for (const dir of dirs) {
  const md = join(SKILLS_DIR, dir, 'SKILL.md')
  let meta = {}
  if (existsSync(md)) meta = parseFrontmatter(readFileSync(md, 'utf8'))
  skills.push({
    id: dir,
    name: meta.name || dir,
    description: truncate(meta.description || `本机安装的技能包 ${dir}`, 140),
    github: meta.github || ''
  })
}

const groups = new Map()
for (const skill of skills) {
  const target = CATEGORIES.find((c) => c.match.test(skill.id)) || CATEGORIES[CATEGORIES.length - 1]
  if (!groups.has(target.id)) groups.set(target.id, { cat: target, items: [] })
  groups.get(target.id).items.push(skill)
}

const lines = []
lines.push(`// 本文件由 scripts/gen-skills.mjs 自动生成，请勿手改！`)
lines.push(`// 重新生成：node scripts/gen-skills.mjs`)
lines.push(`// 数据来源：${SKILLS_DIR}（${skills.length} 个技能包）`)
lines.push(``)
for (const img of ['1015', '1018', '1039', '1043']) {
  lines.push(`import img${img} from '../assets/${img}-900x1200.jpg'`)
}
lines.push(``)
lines.push(`export interface SkillCategory {`)
lines.push(`  id: string`)
lines.push(`  emoji: string`)
lines.push(`  title: string`)
lines.push(`  /** 副标题：数量统计 */`)
lines.push(`  sub: string`)
lines.push(`  image: string`)
lines.push(`  gradient: string`)
lines.push(`  tagline: string`)
lines.push(`  desc: string`)
lines.push(`  skills: string[]`)
lines.push(`  sourceName: string`)
lines.push(`  sourceUrl: string`)
lines.push(`  /** 安装命令（有则展示为可复制命令块） */`)
lines.push(`  install?: string`)
lines.push(`}`)
lines.push(``)
lines.push(`export const SKILL_CATEGORIES: SkillCategory[] = [`)

let idx = 0
for (const [, { cat, items }] of groups) {
  const img = IMAGES[idx++ % IMAGES.length]
  const sub = `${items.length} 个技能包 · 本机已安装`
  const skillNames = items.map((s) => s.name)
  const sample = skillNames.slice(0, 3).map((s) => `\`${s}\``).join('、')
  const desc = cat.desc === '' ? `${items.length} 个技能包。` : `${cat.desc} 本组含 ${sample} 等 ${items.length} 个真实技能。`
  const sourceUrl = items.find((s) => s.github)?.github || ''
  const sourceName = sourceUrl
    ? sourceUrl.replace(/^https?:\/\/(github\.com\/)?/, '')
    : '本机 · Claude Skills'

  lines.push(`  {`)
  lines.push(`    id: ${JSON.stringify(cat.id)},`)
  lines.push(`    image: ${img},`)
  lines.push(`    emoji: ${JSON.stringify(cat.emoji)},`)
  lines.push(`    title: ${JSON.stringify(cat.title)},`)
  lines.push(`    sub: ${JSON.stringify(sub)},`)
  lines.push(`    gradient: ${JSON.stringify(cat.gradient)},`)
  lines.push(`    tagline: ${JSON.stringify(cat.tagline)},`)
  lines.push(`    desc: ${JSON.stringify(truncate(desc, 150))},`)
  lines.push(`    skills: ${JSON.stringify(skillNames)},`)
  lines.push(`    sourceName: ${JSON.stringify(sourceName)},`)
  lines.push(`    sourceUrl: ${JSON.stringify(sourceUrl)}`)
  lines.push(`  },`)
}
lines.push(`]`)
lines.push(``)
lines.push(`export const SKILL_TOTAL = SKILL_CATEGORIES.reduce((n, c) => n + c.skills.length, 0)`)
lines.push(``)

writeFileSync(OUT, lines.join('\n'), 'utf8')

console.log(`✅ 生成完成: ${OUT}`)
console.log(`   技能总数: ${skills.length}，分组: ${groups.size}`)
for (const [, { cat, items }] of groups) {
  console.log(`   ${cat.emoji} ${cat.title}: ${items.length} 个`)
}
const uncategorized = skills.filter((s) => !CATEGORIES.slice(0, -1).some((c) => c.match.test(s.id)))
console.log(`   落入兜底「效率小工具」: ${uncategorized.length} 个（${uncategorized.map((s) => s.id).join(', ') || '无'}）`)
