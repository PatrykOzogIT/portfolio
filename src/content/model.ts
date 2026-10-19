/**
 * Content model â€” pure TypeScript, no Angular imports.
 * Shared by the application and by the build scripts in /scripts.
 */

import type { TechId } from './technologies';

export const LANGS = ['pl', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'pl';

/** Text available in every supported language. Missing translation = compile error. */
export type Localized<T = string> = Readonly<Record<Lang, T>>;

/* ------------------------------------------------------------------ site */

export interface CvFile {
  /** Path relative to /public, e.g. `cv/patryk-ozog-cv-pl.pdf`. */
  readonly path: string;
}

export interface SiteConfig {
  /**
   * Absolute origin without trailing slash, e.g. `https://example.com`.
   * `null` until the domain is chosen: canonical URLs, Open Graph URLs and the sitemap are then omitted.
   */
  readonly siteUrl: string | null;
  readonly person: {
    readonly name: string;
    readonly jobTitle: string;
  };
  readonly links: {
    readonly github: string | null;
    readonly linkedin: string | null;
  };
  readonly email: string | null;
  /** CV per language; `null` hides the download button for that language. */
  readonly cv: Readonly<Record<Lang, CvFile | null>>;
  /** Default social preview image, relative to /public. */
  readonly ogImage: string | null;
  /** Portrait shown next to the name (hero) and in the contact section; `null` hides both. */
  readonly photo: Photo | null;
}

export interface Photo {
  /** Path relative to /public — square, at least 800×800 px. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: Localized;
}

/* ------------------------------------------------------------ technology */

export interface Tech {
  readonly label: string;
}

/** A group in the Technology section. Tools only — capabilities belong to the expertise section. */
export interface TechStackGroup {
  readonly id: string;
  readonly title: Localized;
  readonly technologies: readonly TechId[];
  /** Legacy experience: shown last, muted and tagged "Legacy" — visible, but not the main direction. */
  readonly legacy?: readonly TechId[];
  /** Short extra context (what the tools are used for), never a skill rating. */
  readonly note?: Localized;
}

/* ------------------------------------------------------------- expertise */

export type ExpertiseIcon = 'architecture' | 'fullstack' | 'process' | 'modernization';

/** A real example from practice: what was decided and what came of it. Only confirmed facts. */
export interface CaseStudy {
  /** Anchor id on the page (also used by the "examples" navigation). */
  readonly id: string;
  /** Short mono label, e.g. "MODERNIZATION". */
  readonly label: Localized;
  readonly title: Localized;
  /** Short name for the examples navigation. */
  readonly navLabel: Localized;
  readonly summary: Localized;
  readonly decisions: Localized<readonly string[]>;
  /** Optional highlighted result. */
  readonly outcome?: Localized;
}

export interface ExpertiseArea {
  readonly id: string;
  readonly icon: ExpertiseIcon;
  readonly title: Localized;
  readonly description: Localized;
  readonly points: Localized<readonly string[]>;
  /** Example from practice shown below the expertise cards and linked from this card. */
  readonly caseStudy?: CaseStudy;
}

/* ------------------------------------------------------------- ecosystem */

export type EcosystemSystemId = 'b2b' | 'erp' | 'wms';

export type ResponsibilityArea =
  'architecture' | 'analysis' | 'frontend' | 'backend' | 'integrations' | 'maintenance';

export interface Responsibility {
  readonly area: ResponsibilityArea;
  readonly description: Localized;
}

export interface EcosystemSystem {
  readonly id: EcosystemSystemId;
  readonly name: string;
  readonly fullName: Localized;
  readonly role: Localized;
  readonly summary: Localized;
  readonly areas: Localized<readonly string[]>;
  readonly technologies: readonly TechId[];
}

/**
 * Architecture perspectives on the map — not systems: the REST communication between backends and the
 * shared data layer. Each opens a panel next to the map, like a system does.
 */
export type EcosystemPerspectiveId = 'communication' | 'data';

export interface EcosystemPerspective extends CaseStudy {
  readonly id: EcosystemPerspectiveId;
}

/**
 * My role across the whole ecosystem (not per system). Only confirmed facts;
 * the block is hidden while `responsibilities` is empty.
 */
export interface EcosystemRole {
  readonly intro: Localized;
  readonly responsibilities: readonly Responsibility[];
}

/* -------------------------------------------------------------- projects */

export interface ProjectImage {
  /** Path relative to /public. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: Localized;
  readonly caption?: Localized;
}

/**
 * Project metadata. Lives in `src/content/projects/<slug>/project.ts`.
 * Long-form text lives next to it in `pl.md` / `en.md` (see docs/CONTENT.md).
 */
/** `personal` — my own product (e.g. a side project), `demo` — built to demonstrate a solution. */
export const PROJECT_KINDS = ['personal', 'demo'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

/** Stage of development — independent of whether a public version is live. */
export const DEVELOPMENT_STATUSES = ['in-development'] as const;
export type DevelopmentStatus = (typeof DEVELOPMENT_STATUSES)[number];

export interface ProjectMeta {
  /** URL segment and unique identifier: lowercase letters, digits and hyphens. */
  readonly slug: string;
  /** Display order (ascending). Must be unique. */
  readonly order: number;
  /** Only `true` projects are built, listed, routed and indexed. */
  readonly published: boolean;
  /**
   * Decides the label on the project page, the title of the projects section and the app link label
   * ("Live Demo" for demos, "Visit app" for real products).
   */
  readonly kind: ProjectKind;
  /** The public app is up and running ("Live" badge). Requires `appUrl`. */
  readonly isLive?: boolean;
  /** Neutral badge, e.g. "In development"; omit when the project is not actively developed. */
  readonly developmentStatus?: DevelopmentStatus;
  /** Renders a wide card; never changes the order. */
  readonly featured?: boolean;
  readonly title: Localized;
  readonly shortDescription: Localized;
  readonly technologies: readonly TechId[];
  readonly githubUrl?: string;
  /** Public address of the running application (a demo or a real product) — no URL, no button. */
  readonly appUrl?: string;
  readonly coverImage?: ProjectImage;
  readonly images?: readonly ProjectImage[];
  /** One notable feature, shown as a compact note on the card (title + one sentence). */
  readonly highlight?: { readonly title: Localized; readonly text: Localized };
  /** Hue (0–360) for the generated placeholder artwork when there is no cover image. */
  readonly accentHue?: number;
}

/** Keys of long-form sections, in display order. Used as `# key` headings in the Markdown files. */
export const PROJECT_SECTION_KEYS = [
  'about',
  'problem',
  'features',
  'architecture',
  'challenges',
] as const;
export type ProjectSectionKey = (typeof PROJECT_SECTION_KEYS)[number];

/** Compiled (HTML) long-form sections of one project in one language. Absent key = hidden section. */
export type ProjectSections = Readonly<Partial<Record<ProjectSectionKey, string>>>;

export type ProjectSectionsLoader = () => Promise<ProjectSections>;

/* ------------------------------------------------------------ aggregate */

export interface SiteContent {
  readonly site: SiteConfig;
  readonly technologies: Readonly<Record<TechId, Tech>>;
  readonly techStack: readonly TechStackGroup[];
  readonly expertise: readonly ExpertiseArea[];
  readonly ecosystem: readonly EcosystemSystem[];
  readonly ecosystemRole: EcosystemRole;
  readonly ecosystemPerspectives: readonly EcosystemPerspective[];
  readonly projects: readonly ProjectMeta[];
  readonly projectSections: Readonly<Record<string, Localized<ProjectSectionsLoader>>>;
}
