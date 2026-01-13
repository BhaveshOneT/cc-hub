// ============================================================================
// THE ARCHMAGE'S JOURNEY - Fantasy-themed Claude Code Learning Simulation
// Technical depth for senior developers, fantasy presentation
// ============================================================================

export type WizardState =
  | 'idle'
  | 'walking'
  | 'thinking'
  | 'working'      // Spell casting
  | 'reading'
  | 'celebrating'
  | 'pointing'
  | 'channeling'   // Power flow
  | 'summoning'    // Conjuring spirits

export type WizardTarget =
  | 'center'       // Eternal Hourglass
  | 'reservoir'    // Arcane Reservoir (context)
  | 'artifacts'    // Enchanted Artifacts Wall (tools)
  | 'grimoire'     // Grimoire of Permanence (CLAUDE.md)
  | 'portal'       // Portal Nexus (MCP)
  | 'wands'        // Wand Rack (Skills)
  | 'summoning'    // Summoning Sanctum (Subagents)
  | 'condenser'    // Essence Condenser (/compact)
  | 'circle'       // Cleansing Circle (/clear)
  | 'triad'        // Compound Effect center

export interface Chapter {
  id: string
  title: string
  subtitle: string
  color: string
  beats: StoryBeat[]
}

export interface StoryBeat {
  id: string
  title: string
  narration: string
  detail: string
  tips?: string[]
  codeExample?: string
  antiPattern?: string
  wizardState: WizardState
  wizardTarget: WizardTarget
  highlight?: string
  showTool?: string
  contextLevel?: number  // 0-100, affects fog and reservoir
  duration: number
}

// ============================================================================
// CHAPTER 1: UNDERSTANDING THE AGENT
// ============================================================================

