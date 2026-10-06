/**
 * How Beltrán works with AI — a dated snapshot. The stack moves fast, so
 * the page shows when this was last reviewed, and a monthly reminder asks
 * for a fresh look (see .github/workflows/ai-stack-review.yml).
 */

/** Year and month of the last review. */
export const reviewedOn = '2026-10';

export interface AiItem {
  /** Message key for the line. */
  key: string;
  /** Where to see it, when it is his own work. */
  href?: string;
}

export interface AiGroup {
  headingKey: string;
  items: AiItem[];
}

export const aiStack: AiGroup[] = [
  {
    headingKey: 'ai_h_tools',
    items: [
      { key: 'ai_tools_claude_code' },
      { key: 'ai_tools_plugins' },
      { key: 'ai_tools_models' },
      { key: 'ai_tools_codex' },
      { key: 'ai_tools_supabase' },
      { key: 'ai_tools_voice' },
      { key: 'ai_tools_chrome' },
      { key: 'ai_tools_local' },
    ],
  },
  {
    headingKey: 'ai_h_practice',
    items: [
      { key: 'ai_practice_flow' },
      { key: 'ai_practice_review' },
      { key: 'ai_practice_beads' },
      { key: 'ai_practice_mcp' },
      { key: 'ai_practice_tokens' },
      { key: 'ai_practice_hooks' },
      { key: 'ai_practice_skills' },
      { key: 'ai_practice_prs' },
    ],
  },
  {
    headingKey: 'ai_h_built',
    items: [
      {
        key: 'ai_built_voice',
        href: 'https://github.com/beltranrengifo/agent-voice',
      },
      {
        key: 'ai_built_worktree',
        href: 'https://github.com/beltranrengifo/worktree-flow',
      },
      { key: 'ai_built_review' },
      { key: 'ai_built_perico' },
      { key: 'ai_built_paella' },
    ],
  },
];
