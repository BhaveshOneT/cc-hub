// ============================================================================
// LEARNING CONTENT - Structured educational journey for Claude Code
// Not blog copy-paste - proper curriculum design
// ============================================================================

export interface LearningModule {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  duration: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  type: 'concept' | 'interactive' | 'practice'
  content: LessonContent
}

export interface LessonContent {
  summary: string
  keyPoints: string[]
  example?: {
    bad?: string
    good: string
    explanation: string
  }
  interactiveId?: string // Links to 3D interactive component
  practicePrompt?: string
}

// ============================================================================
// MODULE 1: UNDERSTANDING THE AGENT
// ============================================================================

export const MODULE_AGENT: LearningModule = {
  id: 'understanding-agent',
  title: 'Understanding the Agent',
  subtitle: 'What Claude Code actually is and how it works',
  icon: 'brain',
  color: '#fbbf24',
  duration: '10 min',
  lessons: [
    {
      id: 'what-is-claude-code',
      title: 'What is Claude Code?',
      type: 'concept',
      content: {
        summary: 'Claude Code is an agentic coding assistant. "Agentic" means it can take actions autonomously - reading files, running commands, making edits - until a task is complete.',
        keyPoints: [
          'Not just a chatbot - it can act on your codebase',
          'Runs in your terminal with full access to tools',
          'Uses the same Claude models (Sonnet, Opus) as the API',
          'The "agent" is really just the model + a simple loop',
        ],
      },
    },
    {
      id: 'the-loop',
      title: 'The Agentic Loop',
      type: 'interactive',
      content: {
        summary: 'Every coding agent - Claude Code, Cursor, Copilot - is fundamentally the same loop: get input, call model, if model wants to use a tool execute it and loop back, otherwise return response.',
        keyPoints: [
          '1. Your prompt becomes a message',
          '2. System prompt + history + your message = API call',
          '3. Model decides: use tool or respond?',
          '4. If tool: execute it, add result, loop back to step 2',
          '5. If no tool: return response to user',
        ],
        example: {
          good: `while True:
    response = model(messages, tools)
    if response.stop_reason != "tool_use":
        return response.text  # Done
    results = execute(response.tool_calls)
    messages.append(results)`,
          explanation: "That's it. The entire agent architecture. The model IS the agent - your code just provides tools and stays out of the way.",
        },
        interactiveId: 'loop-chamber',
      },
    },
    {
      id: 'model-is-agent',
      title: 'The Model is 80%',
      type: 'concept',
      content: {
        summary: 'Complex agent frameworks don\'t make agents better. Modern LLMs are trained to BE agents. Model selection matters more than architecture.',
        keyPoints: [
          'Don\'t over-engineer the wrapper',
          'Focus on tool design and prompt quality',
          'The model handles reasoning, planning, error recovery',
          'Your job: give it good tools and clear instructions',
        ],
        example: {
          bad: 'Building elaborate "agent frameworks" with complex state machines',
          good: 'Simple loop + well-designed tools + clear CLAUDE.md',
          explanation: 'The sophistication is in the model, not your code. Keep the wrapper simple.',
        },
      },
    },
  ],
}

// ============================================================================
// MODULE 2: CONTEXT AND MEMORY
// ============================================================================

export const MODULE_CONTEXT: LearningModule = {
  id: 'context-memory',
  title: 'Context & Memory',
  subtitle: 'How Claude sees your conversation and remembers things',
  icon: 'layers',
  color: '#ef4444',
  duration: '15 min',
  lessons: [
    {
      id: 'what-claude-sees',
      title: 'What Claude Sees Each Turn',
      type: 'concept',
      content: {
        summary: 'Every API call sends everything: system prompt + all previous messages + your new message. Claude doesn\'t "remember" between calls - it re-reads the entire history.',
        keyPoints: [
          'System: CLAUDE.md + tool definitions + loaded skills',
          'History: All previous user/assistant/tool messages',
          'Current: Your new prompt',
          'This entire context is sent on every single turn',
        ],
        interactiveId: 'context-pool',
      },
    },
    {
      id: 'context-degrades',
      title: 'Context Degrades at 30%',
      type: 'interactive',
      content: {
        summary: 'Opus has 200K tokens, but quality starts dropping at 20-40% usage, not 100%. After ~20 tool calls, earlier information gets buried.',
        keyPoints: [
          '0-20%: Optimal quality, full attention',
          '20-35%: Quality starting to degrade',
          '35-50%: Noticeable degradation',
          '50%+: High risk of mistakes and forgotten context',
        ],
        example: {
          bad: 'One conversation for auth system + database refactor + API redesign',
          good: 'Separate conversation for each major feature',
          explanation: 'Contexts bleed together. Keep conversations focused.',
        },
        interactiveId: 'context-meter',
      },
    },
    {
      id: 'claude-md',
      title: 'CLAUDE.md: Persistent Memory',
      type: 'interactive',
      content: {
        summary: 'CLAUDE.md is read at the start of every session. It\'s your way to configure Claude\'s behavior project-wide.',
        keyPoints: [
          'Keep it SHORT - ~150 instructions max (system prompt uses ~50)',
          'Make it SPECIFIC to your project, not generic',
          'Tell WHY, not just what - context helps Claude generalize',
          'Press # to add instructions live, update constantly',
        ],
        example: {
          bad: 'Documentation for a new hire: "We use React for the frontend..."',
          good: 'Notes for yourself with amnesia: "ALWAYS run pytest after edits - CI catches nothing"',
          explanation: 'Good CLAUDE.md is terse, specific, and explains the weird stuff.',
        },
        interactiveId: 'claude-md-sanctum',
      },
    },
    {
      id: 'managing-context',
      title: 'Managing Context',
      type: 'practice',
      content: {
        summary: 'Practical techniques to keep context clean and Claude effective.',
        keyPoints: [
          'One feature per conversation - scope tightly',
          'Use external memory: SCRATCHPAD.md for plans',
          'Copy-paste reset: /compact → /clear → paste essentials',
          '/clear when confused - fresh start beats degraded context',
        ],
        practicePrompt: 'Try the copy-paste reset: Start a task, accumulate context, then /compact to get summary, /clear to reset, paste back only what matters.',
      },
    },
  ],
}

