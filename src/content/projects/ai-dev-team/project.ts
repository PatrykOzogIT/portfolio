import type { ProjectMeta } from '../../model';

/**
 * Source of facts: the AI Dev Team handoff package (01_PROJECT_FACTS.md, 04_GUARDRAILS.md) — kept
 * outside the repository. Screenshots come from the app's demo mode (fictional data).
 */
export const project: ProjectMeta = {
  slug: 'ai-dev-team',
  order: 1,
  published: true,
  featured: true,
  kind: 'personal',
  developmentStatus: 'in-development',
  title: { pl: 'AI Dev Team', en: 'AI Dev Team' },
  shortDescription: {
    pl: 'Autorska platforma, która prowadzi zadania programistyczne z Linear przez analizę, plan, implementację, kontrolę jakości i code review aż po scalenie — z czterema wyspecjalizowanymi agentami AI i akceptacją człowieka na kluczowych etapach. Przejściami, kontrolami i operacjami Git steruje deterministyczny orkiestrator, nie model.',
    en: 'A self-designed platform that takes software tasks from Linear through analysis, planning, implementation, quality control and code review to merge — with four role-specialized AI agents and human approval at key decision points. A deterministic orchestrator, not the model, drives transitions, checks and Git operations.',
  },
  technologies: [
    'angular',
    'nestjs',
    'typescript',
    'mysql',
    'typeorm',
    'claude-code',
    'linear-api',
    'git',
    'github-cli',
  ],
  highlight: {
    title: {
      pl: 'Human-in-the-loop i pomiar agentów',
      en: 'Human in the loop, measured agents',
    },
    text: {
      pl: 'Plan, kod i scalenie zatwierdza człowiek — każda akceptacja przypięta do dokładnej wersji. System mierzy samodzielność agentów i wspiera doskonalenie ich instrukcji i reguł.',
      en: 'A human approves the plan, the code and the merge — each approval pinned to the exact version. The system measures agent autonomy and supports improving their instructions and rules.',
    },
  },
  coverImage: {
    src: 'projects/ai-dev-team/01-dashboard.png',
    width: 1440,
    height: 900,
    alt: {
      pl: 'Pulpit AI Dev Team (tryb demo): stan systemu, agenci, decyzje do podjęcia, wykorzystanie limitów i ostatnie zdarzenia',
      en: 'AI Dev Team dashboard (demo mode): system status, agents, pending decisions, usage limits and recent events',
    },
  },
  images: [
    {
      src: 'projects/ai-dev-team/03-agent-questions.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Pytania Analityka z uzasadnieniem i przycisk „Przygotuj plan mimo pytań”',
        en: 'Analyst questions with reasons and a “prepare the plan anyway” button',
      },
      caption: {
        pl: 'Niejasne wymagania: pytania z uzasadnieniem albo plan z założeniami',
        en: 'Unclear requirements: reasoned questions or a plan with explicit assumptions',
      },
    },
    {
      src: 'projects/ai-dev-team/05-plan-details-risks-sql.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Szczegóły planu: pliki, ryzyka, zmiana schematu ze skryptem SQL i testy',
        en: 'Plan details: files, risks, a schema change with an SQL script and tests',
      },
      caption: {
        pl: 'Szczegóły planu: pliki, ryzyka, skrypt SQL i kolejność wdrożenia',
        en: 'Plan details: files, risks, SQL migration and deployment order',
      },
    },
    {
      src: 'projects/ai-dev-team/08-code-review-findings.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Recenzja kodu z uwagami o różnej wadze i fragmentem zmian',
        en: 'Code review with findings of different severity and a diff',
      },
      caption: {
        pl: 'Niezależna recenzja AI z uwagami i jawną listą tego, czego nie sprawdzono',
        en: 'Independent AI review with findings and explicit unchecked items',
      },
    },
    {
      src: 'projects/ai-dev-team/12-agent-blocker-human-decision.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Blokada zgłoszona przez Programistę z opcjami decyzji człowieka',
        en: 'A blocker raised by the Developer with options for a human decision',
      },
      caption: {
        pl: 'Agent zgłasza blokadę zamiast zgadywać — decyduje człowiek',
        en: 'The agent raises a blocker instead of guessing — a human decides',
      },
    },
    {
      src: 'projects/ai-dev-team/15-agent-runs.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Lista przebiegów agentów z rolą, zadaniem, modelem, czasem i tokenami (dane demo)',
        en: 'List of agent runs with role, task, model, time and tokens (demo data)',
      },
      caption: {
        pl: 'Każdy przebieg agenta jest zapisany i audytowalny (dane demonstracyjne)',
        en: 'Every agent run is recorded and auditable (demo data)',
      },
    },
    {
      src: 'projects/ai-dev-team/11-task-history-token-usage.png',
      width: 1440,
      height: 532,
      alt: {
        pl: 'Historia zadania: zużycie tokenów według etapów (dane demo)',
        en: 'Task history: token usage per stage (demo data)',
      },
      caption: {
        pl: 'Historia zadania: zużycie zasobów per etap i ślad decyzji (dane demonstracyjne)',
        en: 'Task history: per-stage resource usage and decision trail (demo data)',
      },
    },
    {
      src: 'projects/ai-dev-team/16-data-fix-path.png',
      width: 1440,
      height: 900,
      alt: {
        pl: 'Plan „poprawka danych”: diagnoza i skrypty SQL do ręcznego wykonania',
        en: 'A “data fix” plan: diagnosis and SQL scripts to run manually',
      },
      caption: {
        pl: 'Gdy problem leży w danych: diagnoza i skrypty SQL do wykonania przez człowieka',
        en: 'When the issue is in the data: diagnosis and SQL scripts run by a human',
      },
    },
    {
      src: 'projects/ai-dev-team/17-planning-mode-and-model-routing.png',
      width: 770,
      height: 260,
      alt: {
        pl: 'Ustawienia: tryb planowania (ręczny lub automatyczny) i dobór modelu Architekta',
        en: 'Settings: planning mode (manual or automatic) and Architect model routing',
      },
      caption: {
        pl: 'Tryb planowania i dobór modelu do złożoności zadania',
        en: 'Planning mode and model routing by task complexity',
      },
    },
  ],
};
