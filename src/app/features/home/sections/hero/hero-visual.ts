import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

/**
 * "Bounded contexts" — abstract clusters of modules joined by orthogonal connectors.
 * Deliberately unlabeled (the ecosystem section shows the concrete systems).
 *
 * Static SVG in the prerendered HTML. Progressive enhancement, only for a fine pointer with hover
 * and without reduced motion: modules near the cursor light up and two layers drift by a few pixels.
 * Updates bypass change detection (direct style writes, throttled to animation frames).
 */

const MODULE = 26;
const GAP = 12;
const PADDING = 16;

interface Cluster {
  readonly x: number;
  readonly y: number;
  readonly cols: number;
  readonly rows: number;
}

const CLUSTERS: readonly Cluster[] = [
  { x: 30, y: 40, cols: 3, rows: 2 },
  { x: 300, y: 20, cols: 4, rows: 2 },
  { x: 70, y: 250, cols: 3, rows: 3 },
  { x: 319, y: 230, cols: 3, rows: 2 },
  { x: 360, y: 380, cols: 2, rows: 1 },
];

/** `cluster-module` → colour of the small status dot. */
const DOTS: Readonly<Record<string, 'b2b' | 'erp' | 'wms'>> = {
  '0-4': 'erp',
  '1-1': 'b2b',
  '1-6': 'erp',
  '2-5': 'wms',
  '3-0': 'erp',
  '3-5': 'b2b',
  '4-1': 'wms',
};

const WIRES: readonly { d: string; signalDelay?: number }[] = [
  { d: 'M164 88 H226 a8 8 0 0 0 8 -8 V76 a8 8 0 0 1 8 -8 H300', signalDelay: 0 },
  { d: 'M97 136 V185 a8 8 0 0 0 8 8 H129 a8 8 0 0 1 8 8 V250' },
  { d: 'M386 116 V230', signalDelay: 5.4 },
  { d: 'M204 317 H254 a8 8 0 0 0 8 -8 V286 a8 8 0 0 1 8 -8 H319', signalDelay: 1.8 },
  { d: 'M386 326 V344 a8 8 0 0 0 8 8 H400 a8 8 0 0 1 8 8 V380' },
  { d: 'M137 384 V401 a8 8 0 0 0 8 8 H360', signalDelay: 3.6 },
];

const boxes = CLUSTERS.map((c) => ({
  ...c,
  width: 2 * PADDING + c.cols * MODULE + (c.cols - 1) * GAP,
  height: 2 * PADDING + c.rows * MODULE + (c.rows - 1) * GAP,
}));

const modules = CLUSTERS.flatMap((c, ci) =>
  Array.from({ length: c.cols * c.rows }, (_, mi) => {
    const x = c.x + PADDING + (mi % c.cols) * (MODULE + GAP);
    const y = c.y + PADDING + Math.floor(mi / c.cols) * (MODULE + GAP);
    return {
      x,
      y,
      cx: x + MODULE / 2,
      cy: y + MODULE / 2,
      dot: DOTS[`${ci}-${mi}`],
    };
  }),
);

@Component({
  selector: 'app-hero-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-visual.html',
  styleUrl: './hero-visual.scss',
  host: { 'aria-hidden': 'true' },
})
export class HeroVisual {
  protected readonly size = MODULE;
  protected readonly boxes = boxes;
  protected readonly modules = modules;
  protected readonly wires = WIRES;

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!fine.matches || reduced.matches) return;

      const area = host.closest('section') ?? host;
      const svg = this.svg().nativeElement;
      const highlights = [...svg.querySelectorAll<SVGRectElement>('.mod-hl')];
      const layers = [...svg.querySelectorAll<SVGGElement>('[data-depth]')];
      let frame = 0;
      let last: PointerEvent | null = null;

      const update = () => {
        frame = 0;
        if (!last) return;
        const matrix = svg.getScreenCTM();
        if (!matrix) return;
        const p = new DOMPoint(last.clientX, last.clientY).matrixTransform(matrix.inverse());
        highlights.forEach((el, i) => {
          const m = modules[i]!;
          const glow = Math.max(0, 1 - Math.hypot(m.cx - p.x, m.cy - p.y) / 150) * 0.5;
          el.style.opacity = glow.toFixed(3);
        });
        const r = area.getBoundingClientRect();
        const nx = (last.clientX - r.left) / r.width - 0.5;
        const ny = (last.clientY - r.top) / r.height - 0.5;
        for (const layer of layers) {
          const depth = Number(layer.dataset['depth']);
          layer.style.transform = `translate(${(nx * depth).toFixed(2)}px, ${(ny * depth * 0.8).toFixed(2)}px)`;
        }
      };
      const onMove = (e: PointerEvent) => {
        last = e;
        frame ||= requestAnimationFrame(update);
      };
      const onLeave = () => {
        last = null;
        highlights.forEach((el) => (el.style.opacity = '0'));
        layers.forEach((l) => (l.style.transform = ''));
      };

      area.addEventListener('pointermove', onMove, { passive: true });
      area.addEventListener('pointerleave', onLeave);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        area.removeEventListener('pointermove', onMove);
        area.removeEventListener('pointerleave', onLeave);
      });
    });
  }
}
