// 本文件由 scripts/gen-skills.mjs 自动生成，请勿手改！
// 重新生成：node scripts/gen-skills.mjs
// 数据来源：C:\Users\huang\.claude\skills（144 个技能包）

import img1015 from '../assets/1015-900x1200.jpg'
import img1018 from '../assets/1018-900x1200.jpg'
import img1039 from '../assets/1039-900x1200.jpg'
import img1043 from '../assets/1043-900x1200.jpg'

export interface SkillCategory {
  id: string
  emoji: string
  title: string
  /** 副标题：数量统计 */
  sub: string
  image: string
  gradient: string
  tagline: string
  desc: string
  skills: string[]
  sourceName: string
  sourceUrl: string
  /** 安装命令（有则展示为可复制命令块） */
  install?: string
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "agile",
    image: img1015,
    emoji: "🏃",
    title: "敏捷与项目管理",
    sub: "18 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#2e3a1a,#6f8b2f)",
    tagline: "需求拆解、迭代与发布节奏",
    desc: "Sprint 规划、故事拆分、估算、里程碑、发布与上线检查。 本组含 `adopt`、`balance-check`、`day-one-patch` 等 18 个真实技能。",
    skills: ["adopt","balance-check","day-one-patch","estimate","gate-check","launch-checklist","milestone-review","onboard","project-stage-detect","release-checklist","retrospective","scope-check","sprint-plan","sprint-status","start","story-done","story-readiness","vertical-slice"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "design",
    image: img1018,
    emoji: "🎨",
    title: "设计与视觉",
    sub: "18 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#533483,#e94560)",
    tagline: "UI/UX、品牌与图像创作",
    desc: "设计系统、前端界面、品牌规范、AI 生图、图像增强与动效。 本组含 `algorithmic-art`、`art-bible`、`artifacts-builder` 等 18 个真实技能。",
    skills: ["algorithmic-art","art-bible","artifacts-builder","brand-guidelines","canvas-design","design-review","design-system","flux-image","frontend-design","image-enhancer","propagate-design-change","quick-design","slack-gif-creator","theme-factory","ux-design","ux-review","vision-analyze","web-artifacts-builder"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "arch",
    image: img1039,
    emoji: "🏗️",
    title: "架构与产品设计",
    sub: "15 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    tagline: "架构决策、需求规格与产品拆解",
    desc: "架构评审、史诗/故事拆分、资产规范、需求逆向与产品头脑风暴。 本组含 `architecture-decision`、`architecture-review`、`asset-audit` 等 15 个真实技能。",
    skills: ["architecture-decision","architecture-review","asset-audit","asset-spec","brainstorm","brainstorming","consistency-check","content-audit","content-research-writer","create-architecture","create-control-manifest","create-epics","create-stories","review-all-gdds","tech-debt"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "ai",
    image: img1043,
    emoji: "🤖",
    title: "AI 与技能创作",
    sub: "11 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#0f3460,#533483)",
    tagline: "扩展 Claude 能力本身",
    desc: "技能创建/测试/分享、MCP、浏览器自动化与 API 集成。 本组含 `browseros-neo`、`claude-api`、`composio-skills` 等 11 个真实技能。",
    skills: ["browseros-neo","claude-api","composio-skills","connect","connect-apps","connect-apps-plugin","mcp-builder","skill-creator","skill-improve","skill-share","skill-test"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "quality",
    image: img1015,
    emoji: "✅",
    title: "测试与质量",
    sub: "18 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#1b2d2a,#2e5d4e)",
    tagline: "让每一次交付都经得起验证",
    desc: "TDD、回归、冒烟、压力、Web 测试、Bug 管理、安全审计与代码评审。 本组含 `bug-report`、`bug-triage`、`code-review` 等 18 个真实技能。",
    skills: ["bug-report","bug-triage","code-review","perf-profile","qa-plan","receiving-code-review","regression-suite","requesting-code-review","security-audit","smoke-check","soak-test","test-driven-development","test-evidence-review","test-flakiness","test-helpers","test-setup","verification-before-completion","webapp-testing"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "office",
    image: img1018,
    emoji: "📄",
    title: "文档与办公",
    sub: "12 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#1a2e1a,#2f6f2f)",
    tagline: "文档、表格、PDF 与知识沉淀",
    desc: "docx/xlsx/pdf 处理、文档协作、本地化、清单与归档。 本组含 `changelog`、`changelog-generator`、`doc-coauthoring` 等 12 个真实技能。",
    skills: ["changelog","changelog-generator","doc-coauthoring","document-skills","docx","file-organizer","invoice-organizer","localize","office-academic-skill","pdf","reverse-document","xlsx"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "learn",
    image: img1039,
    emoji: "🎓",
    title: "学习与求职",
    sub: "5 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#3a2f1a,#8b6f2f)",
    tagline: "作业、简历与成长分析",
    desc: "课件作业、简历定制、工程师成长分析与学术研究写作。 本组含 `chaoxing-homework`、`developer-growth-analysis`、`research-writing-skill` 等 5 个真实技能。",
    skills: ["chaoxing-homework","developer-growth-analysis","research-writing-skill","scientific-toolkit-skill","tailored-resume-generator"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "web-info",
    image: img1043,
    emoji: "🌐",
    title: "网络与信息获取",
    sub: "7 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#0f3460,#2e6f8b)",
    tagline: "联网搜索、抓取与资料调研",
    desc: "浏览器访问、视频下载、竞品信息提取、域名创意与关键词调研。 本组含 `competitive-ads-extractor`、`domain-name-brainstormer`、`langsmith-fetch` 等 7 个真实技能。",
    skills: ["competitive-ads-extractor","domain-name-brainstormer","langsmith-fetch","lead-research-assistant","twitter-algorithm-optimizer","youtube-downloader","web-access"],
    sourceName: "eze-is/web-access",
    sourceUrl: "https://github.com/eze-is/web-access"
  },
  {
    id: "story",
    image: img1015,
    emoji: "🎭",
    title: "叙事与互动",
    sub: "3 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#4a0f2e,#a03060)",
    tagline: "小说改编、剧情与角色塑造",
    desc: "小说转游戏、剧本分析、角色与世界塑造的叙事工作流。 本组含 `dev-story`、`novel-game-analyze`、`novel-to-game` 等 3 个真实技能。",
    skills: ["dev-story","novel-game-analyze","novel-to-game"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "workflow",
    image: img1018,
    emoji: "🛠️",
    title: "开发工作流",
    sub: "15 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#16213e,#0f3460)",
    tagline: "调试、规划与高效协作套路",
    desc: "系统化调试、计划执行、Git 工作树、热修复、子代理并行开发。 本组含 `dispatching-parallel-agents`、`executing-plans`、`finishing-a-development-branch` 等 15 个真实技能。",
    skills: ["dispatching-parallel-agents","executing-plans","finishing-a-development-branch","help","hotfix","patch-notes","prototype","setup-engine","subagent-driven-development","systematic-debugging","template-skill","using-git-worktrees","using-superpowers","writing-plans","writing-skills"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "game",
    image: img1039,
    emoji: "🕹️",
    title: "游戏开发",
    sub: "7 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#2a1a3a,#5f3a8b)",
    tagline: "从世界观到可玩验证",
    desc: "游戏概念、世界观、关卡、数值、测试与发布全流程。 本组含 `game-art-direction`、`game-build`、`game-concept` 等 7 个真实技能。",
    skills: ["game-art-direction","game-build","game-concept","game-qa","game-world-design","map-systems","playtest-report"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "deck",
    image: img1043,
    emoji: "🎞️",
    title: "演示文稿",
    sub: "3 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#4a1d0f,#a03030)",
    tagline: "从翻页 PPT 到专业发布会风格",
    desc: "用 HTML/单文件生成高质感 PPT、slides 与演示文稿。 本组含 `guizang-ppt-skill`、`html-ppt`、`pptx` 等 3 个真实技能。",
    skills: ["guizang-ppt-skill","html-ppt","pptx"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "team",
    image: img1015,
    emoji: "👥",
    title: "团队协作",
    sub: "11 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#1a2b3c,#2e5d8b)",
    tagline: "从站会到回顾的团队节奏",
    desc: "团队周报、会议洞察、协作沟通与成员对齐。 本组含 `internal-comms`、`meeting-insights-analyzer`、`team-audio` 等 11 个真实技能。",
    skills: ["internal-comms","meeting-insights-analyzer","team-audio","team-combat","team-level","team-live-ops","team-narrative","team-polish","team-qa","team-release","team-ui"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
  {
    id: "misc",
    image: img1018,
    emoji: "📦",
    title: "效率小工具",
    sub: "1 个技能包 · 本机已安装",
    gradient: "linear-gradient(135deg,#2a1a3a,#5f3a8b)",
    tagline: "各种好用的一次性利器",
    desc: "未归类的实用小工具，开箱即用。 本组含 `raffle-winner-picker` 等 1 个真实技能。",
    skills: ["raffle-winner-picker"],
    sourceName: "本机 · Claude Skills",
    sourceUrl: ""
  },
]

export const SKILL_TOTAL = SKILL_CATEGORIES.reduce((n, c) => n + c.skills.length, 0)
