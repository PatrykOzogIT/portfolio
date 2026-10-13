import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Palette hues (indigo, cyan, amber) used when a project does not define `accentHue`. */
const PALETTE_HUES = [235, 193, 36] as const;
const COLS = 8;
const ROWS = 5;
const SIZE = 20;
const GAP = 10;
const OFFSET_X = (320 - (COLS * SIZE + (COLS - 1) * GAP)) / 2;
const OFFSET_Y = (200 - (ROWS * SIZE + (ROWS - 1) * GAP)) / 2;

/** Small deterministic PRNG — the same slug always produces the same artwork. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function projectArtModules(slug: string) {
  const random = seededRandom(slug);
  return Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: OFFSET_X + (i % COLS) * (SIZE + GAP),
    y: OFFSET_Y + Math.floor(i / COLS) * (SIZE + GAP),
    lit: random() < 0.22,
  }));
}

export function projectInitials(title: string): string {
  return title
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * Placeholder artwork for projects without a cover image: an abstract module grid in the
 * design-system style plus the project's initials. Never imitates an application screenshot.
 */
@Component({
  selector: 'app-project-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.--art-hue]': 'hue()' },
  template: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" focusable="false">
      @for (m of modules(); track $index) {
        <rect
          [class.lit]="m.lit"
          [attr.x]="m.x"
          [attr.y]="m.y"
          [attr.width]="size"
          [attr.height]="size"
          rx="5"
        />
      }
      <text x="296" y="182" text-anchor="end">{{ initials() }}</text>
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(120% 90% at 85% 0%, hsl(var(--art-hue) 80% 70% / 0.14), transparent 60%),
        var(--surface-2);
    }
    svg {
      width: 100%;
      height: 100%;
    }
    rect {
      fill: rgb(255 255 255 / 0.02);
      stroke: rgb(255 255 255 / 0.08);
    }
    rect.lit {
      fill: hsl(var(--art-hue) 80% 72% / 0.18);
      stroke: hsl(var(--art-hue) 80% 72% / 0.55);
    }
    text {
      font-family: var(--font-mono);
      font-size: 28px;
      font-weight: 500;
      letter-spacing: 0.04em;
      fill: hsl(var(--art-hue) 80% 80% / 0.85);
    }
  `,
})
export class ProjectArt {
  readonly slug = input.required<string>();
  readonly title = input.required<string>();
  readonly accentHue = input<number>();

  protected readonly size = SIZE;
  protected readonly modules = computed(() => projectArtModules(this.slug()));
  protected readonly initials = computed(() => projectInitials(this.title()));
  protected readonly hue = computed(
    () =>
      this.accentHue() ??
      PALETTE_HUES[Math.floor(seededRandom(this.slug())() * PALETTE_HUES.length)],
  );
}
