import img1015 from '../assets/1015-900x1200.jpg'
import img1018 from '../assets/1018-900x1200.jpg'
import img1039 from '../assets/1039-900x1200.jpg'
import img1043 from '../assets/1043-900x1200.jpg'

export interface SkillCategory {
  id: string
  emoji: string
  title: string
  /** 副标题：数量 / 来源统计 */
  sub: string
  /** 背景图（4 张轮流使用），加载失败时回退到 gradient */
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
    id: 'lang',
    image: img1015,
    emoji: '💻',
    title: '语言专家',
    sub: '12 种语言 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)',
    tagline: '写出地道、高性能的代码',
    desc: '覆盖主流编程语言的最佳实践、高级特性与性能优化，从类型系统到异步模式，让每一行代码都符合该语言社区的标准写法。',
    skills: [
      'Python Pro',
      'TypeScript Pro',
      'JavaScript Pro',
      'Go Pro',
      'Rust Engineer',
      'SQL Pro',
      'C++ Pro',
      'Swift Expert',
      'Kotlin Specialist',
      'C# Developer',
      'PHP Pro',
      'Java Architect'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'backend',
    image: img1018,
    emoji: '⚙️',
    title: '后端框架',
    sub: '7 大后端栈 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#2b1a4e,#7a2f9e)',
    tagline: '从 API 到微服务的完整后端能力',
    desc: '主流后端框架的专业级实现指南，涵盖认证授权、数据库建模、异步任务与生产部署的完整最佳实践。',
    skills: [
      'NestJS Expert',
      'Django Expert',
      'FastAPI Expert',
      'Spring Boot Engineer',
      'Laravel Specialist',
      'Rails Expert',
      '.NET Core Expert'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'frontend',
    image: img1039,
    emoji: '🎨',
    title: '前端与移动',
    sub: '6 大前端栈 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#0f3460,#533483)',
    tagline: '现代 Web 与跨端应用的界面工程',
    desc: 'React、Vue、Angular 等框架的最佳实践，覆盖组件设计、状态管理、SSR/SSG 与响应式 UI 构建。',
    skills: [
      'React Expert',
      'Next.js Developer',
      'Vue Expert',
      'Angular Architect',
      'React Native Expert',
      'Flutter Expert'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'infra',
    image: img1043,
    emoji: '☁️',
    title: '基础设施与云',
    sub: '5 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    tagline: '从容器编排到云原生架构',
    desc: 'Kubernetes 集群管理、基础设施即代码、多云架构与数据库性能调优，为应用打下稳定可靠的底座。',
    skills: [
      'Kubernetes Specialist',
      'Terraform Engineer',
      'Postgres Pro',
      'Cloud Architect',
      'Database Optimizer'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'api',
    image: img1015,
    emoji: '🔌',
    title: 'API 与架构',
    sub: '8 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#16213e,#0f3460)',
    tagline: '设计可演进、可扩展的系统',
    desc: 'GraphQL、REST、WebSocket、微服务与 MCP 的全栈架构设计，加上需求收集与规格逆向工程工作流。',
    skills: [
      'GraphQL Architect',
      'API Designer',
      'WebSocket Engineer',
      'Microservices Architect',
      'MCP Developer',
      'Architecture Designer',
      'Feature Forge',
      'Spec Miner'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'data-ml',
    image: img1018,
    emoji: '🧠',
    title: '数据与 AI',
    sub: '6 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#0f3460,#533483)',
    tagline: '从数据处理到大模型工程',
    desc: 'DataFrame 处理、大数据计算、ML 流水线、Prompt 工程、RAG 与模型微调，覆盖 AI 应用的全生命周期。',
    skills: [
      'Pandas Pro',
      'Spark Engineer',
      'ML Pipeline',
      'Prompt Engineer',
      'RAG Architect',
      'Fine-Tuning Expert'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'quality',
    image: img1039,
    emoji: '✅',
    title: '质量与测试',
    sub: '4 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#1b2d2a,#2e5d4e)',
    tagline: '让代码不仅能用，更可靠',
    desc: '单元、集成、E2E、性能与安全测试的整体策略，浏览器自动化与深度代码审查、文档生成。',
    skills: ['Test Master', 'Playwright Expert', 'Code Reviewer', 'Code Documenter'],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'devops',
    image: img1043,
    emoji: '🚀',
    title: '运维与可靠性',
    sub: '5 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#1a2b3c,#2e5d8b)',
    tagline: '从 CI/CD 到混沌工程',
    desc: '持续交付、可观测性、站点可靠性工程、故障注入与 CLI 工具开发，让系统能持续交付且足够健壮。',
    skills: [
      'DevOps Engineer',
      'Monitoring Expert',
      'SRE Engineer',
      'Chaos Engineer',
      'CLI Developer'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'security',
    image: img1015,
    emoji: '🛡️',
    title: '安全',
    sub: '2 大能力 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#3a1a1a,#8b2f2f)',
    tagline: '把漏洞扼杀在代码里',
    desc: '从编写安全代码到安全审计，覆盖 SAST 分析、渗透测试思路与常见漏洞的防御实践。',
    skills: ['Secure Code Guardian', 'Security Reviewer'],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'platform',
    image: img1018,
    emoji: '🏪',
    title: '平台生态',
    sub: '4 大平台 · jeffallan/claude-skills',
    gradient: 'linear-gradient(135deg,#3a2f1a,#8b6f2f)',
    tagline: '在 SaaS 平台上构建应用',
    desc: 'Salesforce、Shopify、WordPress 与 Atlassian（Jira/Confluence）的平台开发与生态集成。',
    skills: [
      'Salesforce Developer',
      'Shopify Expert',
      'WordPress Pro',
      'Atlassian MCP'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'workflow',
    image: img1039,
    emoji: '⚡',
    title: '工作流与效率',
    sub: '12 类工作流 · 跨两个仓库',
    gradient: 'linear-gradient(135deg,#2e3a1a,#6f8b2f)',
    tagline: '把高频任务变成可复用的套路',
    desc: '调试、全栈实现、决策挑战、需求收集、规格逆向与遗留系统现代化，覆盖开发过程中的高频工作流。',
    skills: [
      'Debugging Wizard',
      'Fullstack Guardian',
      'The Fool',
      'Legacy Modernizer',
      'Embedded Systems',
      'Game Developer',
      'Feature Forge',
      'Spec Miner'
    ],
    sourceName: 'jeffallan/claude-skills',
    sourceUrl: 'https://github.com/jeffallan/claude-skills'
  },
  {
    id: 'alireza',
    image: img1043,
    emoji: '🧩',
    title: '全领域 362 包',
    sub: '18 个领域 · alirezarezvani/claude-skills',
    gradient: 'linear-gradient(135deg,#2a1a3a,#5f3a8b)',
    tagline: '工程 / 产品 / 市场 / 管理层一站式',
    desc: '362 个生产级技能 + 插件，覆盖 18 个领域：工程核心、POWERFUL 进阶、产品、市场（含 AEO）、生产力、学术研究、项目管理、合规、C-level 咨询等，适配 13 种编码工具。',
    skills: [
      'engineering-core',
      'engineering-powerful',
      'product',
      'marketing',
      'productivity',
      'research',
      'research-ops',
      'project-management',
      'ra-qm',
      'compliance-os',
      'c-level',
      'business-growth',
      'business-operations',
      'commercial',
      'finance',
      'loop-library',
      'markdown-html'
    ],
    sourceName: 'alirezarezvani/claude-skills',
    sourceUrl: 'https://github.com/alirezarezvani/claude-skills',
    install: '/plugin marketplace add alirezarezvani/claude-skills\n/plugin install engineering-skills@claude-code-skills'
  },
  {
    id: 'soulkiller',
    image: img1015,
    emoji: '🕹️',
    title: 'SOULKILLER',
    sub: '数字灵魂 · 文字冒险引擎',
    gradient: 'linear-gradient(135deg,#4a0f2e,#a03060)',
    tagline: '把人物数字足迹变成可游玩的 Galgame',
    desc: '输入名字创建角色、输入世界观创建世界，两步生成一部完整的文字冒险视觉小说。预制 55 个角色 + 6 个世界观（Fate/Zero、三国、白色相簿2、赛博朋克2077…），导出的 .skill 档案可在 Claude Code / OpenClaw 中直接游玩。',
    skills: [
      '/create 角色',
      '/world 世界',
      '/export 导出',
      '/unpack 导入',
      '/use 对话',
      '/install 预制',
      'soul.pack',
      'world.pack',
      'Galgame 引擎',
      '存档读档',
      '好感度追踪',
      '分支树可视化'
    ],
    sourceName: 'SOULKILLER · GPL-3.0',
    sourceUrl: 'https://github.com/nicepkg/openclaw',
    install: 'curl -fsSL https://soulkiller-download.ad546971975.workers.dev/scripts/install.sh | sh'
  }
]
