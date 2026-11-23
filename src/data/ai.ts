/**
 * How Beltrán works with AI — a dated snapshot. The stack moves fast, so
 * the page shows when this was last reviewed, and a reminder every four weeks asks
 * for a fresh look (see .github/workflows/ai-stack-review.yml).
 */

/** Year and month of the last review. */
export const reviewedOn = '2026-11';

export interface AiItem {
  /** Message key for the line. */
  key: string;
  /** The project's case study on this site, by slug. */
  caseStudy?: string;
  /** Somewhere outside the site to see it, when there is no case study. */
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
      { key: 'ai_tools_models' },
      { key: 'ai_tools_codex' },
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
      { key: 'ai_practice_own' },
    ],
  },
  {
    headingKey: 'ai_h_built',
    items: [
      { key: 'ai_built_tablux', caseStudy: 'tablux' },
      { key: 'ai_built_tablux_voice', caseStudy: 'tablux' },
      { key: 'ai_built_tablux_changes', caseStudy: 'tablux' },
      { key: 'ai_built_lacasaestudio', caseStudy: 'lacasaestudio' },
      { key: 'ai_built_review', caseStudy: 'assisted-review' },
      { key: 'ai_built_perico', caseStudy: 'radio-perico' },
      { key: 'ai_built_ensayadero', caseStudy: 'ensayadero' },
      { key: 'ai_built_paella', caseStudy: 'paellalab' },
      { key: 'ai_built_canallum', caseStudy: 'ca-na-llum' },
      {
        key: 'ai_built_voice',
        href: 'https://github.com/beltranrengifo/agent-voice',
      },
      {
        key: 'ai_built_worktree',
        href: 'https://github.com/beltranrengifo/worktree-flow',
      },
    ],
  },
];