// ============================================================================
// MODULE 3: TOOLS
// ============================================================================

export const MODULE_TOOLS: LearningModule = {
  id: 'tools',
  title: 'The Tool Workshop',
  subtitle: 'Master the 8 core tools Claude uses',
  icon: 'wrench',
  color: '#22c55e',
  duration: '20 min',
  lessons: [
    {
      id: 'tool-overview',
      title: 'How Tools Work',
      type: 'concept',
      content: {
        summary: 'Tools are functions the model can call. Each tool has a name, parameters, and returns a result that gets added to context.',
        keyPoints: [
          'Model sees tool descriptions in system prompt',
          'Model outputs JSON: which tool + what parameters',
          'Your code executes the tool, returns result',
          'Result becomes a message, model continues',
        ],
      },
    },
    {
      id: 'read-edit-write',
      title: 'Read → Edit → Write',
      type: 'interactive',
      content: {
        summary: 'The file manipulation trinity. Read to see, Edit to modify, Write to create.',
        keyPoints: [
          'Read: ALWAYS read before edit. Supports code, images, PDFs, notebooks.',
          'Edit: Surgical replacement. old_string must be unique. Add context if not.',
          'Write: Creates new files OR overwrites. Must read first if overwriting.',
        ],
        example: {
          bad: 'Editing a file without reading it first',
          good: 'Read file → understand structure → Edit specific section',
          explanation: 'Edit requires exact string match. Reading first ensures you have the right context.',
        },
        interactiveId: 'tool-workshop',
      },
    },
    {
      id: 'bash-grep-glob',
      title: 'Bash, Grep, Glob',
      type: 'interactive',
      content: {
        summary: 'Shell commands, search, and file finding.',
        keyPoints: [
          'Bash: git, npm, python, docker - NOT for reading files',
          'Grep: Ripgrep search. Find patterns across codebase. Regex syntax.',
          'Glob: Find files by pattern. **/*.ts, src/**/*.py',
        ],
        example: {
          bad: 'Using Bash with cat to read files',
          good: 'Use Read for files, Bash for commands like git status',
          explanation: 'Specialized tools are faster and provide better output.',
        },
        interactiveId: 'tool-workshop',
      },
    },
    {
      id: 'task-subagents',
      title: 'Task: The Subagent Spawner',
      type: 'interactive',
      content: {
        summary: 'Task spawns a child agent with fresh context. Essential for exploration without polluting parent context.',
        keyPoints: [
          'Child starts with empty context (just your prompt)',
          'Child can read 20 files, parent stays clean',
          'Parent receives only text summary, not full exploration',
          'Use for: exploration, parallel work, context isolation',
        ],
        example: {
          bad: 'Reading 15 files in main conversation to understand codebase',
          good: 'Task("Find all authentication-related files and summarize the pattern")',
          explanation: 'Child does the exploration, parent gets clean summary.',
        },
        interactiveId: 'task-portal',
      },
    },
  ],
}

// ============================================================================
// MODULE 4: EFFECTIVE PROMPTING
// ============================================================================

