# about

**From a Linear issue to an integrated change:** specialized AI agents do the work, the system verifies it, and a human makes the key decisions.

AI Dev Team is a platform I designed for orchestrating AI agents in software delivery — from a Linear issue through analysis, planning, implementation, quality control and review to a pull request and merge. It is neither an LLM wrapper nor a chatbot: the model performs the steps, while transitions, checks, Git operations and decisions are driven by deterministic orchestrator code and a human.

It is a private project — built for my portfolio and for learning to design agentic systems. It is not deployed in a company or offered as a service, and it is still under development.

**Real-world validation.** The system has been validated in complete software-delivery scenarios — from issue analysis through planning, implementation and quality control to integration and deployment of changes. Lessons from these runs were built back into the system, such as baseline comparison of failing checks and re-verification without re-running the agent. It is backed by 115 unit tests, 71 end-to-end tests and a demo mode with fictional data, which all screenshots come from.

**Limitations:** a local application (Windows), a single user and one active project; checks run repository-wide; research metrics are descriptive.

# problem

AI agents can write code, but real software delivery needs more: understanding the task, fitting the architecture, verified tests, safe operations on a team repository and control over what reaches production. A single model session offers no repeatability, no audit trail and no way to measure quality.

AI Dev Team splits the work on a task into specialized roles and wraps them in a deterministic process:

- **Analyst** triages the issue, asks at most a few specific questions and rates complexity.
- **Architect** analyzes the code read-only and produces a plan with risks, database changes, tests and assumptions to confirm.
- **Developer** implements the plan in an isolated working copy and raises a blocker instead of guessing.
- **Reviewer** independently reviews the change in a fresh session.

Agents never talk to each other — the orchestrator passes structured results between steps, validated in code.

# features

- **4 agents** (Analyst, Architect, Developer, Reviewer) managed by an orchestrator with a job queue and concurrency control.
- **Human in the loop:** plan, code and merge approvals, each pinned to the exact version.
- **A safe Git layer**, isolated worktrees and system-executed quality gates.
- **Agent effectiveness research** and versioned AI rules.
- **Responsible management** of AI usage limits and model selection.

# architecture

## Architecture

![Architecture diagram: Angular dashboard, NestJS orchestrator with the state machine, scheduler, quality gates, SafeGit and research, MySQL, agents as separate Claude Code CLI processes with a PreToolUse hook, isolated worktrees, Linear and GitHub](projects/ai-dev-team/diagram-architecture.en.png "Architecture: one local application — orchestrator, dashboard, database and agents as separate processes")

- **NestJS as the orchestrator:** state machine, scheduler, integrations; an **Angular** dashboard with live updates (SSE); **MySQL** for state, job queue and audit log — no extra infrastructure.
- **A priority queue** with idempotency keys, 1–4 agent slots adjustable at runtime, resource locks acquired atomically, recovery of interrupted steps after a restart.
- **Integrations:** Linear (sync, status updates with conflict detection), Git and GitHub (worktrees, pull requests, merge), Claude Code CLI (agents as separate processes with JSON-schema results).

## Workflow with three approvals

![Workflow diagram: Linear issue, Analyst triage, Architect plan, Approval 1, implementation in a worktree, checks and review, Approval 2, commit and pull request, Approval 3, merge](projects/ai-dev-team/diagram-workflow.en.png "Task workflow: three human approvals, each pinned to the exact version")

Linear issue → Analyst triage → clarifying questions or a plan with explicit assumptions → Architect plan in manual or automatic mode → **Approval 1** → implementation in a worktree → system checks, gates and review → **Approval 2** → commit of the exact approved version, pull request, check against the current target branch → **Approval 3** → merge and Linear status update. Every task keeps a full history: agent runs, decisions and resource usage.

![List of Linear issues at different stages: plans awaiting approval and a blocked task](projects/ai-dev-team/02-tasks-and-workflow.png "Linear issues tracked through an explicit state machine")

![Architect plan with assumptions to confirm and the Approval 1 panel with the plan hash](projects/ai-dev-team/04-implementation-plan.png "Architect plan with assumptions to confirm — approval pinned to the plan hash")

## Human in the loop and safety

A model can misunderstand a task, claim tests it never ran or drift out of scope. That is why it does not make every decision:

- three approvals are pinned to the exact version (plan hash, git tree SHA, target-branch state) — any change invalidates the approval,
- agents have no access to commit or push; all Git operations go through an allowlisted layer, never force-push and never write to the target branch,
- every task runs in an isolated worktree, and agent tool policy is enforced by a fail-closed hook,
- before merging, the system checks the merge result against the current target branch and warns about production deployments,
- errors and blockers end with a human decision (retry, re-verify, back to planning), and interrupted steps return to the queue after a restart.

