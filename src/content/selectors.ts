/**
 * Visibility and ordering rules — the ONLY place that decides what is shown.
 * Pure functions used by components, prerender configuration and tests alike.
 */
import type { EcosystemSystem, Lang, ProjectMeta, SiteConfig, SiteContent } from './model';

/* -------------------------------------------------------------- projects */

/** Published projects sorted by `order` (slug as a deterministic tie-breaker). */
export function publishedProjects(projects: readonly ProjectMeta[]): ProjectMeta[] {
  return projects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function findPublishedProject(
  projects: readonly ProjectMeta[],
  slug: string,
): ProjectMeta | null {
  return publishedProjects(projects).find((p) => p.slug === slug) ?? null;
}

export interface ProjectNeighbours {
  readonly previous: ProjectMeta | null;
  readonly next: ProjectMeta | null;
  /** 1-based position among published projects. */
  readonly position: number;
  readonly total: number;
}

/** Previous / next among published projects. No wrap-around. */
export function projectNeighbours(
  projects: readonly ProjectMeta[],
  slug: string,
): ProjectNeighbours | null {
  const list = publishedProjects(projects);
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return {
    previous: list[index - 1] ?? null,
    next: list[index + 1] ?? null,
    position: index + 1,
    total: list.length,
  };
}

export type ProjectCardVariant = 'standard' | 'wide';

export interface ProjectCardSlot {
  readonly project: ProjectMeta;
  readonly variant: ProjectCardVariant;
}

/**
 * Card layout for a two-column grid, preserving order:
 * - a featured project always takes a full row (wide card),
 * - standard projects are paired two per row,
 * - a standard project that would be left alone in its row becomes wide.
 * The grid therefore never has holes, and `featured` never reorders anything.
 */
export function projectCardLayout(projects: readonly ProjectMeta[]): ProjectCardSlot[] {
  const slots: ProjectCardSlot[] = [];
  let pending: ProjectMeta | null = null;

  for (const project of publishedProjects(projects)) {
    if (project.featured) {
      if (pending) slots.push({ project: pending, variant: 'wide' });
      pending = null;
      slots.push({ project, variant: 'wide' });
    } else if (pending) {
      slots.push({ project: pending, variant: 'standard' }, { project, variant: 'standard' });
      pending = null;
    } else {
      pending = project;
    }
  }
  if (pending) slots.push({ project: pending, variant: 'wide' });
  return slots;
}

/* --------------------------------------------------------------- contact */

export interface ContactChannels {
  readonly email: string | null;
  readonly github: string | null;
  readonly linkedin: string | null;
  readonly cv: readonly { readonly lang: Lang; readonly path: string }[];
}

export function contactChannels(site: SiteConfig): ContactChannels {
  const cv = (Object.entries(site.cv) as [Lang, SiteConfig['cv'][Lang]][])
    .filter(([, file]) => file !== null)
    .map(([lang, file]) => ({ lang, path: file!.path }));
  return {
    email: site.email,
    github: site.links.github,
    linkedin: site.links.linkedin,
    cv,
  };
}

export function hasContactChannel(site: SiteConfig): boolean {
  const c = contactChannels(site);
  return Boolean(c.email || c.github || c.linkedin || c.cv.length);
}

/* ------------------------------------------------------------- ecosystem */

export function hasResponsibilities(system: EcosystemSystem): boolean {
  return system.responsibilities.length > 0;
}

/* ------------------------------------------------------------- home page */

export const HOME_SECTION_IDS = [
  'expertise',
  'ecosystem',
  'technology',
  'projects',
  'contact',
] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

/** Home sections that have content, in display order. Drives both the page and the navigation. */
export function visibleHomeSections(content: SiteContent): HomeSectionId[] {
  const visible: Record<HomeSectionId, boolean> = {
    expertise: content.expertise.length > 0,
    ecosystem: content.ecosystem.length > 0,
    technology: content.techStack.length > 0,
    projects: publishedProjects(content.projects).length > 0,
    contact: hasContactChannel(content.site),
  };
  return HOME_SECTION_IDS.filter((id) => visible[id]);
}