export const MODULE_PROMPTING: LearningModule = {
  id: 'prompting',
  title: 'Effective Prompting',
  subtitle: 'How to communicate clearly with Claude',
  icon: 'message',
  color: '#0ea5e9',
  duration: '15 min',
  lessons: [
    {
      id: 'think-first',
      title: 'Think Before Typing',
      type: 'concept',
      content: {
        summary: 'The single biggest mistake: typing before thinking. Plan mode (Shift+Tab twice) produces dramatically better results.',
        keyPoints: [
          'Think about architecture before asking Claude to build',
          'Think about what you know about a bug before asking Claude to fix',
          'Back and forth with an LLM to design approach first',
          '5 minutes of planning saves hours of debugging',
        ],
        example: {
          bad: '"Build me an auth system"',
          good: '"Build email/password auth using User model, sessions in Redis with 24h expiry, middleware protecting /api/protected/*"',
          explanation: 'Specificity removes ambiguity. Claude fills gaps with assumptions you might not want.',
        },
        interactiveId: 'neural-network',
      },
    },
    {
      id: 'specificity',
      title: 'Be Ruthlessly Specific',
      type: 'practice',
      content: {
        summary: 'Vague prompts produce vague results. Constraints produce focused results.',
        keyPoints: [
          'Name exact files: "src/auth/middleware.ts" not "the auth file"',
          'Specify patterns: "Use existing UserService pattern"',
          'Include constraints: "Keep under 50 lines" or "No new dependencies"',
          'Give examples: "Like how we did it in payments.ts"',
        ],
        practicePrompt: 'Take a vague prompt you\'d normally write and rewrite it with: exact file paths, pattern references, constraints, and an example.',
      },
    },
    {
      id: 'tell-what-not',
      title: 'Tell It What NOT to Do',
      type: 'concept',
      content: {
        summary: 'Claude (especially Opus) tends to over-engineer. Explicitly constrain this.',
        keyPoints: [
          '"Keep this simple. One file if possible."',
          '"Don\'t add abstractions I didn\'t ask for."',
          '"No new dependencies."',
          '"Minimal changes - only what\'s necessary."',
        ],
        example: {
          bad: 'Accepting 12 files for a 3-line fix',
          good: '"Fix only the null check bug. Don\'t refactor surrounding code."',
          explanation: 'Without constraints, Claude optimizes for "comprehensive" which often means over-engineered.',
        },
      },
    },
    {
      id: 'give-context',
      title: 'Give Context About Why',
      type: 'concept',
      content: {
        summary: '"This runs on every request" changes how Claude approaches performance. Share constraints Claude can\'t see.',
        keyPoints: [
          'Performance context: "Called 1000x/sec" vs "runs once at startup"',
          'User context: "Non-technical users will see this"',
          'Timeline context: "Prototype we\'ll throw away" vs "production system"',
          'Team context: "Junior devs maintain this"',
        ],
      },
    },
  ],
}

// ============================================================================
// MODULE 5: EXTENSIONS & AUTOMATION
// ============================================================================

export const MODULE_EXTENSIONS: LearningModule = {
  id: 'extensions',
  title: 'Extensions & Automation',
  subtitle: 'MCP, Skills, Hooks, and building systems',
  icon: 'plug',
  color: '#8b5cf6',
  duration: '15 min',
  lessons: [
    {
      id: 'mcp-servers',
      title: 'MCP: External Connections',
      type: 'interactive',
      content: {
        summary: 'Model Context Protocol lets Claude connect to external services - GitHub, Slack, databases, APIs.',
        keyPoints: [
          'If you\'re copy-pasting info into Claude, there\'s probably an MCP for it',
          'Servers expose tools + resources to Claude',
          'OAuth 2.1 for secure authorization',
          'Build your own if one doesn\'t exist',
        ],
        interactiveId: 'mcp-portal',
      },
    },
    {
      id: 'skills',
      title: 'Skills: Domain Expertise',
      type: 'concept',
      content: {
        summary: 'Skills are loadable expertise files. They inject domain knowledge without modifying the base model.',
        keyPoints: [
          'SKILL.md files with YAML frontmatter',
          'Injected as tool_result (cacheable, not in system prompt)',
          'Edit text files, not retrain models',
          'Team-specific patterns, schemas, conventions',
        ],
      },
    },
    {
      id: 'hooks',
      title: 'Hooks: Automation Triggers',
      type: 'interactive',
      content: {
        summary: 'Hooks run code automatically before/after Claude actions. Auto-format, lint, notify.',
        keyPoints: [
          'PreToolUse: Run before tool executes',
          'PostToolUse: Run after tool completes',
          'Block actions with non-zero exit code',
          'Great for: formatting, linting, notifications',
        ],
        interactiveId: 'hook-rune',
      },
    },
    {
      id: 'headless-systems',
      title: 'Building Systems',
      type: 'concept',
      content: {
        summary: 'The real power: claude -p flag runs headless. Script it, chain it, automate it.',
        keyPoints: [
          'claude -p "prompt" runs without interactive mode',
          'Pipe output, chain with bash, integrate in CI',
          'Auto PR reviews, support responses, documentation',
          'The flywheel: mistakes → review → improve CLAUDE.md → better',
        ],
        example: {
          good: 'git diff | claude -p "Review this diff for security issues"',
          explanation: 'Claude becomes a component in your automation, not just a chat interface.',
        },
      },
    },
  ],
}