![Queue of human decisions: a blocker, a merge and plans to review](projects/ai-dev-team/06-approvals-queue.png "Every human decision in one queue")

![Code approval, version 2 after review, pinned to the git tree SHA](projects/ai-dev-team/09-code-approval.png "Code approval pinned to the git tree SHA after a fix iteration")

![Merge approval: branch, pull request, pre-merge check and a production-deployment warning](projects/ai-dev-team/10-merge-approval.png "Merge approval after a check against the current target branch")

## Quality control

Lint, formatting, type checks, tests and builds are executed by the system, not claimed by the model. A failing check is re-run on a clean baseline checkout to separate regressions from pre-existing repository debt. Code-level gates detect secrets, out-of-plan changes, schema changes without an SQL script and changes in sensitive areas. The Reviewer lists what it could not check, and its claims without supporting system checks are flagged as unverified.

![System-run checks compared with the baseline, and quality gate results](projects/ai-dev-team/07-checks-and-quality-gates.png "System-run checks with baseline comparison, plus quality gates")

# research

The system measures how well agents work without human help — computed only from stored history, with no extra AI calls.

- **Human intervention** means a plan or code rejection with feedback, or a blocker caused by the agent's work (including a manual code edit). Technical blockers and team-side changes are counted separately and do not count against the agents.
- **Metrics:** autonomy (code approved with no corrections), first-pass plan and code acceptance, share of misunderstood tasks, tasks that needed a human answer, average corrections, automatic fix iterations and reviewer change requests, time to code approval, token usage.
- **Correction taxonomy:** every rejection carries a category (e.g. misunderstanding, scope, approach, bug, tests, security, performance), showing what corrections are mostly about.
- **Analysis over time:** weekly or monthly charts with markers for role-instruction, AI-rule and model changes, plus results broken down by each role's instruction version.
- **Honest limits:** the metrics are descriptive; with few tasks they do not statistically confirm improvement, and task difficulty varies. The system never changes its instructions or rules by itself — a human applies the conclusions.

![Improvement loop: agents work, human interventions, research, human decision, change marker on charts](projects/ai-dev-team/diagram-loop.en.png "Agent improvement loop — every change is made by a human")

![Research screen: autonomy metric tiles and the quality-over-time chart](projects/ai-dev-team/14-research-autonomy.png "Research screen in demo mode — fictional data from a single day; the values shown are not results")

# challenges

## AI rules and continuous improvement

Rules have a scope (global or project), category, severity and enforcement mode — agent instruction, code gate, or both. Every change creates a new version with restore, and a preview shows exactly the text sent to agents. Role instructions are versioned, and the Architect proposes repository facts that, once approved, are injected into future tasks.

The loop: categorized corrections → analysis in Research → new rule or instruction version → comparison of results after the change. The goal: a growing share of autonomous agent work — measured, not claimed.

![List of AI rules with severity, scope, enforcement mode and versions](projects/ai-dev-team/13-ai-rules.png "Versioned AI rules: agent instructions and code gates")

## Responsible AI resource management

![Usage-limit diagram: utilisation reading, threshold, pause, usage probe, automatic resume, queue and model routing](projects/ai-dev-team/diagram-limits.en.png "Usage limits and AI resource management")

- Usage-limit monitoring (5-hour and weekly windows) on every run; configurable pause thresholds and optional automatic resume.
- Priority queue and limited parallelism (one agent by default).
- Model routing by task complexity: a stronger model for complex tasks and after an analysis-related plan rejection, a faster one for simple tasks.
- No unnecessary calls: unchanged tasks are not re-triaged, re-verification without re-running the agent, checks and analytics without AI.
- Token usage per stage and task, plus a safeguard that stops work on an unexpected billing source.

![Scheduler with 5-hour and weekly usage bars, active agents and the queue](projects/ai-dev-team/18-scheduler-limits-and-queue.png "Scheduler with usage-limit monitoring and queue")

# role

I own the product concept, system architecture, the three-approval workflow and the agents' responsibilities, the safety mechanisms (version-pinned approvals, the Git layer, tool policy) and quality control, the integration design (Linear, Git/GitHub, Claude Code), technology decisions, the agent-effectiveness research design and resource optimization.

I direct development and verify the implementation: I approve stages, run the system on real tasks, compare results and turn the lessons into new features and rules. The implementation (code, tests, scripts) was built with AI as a supporting tool — under my direction and with my review.

**Tech stack:** Angular 22 · Angular Material · NestJS 12 · TypeScript · Node.js · MySQL 8 · TypeORM · Server-Sent Events · Claude Code CLI · Linear GraphQL · Git (worktrees) · GitHub CLI · Vitest · PowerShell