export const CHAPTER_AGENT: Chapter = {
  id: 'agent',
  title: 'The Arcane Loop',
  subtitle: 'Understanding Agentic Architecture',
  color: '#f59e0b',
  beats: [
    {
      id: 'what-is-agentic',
      title: 'The Eternal Cycle',
      narration: 'Behold the Eternal Hourglass - the heart of all agentic systems. Claude Code isn\'t a simple oracle. It\'s an autonomous force that acts until your will is done.',
      detail: 'The term "agentic" means the system can act autonomously in a loop. Unlike a chatbot that responds once per message, Claude Code will: read files to understand context, make edits, run commands to verify, fix errors, and repeat - all from a single prompt. The sand flows endlessly - prompt, action, result, repeat.',
      tips: [
        'Claude Code runs locally - your code never leaves your machine unless you explicitly use external MCPs',
        'The agent can be interrupted at any time with Escape',
        'Use /cost to monitor mana (token) usage during complex tasks',
      ],
      wizardState: 'idle',
      wizardTarget: 'center',
      highlight: 'hourglass',
      contextLevel: 10,
      duration: 60000,
    },
    {
      id: 'the-loop',
      title: 'The Agentic Loop Revealed',
      narration: 'Every coding agent - Claude Code, Cursor, Copilot - is fundamentally the same magical architecture.',
      detail: 'The entire agent is a simple loop: (1) Your prompt becomes a message, (2) System prompt + conversation history + your message = one API call, (3) Model decides: use a tool or respond?, (4) If tool: execute it, add result to messages, loop back to step 2, (5) If no tool needed: return response to user. That\'s it. The sophistication is in the model, not the loop.',
      codeExample: `while True:
  response = model(messages, tools)
  if response.stop_reason != "tool_use":
    return response.text  # Done
  result = execute(response.tool_calls)
  messages.append(result)  # Loop`,
      tips: [
        'Tool results are appended as messages - they consume context',
        'Each iteration is a full API call with the entire history',
        'The loop continues until the model decides no more tools are needed',
      ],
      wizardState: 'walking',
      wizardTarget: 'grimoire',
      highlight: 'grimoire',
      contextLevel: 12,
      duration: 60000,
    },
    {
      id: 'model-is-80',
      title: 'The Wizard is the Power',
      narration: 'Complex "agent frameworks" don\'t make agents better. The power lies within the wizard - not the sanctum.',
      detail: 'Don\'t over-engineer the wrapper. The model handles: reasoning about what to do next, planning multi-step operations, recovering from errors, knowing when to stop. Your job is to provide good tools with clear descriptions and a well-written CLAUDE.md (Grimoire). The sanctum adds maybe 20% - tool execution, context management. The wizard provides the other 80%.',
      antiPattern: 'Building elaborate state machines, planning systems, or "agent orchestrators" on top of Claude. The model already does this internally.',
      tips: [
        'Focus your effort on CLAUDE.md quality, not framework complexity',
        'Tool descriptions matter more than tool implementation',
        'Let the model decide the approach - don\'t over-constrain',
      ],
      wizardState: 'pointing',
      wizardTarget: 'center',
      contextLevel: 15,
      duration: 60000,
    },
    {
      id: 'model-selection',
      title: 'Sonnet vs Opus: Two Forms of Magic',
      narration: 'Different spells for different tasks. Know when to invoke each power.',
      detail: 'Sonnet (default): Swift, economical, excellent for execution. Use when: the path is clear, you have a specific plan, refactoring, boilerplate, well-defined features. Opus: Deliberate, powerful, superior reasoning. Use when: complex architecture decisions, subtle bugs, deep tradeoffs, novel problems. The /model command switches mid-conversation. Start with Sonnet, invoke Opus when the challenge demands it.',
      tips: [
        'Use Shift+Tab twice to enter Plan Mode with Opus for complex tasks',
        'Sonnet is 5-10x cheaper - use it for implementation after Opus plans',
        '/model opus for the hard thinking, /model sonnet for the typing',
      ],
      wizardState: 'thinking',
      wizardTarget: 'center',
      contextLevel: 18,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 2: CONTEXT & MEMORY
// ============================================================================

export const CHAPTER_CONTEXT: Chapter = {
  id: 'context',
  title: 'The Arcane Reservoir',
  subtitle: 'Context & Memory Management',
  color: '#ef4444',
  beats: [
    {
      id: 'what-claude-sees',
      title: 'The Reservoir\'s Nature',
      narration: 'Every API call reconstructs reality anew. Claude doesn\'t "remember" - it re-reads the entire magical essence.',
      detail: 'Each turn, Claude receives: System prompt (CLAUDE.md + tool definitions + loaded skills) + All previous messages (user, assistant, tool results) + Your new message. This is a single API call. There is no persistent memory between calls - the entire context is reconstructed each time. This is why context management matters so much.',
      tips: [
        'Tool results are full messages - reading a 1000-line file adds 1000 lines to context',
        'System prompt uses ~50K of your 200K tokens before you type anything',
        'Every message stays forever until you /clear',
      ],
      wizardState: 'walking',
      wizardTarget: 'reservoir',
      highlight: 'reservoir',
      contextLevel: 20,
      duration: 60000,
    },
    {
      id: 'context-degrades',
      title: 'The Fading Mist',
      narration: 'Watch as the mist creeps in. At 45% capacity, the reservoir begins to cloud. Quality fades before you hit the limit.',
      detail: 'Context degradation is not linear. Quality zones: 0-20% (~40K tokens): Optimal, full attention. 20-35%: Noticeable degradation begins. 35-50%: Significant degradation, Claude may miss earlier context. 50%+: High risk of errors. According to Qodo\'s research, Claude Code provides a "more dependable and explicit 200K-token context window" while other tools often truncate to 70-120K internally.',
      antiPattern: 'Using one conversation for "auth system + database refactor + API redesign". Contexts bleed together and degrade.',
      tips: [
        'One focused feature per conversation',
        '/compact summarizes and compresses context',
        '/clear resets to CLAUDE.md only - use liberally',
      ],
      wizardState: 'pointing',
      wizardTarget: 'reservoir',
      highlight: 'reservoir',
      contextLevel: 45,
      duration: 60000,
    },
    {
      id: 'claudemd-memory',
      title: 'The Grimoire of Permanence',
      narration: 'The Grimoire holds eternal knowledge. While conversations fade, these golden words persist across every invocation.',
      detail: 'CLAUDE.md is the ONLY persistent memory across conversations. Settings hierarchy: ~/.claude/CLAUDE.md (user-level, all projects), ./CLAUDE.md (project root, shared with team), ./CLAUDE.md in subdirs (scoped to that directory). The # command adds instructions live. Common patterns: Build commands, test commands, project architecture notes, coding conventions, things Claude keeps getting wrong.',
      codeExample: `# Project: MyApp
Build: npm run build
Test: npm test
Lint: npm run lint

## Architecture
- React frontend in /src
- Express API in /server
- PostgreSQL via Prisma

## Conventions
- Use functional components
- Prefer composition over inheritance`,
      tips: [
        'Use # to add context during conversation',
        'Review CLAUDE.md periodically - remove outdated instructions',
        'Keep it focused: specific commands > vague preferences',
      ],
      wizardState: 'reading',
      wizardTarget: 'grimoire',
      highlight: 'grimoire',
      contextLevel: 25,
      duration: 60000,
    },
    {
      id: 'clear-and-compact',
      title: 'Cleansing & Condensing',
      narration: 'When the mist grows thick, two rituals restore clarity. The Cleansing Circle purifies. The Essence Condenser compresses.',
      detail: '/clear - Activates the Cleansing Circle. Wipes conversation history but KEEPS CLAUDE.md loaded. Your persistent memory survives, fresh context restored. /compact - The Essence Condenser. Uses AI to summarize the conversation, dramatically reducing token count while preserving essential context. Use /clear liberally between unrelated tasks. Use /compact mid-task when context grows but you need continuity.',
      tips: [
        '/clear is free - use it between features',
        '/compact costs tokens but preserves conversation flow',
        'Better to /clear too often than too rarely',
      ],
      wizardState: 'channeling',
      wizardTarget: 'circle',
      highlight: 'circle',
      contextLevel: 30,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 3: THE TOOL WORKSHOP
// ============================================================================

export const CHAPTER_TOOLS: Chapter = {
  id: 'tools',
  title: 'Enchanted Artifacts',
  subtitle: 'The Eight Core Tools',
  color: '#22c55e',
  beats: [
    {
      id: 'tools-overview',
      title: 'The Artifact Wall',
      narration: 'Eight enchanted artifacts line the wall - each imbued with a specific power. Master them all.',
      detail: 'Claude Code exposes these core tools to the model: Read, Edit, Write, Bash, Grep, Glob, Task, TodoWrite. Each tool has specific capabilities and costs. The model decides which to use based on the task. Understanding what each tool does helps you understand Claude\'s approach - and debug when things go wrong.',
      tips: [
        'Each tool call adds to context - tool results can be large',
        'The model picks tools based on its training and your prompt',
        'If Claude uses the wrong tool, adjust your prompt to guide it',
      ],
      wizardState: 'walking',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 22,
      duration: 60000,
    },
    {
      id: 'read-tool',
      title: 'The Scrying Mirror',
      narration: 'The Scrying Mirror reveals hidden knowledge - files, images, PDFs, Jupyter notebooks. It sees all.',
      detail: 'Read: Loads file contents into context. Supports: source code (with line numbers), images (visually parsed), PDFs (text extracted), Jupyter notebooks (cells with outputs). Has offset/limit parameters for partial reads. Important: Reading a file adds its ENTIRE contents to context. A 2000-line file = 2000 lines of context consumed.',
      antiPattern: 'Reading entire large files when you only need a function. Use Grep to find the location first, then Read with offset/limit.',
      showTool: 'read',
      wizardState: 'working',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 25,
      duration: 60000,
    },
    {
      id: 'edit-write-tools',
      title: 'Quill & Scroll',
      narration: 'The Quill of Alteration rewrites existing text. The Conjuration Scroll creates anew.',
      detail: 'Edit: Surgical text replacement in existing files. Must read the file first. Replaces old_string with new_string. The old_string must be unique in the file - provide enough context. Write: Creates new files or completely overwrites existing ones. Use for new files; prefer Edit for modifications. Both tools require the target file to NOT be open in an editor with unsaved changes.',
      codeExample: `// Edit example - surgical replacement
Edit({
  file: "src/auth.ts",
  old_string: "const timeout = 30",
  new_string: "const timeout = 60"
})`,
      showTool: 'edit',
      wizardState: 'working',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 28,
      duration: 60000,
    },
    {
      id: 'bash-tool',
      title: 'The Staff of Command',
      narration: 'The Staff of Command channels raw power - executing shell commands directly in your realm.',
      detail: 'Bash: Executes shell commands with optional timeout. Use for: git operations, npm/yarn, docker, make, running tests, any CLI tool. NOT for file operations (use Read/Write instead). Commands run in a persistent shell session. Timeout default is 120s, max 600s. Sandboxed for safety - destructive commands may be blocked.',
      tips: [
        'Bash for commands, Read for files - don\'t use cat/head/tail',
        'Long-running commands will timeout - use background mode',
        'Check exit codes in output to verify success',
      ],
      showTool: 'bash',
      wizardState: 'pointing',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 30,
      duration: 60000,
    },
    {
      id: 'search-tools',
      title: 'Orb & Compass',
      narration: 'The Seeking Orb finds content within files. The Pathfinder Compass locates files by pattern.',
      detail: 'Grep: Ripgrep-powered content search. Regex patterns, file type filtering, context lines. Use to find where something is defined or used. Output modes: content, files_with_matches, count. Glob: File path pattern matching. "**/*.tsx" finds all TSX files. Use to discover file structure, find files by name pattern. Both are read-only and context-efficient compared to reading multiple files.',
      codeExample: `// Find all uses of AuthContext
Grep({ pattern: "AuthContext", type: "tsx" })

// Find all test files
Glob({ pattern: "**/*.test.ts" })`,
      showTool: 'grep',
      wizardState: 'thinking',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 32,
      duration: 60000,
    },
    {
      id: 'task-tool',
      title: 'The Summoning Rune',
      narration: 'The Summoning Rune calls forth spectral agents - each with their own isolated realm of context.',
      detail: 'Task: Spawns a subagent with fresh context. The subagent can explore, research, or implement independently, then return a summary. Key insight: Subagents don\'t pollute your main context. A subagent can read 50 files during research, but only the summary comes back to your conversation. Use for: Large codebase exploration, isolated implementation tasks, research that requires reading many files.',
      tips: [
        'Subagents are your context hygiene tool',
        'Use for exploration before making decisions',
        'The summary is the only thing that enters your context',
      ],
      showTool: 'task',
      wizardState: 'summoning',
      wizardTarget: 'artifacts',
      highlight: 'artifacts',
      contextLevel: 35,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 4: EFFECTIVE PROMPTING
// ============================================================================

export const CHAPTER_PROMPTING: Chapter = {
  id: 'prompting',
  title: 'The Art of Incantation',
  subtitle: 'Prompting Patterns That Work',
  color: '#0ea5e9',
  beats: [
    {
      id: 'think-first',
      title: 'Consult Before Conjuring',
      narration: 'The wise wizard thinks before casting. Plan Mode reveals the path before you walk it.',
      detail: 'Before complex tasks, use Plan Mode (Shift+Tab twice). Claude will: Explore relevant code, Consider approaches, Present a plan for your approval. This prevents wasted effort on wrong approaches. The plan becomes shared context - Claude knows what you agreed on. For simple tasks, just ask. For complex tasks, plan first.',
      tips: [
        'Plan Mode uses Opus for better reasoning',
        'Approve or modify the plan before implementation',
        'The plan document persists in your conversation',
      ],
      wizardState: 'thinking',
      wizardTarget: 'grimoire',
      highlight: 'grimoire',
      contextLevel: 25,
      duration: 60000,
    },
    {
      id: 'be-specific',
      title: 'Precision in Incantation',
      narration: 'Vague words yield vague magic. Be ruthlessly specific in your commands.',
      detail: 'Bad: "Fix the login". Good: "In src/auth/login.ts, the LoginForm component isn\'t validating email format before submission. Add email regex validation in the handleSubmit function, showing an error message below the email input if invalid." Specificity includes: Exact file paths, function/component names, what the current behavior is, what the desired behavior is, where to make the change.',
      antiPattern: '"Make it better", "Fix the bugs", "Clean up this code" - these waste tokens on Claude asking for clarification.',
      wizardState: 'pointing',
      wizardTarget: 'grimoire',
      contextLevel: 28,
      duration: 60000,
    },
    {
      id: 'tell-not-to',
      title: 'The Binding Words',
      narration: 'What you forbid is as important as what you command. Constrain the magic.',
      detail: 'Claude tries to be helpful. Sometimes too helpful. Explicitly constrain: "Don\'t refactor surrounding code", "Don\'t add comments to unchanged lines", "Don\'t modify the test files", "Only change the function I mentioned". Without constraints, Claude may: Add type annotations everywhere, Refactor adjacent code, Add extensive error handling you didn\'t ask for.',
      tips: [
        'Constraints prevent scope creep',
        'Be explicit about what NOT to change',
        'Add constraints to CLAUDE.md for recurring preferences',
      ],
      wizardState: 'working',
      wizardTarget: 'grimoire',
      highlight: 'grimoire',
      contextLevel: 30,
      duration: 60000,
    },
    {
      id: 'give-context',
      title: 'The Why Behind the What',
      narration: 'Context illuminates intent. Tell the wizard WHY, not just WHAT.',
      detail: 'Include: Why you\'re making this change (user complaint, performance, tech debt), What constraints exist (can\'t change API, must support IE11, deadline), Who will use this (internal tool vs public API), What you\'ve already tried (avoids repeated suggestions). Context helps Claude make judgment calls that align with your actual goals.',
      codeExample: `"We're getting timeout errors in production for users
with large datasets. The fetchData function needs
pagination - our API already supports limit/offset
params, we just need to implement them on the frontend.
Keep backwards compatibility with existing callers."`,
      wizardState: 'reading',
      wizardTarget: 'grimoire',
      contextLevel: 32,
      duration: 60000,
    },
    {
      id: 'iterate',
      title: 'Refine, Don\'t Restart',
      narration: 'Each spell builds on the last. Iterate forward rather than starting anew.',
      detail: 'When Claude\'s first attempt isn\'t right: Don\'t just repeat the request. Do say what was wrong: "That changes the API signature - keep the existing params, just add the new one". Build on the attempt: "Good structure, but the error handling should throw, not return null". Reference specific lines: "Line 42 is missing the null check we discussed". Each iteration adds context. Use that context, don\'t throw it away.',
      antiPattern: 'Hitting /clear and re-explaining everything from scratch. The failed attempt IS useful context for the next attempt.',
      wizardState: 'channeling',
      wizardTarget: 'center',
      contextLevel: 35,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 5: SKILLS - Teaching Your Workflows
// ============================================================================

export const CHAPTER_SKILLS: Chapter = {
  id: 'skills',
  title: 'The Wand Rack',
  subtitle: 'Skills: Teaching Your Workflows',
  color: '#8b5cf6',
  beats: [
    {
      id: 'what-are-skills',
      title: 'Enchanted Wands',
      narration: 'Each wand on the rack holds learned magic - domain expertise that Claude can invoke automatically.',
      detail: 'A skill is a markdown file that teaches Claude how to do something specific to your work. When you ask Claude something that matches a skill\'s purpose, it automatically applies it. Create a folder with a SKILL.md file: ~/.claude/skills/your-skill-name/SKILL.md for personal skills, or .claude/skills/your-skill-name/SKILL.md for project-specific skills shared with your team.',
      tips: [
        'Skills are loaded based on their description - be specific about triggers',
        'Personal skills in ~/.claude/skills/, team skills in .claude/skills/',
        'Skills can include example code, schemas, and conventions',
      ],
      wizardState: 'walking',
      wizardTarget: 'wands',
      highlight: 'wands',
      contextLevel: 25,
      duration: 60000,
    },
    {
      id: 'skill-structure',
      title: 'The Spell Scroll Format',
      narration: 'Every skill scroll begins with a YAML incantation header - name and description that trigger the magic.',
      detail: 'Every SKILL.md starts with YAML frontmatter. The description is CRITICAL - Claude uses it to decide when to apply the skill. Be specific about trigger conditions. You can also explicitly tell Claude to "utilize x skill" and it will do so.',
      codeExample: `---
name: commit-messages
description: Generate commit messages following our
team's conventions. Use when creating commits or
when the user asks for help with commit messages.
---

# Commit Message Format
All commits follow conventional commits:
- feat: new feature
- fix: bug fix
- refactor: code change
Format: \`type(scope): description\``,
      tips: [
        'The description determines when the skill triggers',
        'Keep skills focused - one skill per workflow',
        'Add supporting files to the skill folder for reference material',
      ],
      wizardState: 'reading',
      wizardTarget: 'wands',
      highlight: 'wands',
      contextLevel: 28,
      duration: 60000,
    },
    {
      id: 'progressive-disclosure',
      title: 'Sealed Until Needed',
      narration: 'The scrolls remain sealed until relevant. Progressive disclosure keeps context clean.',
      detail: 'Key architectural principle: Claude pre-loads only the name and description of every installed skill at startup (roughly 100 tokens each). The full instructions only load when Claude determines the skill is relevant. This means you can have dozens of skills available without bloating your context. The wand glows when needed, the scroll unfurls only then.',
      tips: [
        'Many skills = minimal context cost until triggered',
        'Skill descriptions are always loaded, content only when needed',
        'Check loaded skills with "What skills do you have available?"',
      ],
      wizardState: 'thinking',
      wizardTarget: 'wands',
      highlight: 'wands',
      contextLevel: 30,
      duration: 60000,
    },
    {
      id: 'skill-examples',
      title: 'Beyond Code',
      narration: 'Skills extend beyond mere code. Database patterns, meeting notes, even personal workflows.',
      detail: 'Skills aren\'t limited to just code. Engineers have built skills for: Database query patterns specific to their schema, API documentation formats their company uses, Meeting notes templates, Even personal workflows like meal planning. The pattern works for anything where you find yourself repeatedly explaining the same context or preferences to Claude.',
      codeExample: `---
name: code-review-standards
description: Apply our team's code review standards
when reviewing PRs or suggesting improvements.
---

# Code Review Checklist
1. Check error handling completeness
2. Verify test coverage
3. Review naming conventions
4. Check for security issues`,
      wizardState: 'pointing',
      wizardTarget: 'wands',
      highlight: 'wands',
      contextLevel: 32,
      duration: 60000,
    },
    {
      id: 'skill-triggers',
      title: 'Automatic Recognition',
      narration: 'When the situation matches, the wand flies to hand. Claude recognizes when to invoke each skill.',
      detail: 'The goal is for Claude to recognize when it needs to utilize the skill on its own accord. Write clear, specific trigger conditions in your description. Test by asking Claude about tasks that should trigger the skill. If it doesn\'t recognize the context, refine the description to be more explicit about when to apply.',
      tips: [
        'Test your skill triggers with various phrasings',
        'Description should cover all trigger scenarios',
        'Use "utilize X skill" to force skill application',
        'Check settings → capabilities → skills to see loaded skills',
      ],
      wizardState: 'working',
      wizardTarget: 'wands',
      highlight: 'wands',
      contextLevel: 35,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 6: SUBAGENTS - Parallel Processing
// ============================================================================

export const CHAPTER_SUBAGENTS: Chapter = {
  id: 'subagents',
  title: 'The Summoning Sanctum',
  subtitle: 'Subagents: Parallel Processing',
  color: '#3b82f6',
  beats: [
    {
      id: 'what-are-subagents',
      title: 'Spectral Assistants',
      narration: 'Three summoning circles await. Each conjures a spirit with its own realm of context - isolated, focused, powerful.',
      detail: 'A subagent is a separate Claude instance with its own context window, system prompt, and tool permissions. When Claude delegates to a subagent, that subagent operates independently and returns a summary to the main conversation. Context degradation happens around 45% of your context window. Subagents let you offload complex tasks to a fresh context, then bring back only the relevant results.',
      tips: [
        'Subagents have their own 200K context - completely fresh',
        'Only the summary returns to your main context',
        'Use for research, exploration, or isolated implementation',
      ],
      wizardState: 'walking',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 28,
      duration: 60000,
    },
    {
      id: 'builtin-spirits',
      title: 'The Three Spirits',
      narration: 'Scout, Sage, and Battle Mage - three spirits await your command, each specialized for different tasks.',
      detail: 'Claude Code includes three built-in subagents: Explore (Scout Spirit): Fast, read-only agent for searching and analyzing codebases. Claude delegates here when it needs to understand your code without making changes. Plan (Sage Spirit): Research agent used during plan mode to gather context before presenting a plan. General-purpose (Battle Mage): Capable agent for complex, multi-step tasks requiring both exploration and action.',
      tips: [
        'Scout: Quick exploration, returns file maps and patterns',
        'Sage: Deep research for architectural decisions',
        'Battle Mage: Implementation tasks with multiple steps',
      ],
      wizardState: 'summoning',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 30,
      duration: 60000,
    },
    {
      id: 'delegation-pattern',
      title: 'The Spirit Quest',
      narration: 'The wizard speaks the task. The spirit departs to its own realm. It returns with knowledge condensed into a glowing orb.',
      detail: 'This is the part most people miss. Subagents don\'t share context directly - they operate in isolation. Communication happens through delegation and return: Main agent identifies a task suitable for delegation → Main agent invokes subagent with specific prompt → Subagent executes in its own context window → Subagent returns a SUMMARY of findings/actions → Main agent incorporates the summary and continues.',
      codeExample: `Main Wizard
├── "Find auth files"
│   └── Scout returns: "Found auth.py, middleware.py"
├── "Implement password reset"
│   └── Battle Mage returns: "Added endpoint, 2 files"
└── "Run all tests"
    └── Custom Spirit: "12 tests passing, 94%"`,
      wizardState: 'channeling',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 32,
      duration: 60000,
    },
    {
      id: 'context-isolation',
      title: 'Separate Realms',
      narration: 'Each spirit operates in its own pocket dimension. Your main context remains pure, undisturbed.',
      detail: 'The summary is key. A well-designed subagent doesn\'t dump its entire context back. Each subagent gets fresh context for its specific task. The main agent only holds the summaries, not the full exploration history. This prevents the context pollution that kills long coding sessions. Important constraint: subagents cannot spawn other subagents - prevents infinite nesting.',
      antiPattern: 'Using your main conversation for large explorations that read 50+ files. Use a subagent and get back a summary instead.',
      wizardState: 'thinking',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 35,
      duration: 60000,
    },
    {
      id: 'custom-familiars',
      title: 'Custom Familiars',
      narration: 'Create your own spirits. Run /agents to see available subagents and create new ones.',
      detail: 'Add a markdown file to ~/.claude/agents/ (user-level) or .claude/agents/ (project-level). Structure: YAML frontmatter with name, description, and tools. The tools field controls what the subagent can do - Read, Grep, Glob for read-only, add Write, Edit, Bash for implementation agents.',
      codeExample: `---
name: security-reviewer
description: Reviews code for security vulnerabilities.
tools: Read, Grep, Glob
---

You are a security-focused code reviewer. When analyzing:
1. Check for auth/authz gaps
2. Look for injection vulnerabilities
3. Identify data exposure risks
4. Flag insecure dependencies`,
      tips: [
        'Restrict tools for safety - security reviewers don\'t need Write',
        '/agents shows all available subagents',
        'Team agents in .claude/agents/ sync with version control',
      ],
      wizardState: 'working',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 38,
      duration: 60000,
    },
    {
      id: 'subagent-patterns',
      title: 'Practical Patterns',
      narration: 'Large refactoring. Code review pipelines. Research tasks. Master the patterns of delegation.',
      detail: 'Practical patterns: Large refactoring - have main agent identify files, spin up subagent per logical group, each returns summary. Code review pipeline - create security-scanner, style-checker, test-coverage agents, run in parallel, main agent synthesizes. Research - when exploring unfamiliar code, delegate to Scout with specific questions, get back distilled map of relevant files.',
      tips: [
        'Subagents for exploration, main context for decisions',
        'Parallel subagents for review pipelines',
        'Each subagent scope should be well-defined',
      ],
      wizardState: 'celebrating',
      wizardTarget: 'summoning',
      highlight: 'summoning',
      contextLevel: 40,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 7: MCP CONNECTORS
// ============================================================================

export const CHAPTER_MCP: Chapter = {
  id: 'mcp',
  title: 'The Portal Nexus',
  subtitle: 'MCP: External Connections',
  color: '#22c55e',
  beats: [
    {
      id: 'what-is-mcp',
      title: 'Dimensional Gateways',
      narration: 'The Portal Nexus connects your sanctum to external realms - GitHub, Slack, databases, and more.',
      detail: 'MCP (Model Context Protocol) is a standardized way for AI models to call external tools and data sources through a unified interface. You don\'t have to leave Claude to go into GitHub, Slack, Gmail, Drive, etc. You can get AI to "talk" to all of those through the Claude interface via an MCP server. Each portal is a connection to an external service.',
      tips: [
        'MCP eliminates context switching between tools',
        'Each service = one portal anchor orbiting the nexus',
        'Chain workflows that span multiple services',
      ],
      wizardState: 'walking',
      wizardTarget: 'portal',
      highlight: 'portal',
      contextLevel: 30,
      duration: 60000,
    },
    {
      id: 'connecting-services',
      title: 'Opening Portals',
      narration: 'The ritual to open a new portal. Speak the command, provide the anchor, and the gateway opens.',
      detail: 'The command to add a connector: claude mcp add --transport http <name> <url>. For authentication, add headers: claude mcp add --transport http github https://api.github.com/mcp --header "Authorization: Bearer your-token". Or use the web UI: settings → connectors → find your server → configure → give permissions.',
      codeExample: `# HTTP transport (recommended for remote)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# With authentication
claude mcp add --transport http github \\
  https://api.github.com/mcp \\
  --header "Authorization: Bearer token"

# View current connections
/mcp`,
      wizardState: 'working',
      wizardTarget: 'portal',
      highlight: 'portal',
      contextLevel: 33,
      duration: 60000,
    },
    {
      id: 'portal-examples',
      title: 'The Portals in Action',
      narration: 'Watch as data flows through each portal - issues from Jira, code from GitHub, messages from Slack.',
      detail: 'What MCP servers have done in practice: Implement features from issue trackers: "Add the feature described in JIRA issue ENG-4521". Query databases: "Find users who signed up in the last week from our PostgreSQL database". Integrate designs: "Update our email template based on the new Figma designs". Automate workflows: "Create Gmail drafts inviting these users to feedback session". Summarize Slack: "What did the team decide in #engineering about the API redesign?"',
      tips: [
        'GitHub: Repository management, issues, PRs, code search',
        'Slack: Channel history, thread summaries, search',
        'PostgreSQL: Direct queries without leaving Claude',
        'Linear/Jira: Issue tracking integration',
      ],
      wizardState: 'channeling',
      wizardTarget: 'portal',
      highlight: 'portal',
      contextLevel: 36,
      duration: 60000,
    },
    {
      id: 'chain-workflows',
      title: 'Portal Hopping',
      narration: 'The power isn\'t any single portal. It\'s jumping between them in one continuous session - flow state activated.',
      detail: 'A workflow that used to require five context switches (check issue tracker, look at design, review Slack discussion, implement code, update ticket) now happens in one continuous session. You\'re in flow state 24/7. The portals connect - light beams linking active gateways as data flows through the chain.',
      antiPattern: 'Leaving Claude to manually copy data between services. That\'s what MCP eliminates.',
      wizardState: 'pointing',
      wizardTarget: 'portal',
      highlight: 'portal',
      contextLevel: 38,
      duration: 60000,
    },
    {
      id: 'mcp-safety',
      title: 'Portal Safety',
      narration: 'Not all portals are equal. Third-party servers aren\'t verified. Use trusted anchors.',
      detail: 'Third-party MCP servers aren\'t verified by Anthropic. For sensitive integrations, review the server\'s source code or use official connectors from service providers. Run /mcp to see your current connections. Recommended safe connections: GitHub (official), Slack (official), Google Drive (official), PostgreSQL (standard), Linear/Jira (official).',
      tips: [
        'Official connectors from service providers are safest',
        'Review source code for third-party MCPs',
        '/mcp shows all active connections',
      ],
      wizardState: 'thinking',
      wizardTarget: 'portal',
      highlight: 'portal',
      contextLevel: 40,
      duration: 60000,
    },
    {
      id: 'compound-effect',
      title: 'The Triad of Power',
      narration: 'Skills encode your patterns. Subagents handle subtasks. MCP connects services. Together, they multiply your power.',
      detail: 'Here\'s where it all comes together. A skill that knows your codebase patterns + a subagent that handles testing + MCP connections to your issue tracker = a system that is unmatched. The skill encodes your team\'s conventions. The subagents keep your main conversation clean. The MCP connections eliminate context switching. The engineers who get the most from Claude Code invest in all three.',
      tips: [
        'Start with one skill for something you explain repeatedly',
        'Add one custom subagent for a common task',
        'Connect your most-used external services',
        'The compound effect grows with each addition',
      ],
      wizardState: 'celebrating',
      wizardTarget: 'triad',
      highlight: 'triad',
      contextLevel: 42,
      duration: 60000,
    },
  ],
}

// ============================================================================
// CHAPTER 8: TROUBLESHOOTING
// ============================================================================

export const CHAPTER_TROUBLESHOOTING: Chapter = {
  id: 'troubleshooting',
  title: 'Breaking the Loop',
  subtitle: 'When Things Go Wrong',
  color: '#f97316',
  beats: [
    {
      id: 'breaking-loops',
      title: 'The Cleansing Ritual',
      narration: 'Sometimes the magic loops - trying the same spell, failing, retrying. Don\'t push harder. Change approach.',
      detail: 'Signs of a loop: same error 3+ times, Claude apologizing repeatedly, "let me try again" with same approach. Don\'t: explain more (if 3 explanations failed, more won\'t help). Do: Step on the Cleansing Circle (/clear) for fresh start with CLAUDE.md intact, simplify the task (your plan may be insufficient), provide a minimal working example (show don\'t tell), change the framing entirely.',
      tips: [
        '/clear is your friend - fresh context often solves stuck problems',
        'If Claude struggles, the task decomposition is wrong',
        'Show examples rather than explain concepts',
      ],
      wizardState: 'channeling',
      wizardTarget: 'circle',
      highlight: 'circle',
      contextLevel: 50,
      duration: 60000,
    },
    {
      id: 'reframing',
      title: 'Three Approaches',
      narration: 'The path blocked? Seek another. Try three different framings before declaring defeat.',
      detail: 'Three framings before giving up: (1) Change the abstraction level - too high-level? Be more specific. Too specific? Zoom out. (2) Change the starting point - instead of "modify this function", try "here\'s what the function should do, rewrite it". (3) Change the constraints - maybe your requirements conflict. Relax one temporarily to find the core issue.',
      antiPattern: 'Repeating the same prompt with slightly different words. That\'s not reframing, that\'s hoping for luck.',
      wizardState: 'thinking',
      wizardTarget: 'center',
      contextLevel: 55,
      duration: 60000,
    },
    {
      id: 'input-quality',
      title: 'The Mirror of Truth',
      narration: 'Bad input yields bad output. If the magic fails repeatedly, look to your incantation first.',
      detail: 'When Claude keeps failing, ask: Is my prompt specific enough? Am I providing the necessary context? Are my constraints contradictory? Have I tried showing instead of telling? The model reflects your input. Garbage in, garbage out. Focus on prompt quality before blaming the model.',
      tips: [
        'Vague prompts = vague responses',
        'Contradictory constraints = confused responses',
        'Missing context = hallucinated context',
        'Show examples when explaining fails',
      ],
      wizardState: 'reading',
      wizardTarget: 'grimoire',
      highlight: 'grimoire',
      contextLevel: 45,
      duration: 60000,
    },
    {
      id: 'escape-hatches',
      title: 'Emergency Exits',
      narration: 'Know your escapes. Interrupt, undo, recover. The wizard always has a way out.',
      detail: 'Escape key: Interrupts current operation immediately. /undo: Reverts recent file changes. Git stash: Your safety net for larger experiments. /clear: Fresh context preserving CLAUDE.md. Escape twice: Exits Claude Code entirely. Never feel trapped - you have full control.',
      codeExample: `# Safety workflow
git stash              # Save current state
# ... experiment with Claude ...
git stash pop          # Restore if needed
git checkout .         # Nuclear option

# Or use Claude's built-in
/undo                  # Revert recent changes`,
      wizardState: 'pointing',
      wizardTarget: 'center',
      contextLevel: 35,
      duration: 60000,
    },
    {
      id: 'conclusion',
      title: 'The Journey Continues',
      narration: 'You have learned the ways of the Arcane Sanctum. Now go forth and create.',
      detail: 'You now understand: The Eternal Hourglass (agentic loop), The Arcane Reservoir (context management), The Enchanted Artifacts (tools), The Grimoire of Permanence (CLAUDE.md), The Wand Rack (skills), The Summoning Sanctum (subagents), The Portal Nexus (MCP). Master these systems and multiply your capabilities. The magic is yours to wield.',
      wizardState: 'celebrating',
      wizardTarget: 'center',
      highlight: 'triad',
      contextLevel: 20,
      duration: 60000,
    },
  ],
}

// ============================================================================
// ALL CHAPTERS
// ============================================================================

export const ALL_CHAPTERS: Chapter[] = [
  CHAPTER_AGENT,
  CHAPTER_CONTEXT,
  CHAPTER_TOOLS,
  CHAPTER_PROMPTING,
  CHAPTER_SKILLS,
  CHAPTER_SUBAGENTS,
  CHAPTER_MCP,
  CHAPTER_TROUBLESHOOTING,
]

// ============================================================================
// WIZARD AURA COLORS BY STATE
// ============================================================================

export const WIZARD_COLORS: Record<WizardState, string> = {
  idle: '#8b5cf6',
  walking: '#f59e0b',
  thinking: '#0ea5e9',
  working: '#22c55e',
  reading: '#a78bfa',
  celebrating: '#ec4899',
  pointing: '#f97316',
  channeling: '#3b82f6',
  summoning: '#8b5cf6',
}

// ============================================================================
// TOOL ARTIFACTS INFO
// ============================================================================

export const TOOL_INFO = {
  read: { name: 'Scrying Mirror', color: '#22c55e', icon: '🔮' },
  edit: { name: 'Quill of Alteration', color: '#f59e0b', icon: '✒️' },
  write: { name: 'Conjuration Scroll', color: '#3b82f6', icon: '📜' },
  bash: { name: 'Staff of Command', color: '#ef4444', icon: '⚡' },
  grep: { name: 'Seeking Orb', color: '#8b5cf6', icon: '🔍' },
  glob: { name: 'Pathfinder Compass', color: '#06b6d4', icon: '🧭' },
  task: { name: 'Summoning Rune', color: '#ec4899', icon: '✨' },
  todo: { name: 'Enchanted Checklist', color: '#84cc16', icon: '📋' },
}

// Legacy export for compatibility
export type BuilderState = WizardState
export const BUILDER_COLORS = WIZARD_COLORS