// ============================================================================
// MODULE 6: TROUBLESHOOTING
// ============================================================================

export const MODULE_TROUBLESHOOTING: LearningModule = {
  id: 'troubleshooting',
  title: 'When Things Go Wrong',
  subtitle: 'Breaking loops and recovering from mistakes',
  icon: 'refresh',
  color: '#f97316',
  duration: '10 min',
  lessons: [
    {
      id: 'breaking-loops',
      title: 'Breaking the Loop',
      type: 'concept',
      content: {
        summary: 'Sometimes Claude loops - trying the same thing, failing, retrying. Don\'t push harder. Change approach.',
        keyPoints: [
          'More explaining won\'t help if 3 explanations failed',
          '/clear gives fresh start with CLAUDE.md intact',
          'Simplify the task - if Claude struggles, your plan is insufficient',
          'Show don\'t tell - write a minimal example',
        ],
      },
    },
    {
      id: 'reframing',
      title: 'The Art of Reframing',
      type: 'practice',
      content: {
        summary: 'Different framings unlock different solutions. If one approach fails, try another angle.',
        keyPoints: [
          '"Implement as state machine" vs "handle these transitions"',
          '"Make it work first, then optimize" vs "build performant solution"',
          '"Copy this pattern from X" vs "build from scratch"',
          '"What would break this?" vs "is this correct?"',
        ],
        practicePrompt: 'Take a stuck task and reframe it three different ways. Try the most different framing.',
      },
    },
    {
      id: 'input-output',
      title: 'Bad Input = Bad Output',
      type: 'concept',
      content: {
        summary: 'If you\'re getting bad results with a good model, your prompting needs work. Model quality is table stakes.',
        keyPoints: [
          'Specific > vague',
          'Constraints > open-ended',
          'Examples > descriptions',
          'The bottleneck is almost always on the human side',
        ],
      },
    },
  ],
}

// ============================================================================
// ALL MODULES
// ============================================================================

export const LEARNING_MODULES: LearningModule[] = [
  MODULE_AGENT,
  MODULE_CONTEXT,
  MODULE_TOOLS,
  MODULE_PROMPTING,
  MODULE_EXTENSIONS,
  MODULE_TROUBLESHOOTING,
]

// ============================================================================
// QUICK REFERENCE DATA
// ============================================================================

export const KEYBOARD_SHORTCUTS = [
  { keys: 'Shift+Tab ×2', action: 'Enter Plan Mode', description: 'Think before implementing' },
  { keys: '#', action: 'Add to CLAUDE.md', description: 'Save instruction to memory' },
  { keys: '/compact', action: 'Compress Context', description: 'Summarize conversation' },
  { keys: '/clear', action: 'Fresh Start', description: 'Clear context, keep CLAUDE.md' },
  { keys: '/cost', action: 'Check Usage', description: 'See token usage and cost' },
  { keys: 'Esc', action: 'Cancel/Back', description: 'Interrupt or go back' },
  { keys: 'Tab', action: 'Accept Suggestion', description: 'Accept inline completion' },
]

export const TOOLS_QUICK_REF = [
  { name: 'Read', signature: 'Read(path, offset?, limit?)', use: 'See file contents' },
  { name: 'Edit', signature: 'Edit(path, old, new)', use: 'Replace text in file' },
  { name: 'Write', signature: 'Write(path, content)', use: 'Create/overwrite file' },
  { name: 'Bash', signature: 'Bash(command)', use: 'Run shell command' },
  { name: 'Grep', signature: 'Grep(pattern, path?)', use: 'Search code' },
  { name: 'Glob', signature: 'Glob(pattern)', use: 'Find files by name' },
  { name: 'Task', signature: 'Task(prompt, type)', use: 'Spawn subagent' },
  { name: 'TodoWrite', signature: 'TodoWrite(todos)', use: 'Track tasks' },
]

export const MODEL_GUIDE = {
  sonnet: {
    name: 'Sonnet',
    best: 'Execution',
    when: 'Clear path, specific plan, boilerplate, refactoring',
    cost: 'Lower',
    speed: 'Faster',
  },
  opus: {
    name: 'Opus',
    best: 'Planning',
    when: 'Complex reasoning, architecture, deep tradeoffs',
    cost: 'Higher',
    speed: 'Slower',
  },
}
