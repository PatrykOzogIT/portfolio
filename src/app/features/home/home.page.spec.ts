import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SITE_CONTENT_DATA } from '../../../content';
import type { ProjectMeta, SiteContent } from '../../../content/model';
import { routes } from '../../app.routes';
import { SITE_CONTENT } from '../../core/content';

const project: ProjectMeta = {
  slug: 'demo',
  order: 1,
  published: true,
  kind: 'demo',
  title: { pl: 'Demo PL', en: 'Demo EN' },
  shortDescription: { pl: 'Opis', en: 'Description' },
  technologies: ['angular'],
  githubUrl: 'https://github.com/x/demo',
};

async function render(overrides: Partial<SiteContent> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: SITE_CONTENT, useValue: { ...SITE_CONTENT_DATA, ...overrides } },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl('/pl');
  return harness;
}

const ids = (root: ParentNode) => [...root.querySelectorAll('main section[id]')].map((s) => s.id);
const navLabels = () =>
  [...document.querySelectorAll('app-header .nav a')].map((a) => a.textContent?.trim());

describe('Home page', () => {
  beforeEach(() => {
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  it('has no projects section and no menu item without published projects', async () => {
    const harness = await render({ projects: [] });
    expect(ids(harness.routeNativeElement!)).toEqual([
      'expertise',
      'ecosystem',
      'technology',
      'contact',
    ]);
    expect(navLabels()).not.toContain('Projekty');
  });

  it('adds the projects section and menu item once a project is published', async () => {
    const harness = await render({ projects: [project] });
    expect(ids(harness.routeNativeElement!)).toContain('projects');
    expect(navLabels()).toContain('Projekty');
    expect(harness.routeNativeElement!.querySelector('app-project-card h3')?.textContent).toContain(
      'Demo PL',
    );
  });

  it('names the projects section after their kind and badges cards only when kinds are mixed', async () => {
    const own = { ...project, slug: 'own', order: 2, kind: 'personal' as const };
    const single = (await render({ projects: [project] })).routeNativeElement!;
    expect(single.querySelector('#projects-title')?.textContent).toContain(
      'Projekty demonstracyjne',
    );
    expect(single.querySelector('app-project-card .badge')).toBeNull();

    TestBed.resetTestingModule();
    const mixed = (await render({ projects: [project, own] })).routeNativeElement!;
    expect(mixed.querySelector('#projects-title')?.textContent?.trim()).toBe('Projekty');
    const badges = [...mixed.querySelectorAll('app-project-card .badge')].map((b) =>
      b.textContent?.trim(),
    );
    expect(badges).toEqual(['Projekt demonstracyjny', 'Projekt własny']);
  });

  it('hides contact channels that are not configured', async () => {
    const site = {
      ...SITE_CONTENT_DATA.site,
      email: null,
      cv: { pl: null, en: null },
      links: { github: 'https://github.com/x', linkedin: null },
    };
    const root = (await render({ site })).routeNativeElement!;
    const contact = root.querySelector('#contact')!;
    expect(contact.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(contact.textContent).not.toContain('LinkedIn');
    expect(contact.querySelector('a[download]')).toBeNull();
    expect(contact.querySelector('a[href="https://github.com/x"]')).not.toBeNull();
  });

  it('shows no portrait until a photo is configured', async () => {
    const root = (await render({ site: { ...SITE_CONTENT_DATA.site, photo: null } }))
      .routeNativeElement!;
    expect(root.querySelector('img.avatar, img.portrait')).toBeNull();
  });

  it('shows the portrait in the hero (decorative) and in contact (with alt text)', async () => {
    const photo = {
      src: 'images/me.jpg',
      width: 800,
      height: 800,
      alt: { pl: 'Portret', en: 'Portrait' },
    };
    const root = (await render({ site: { ...SITE_CONTENT_DATA.site, photo } })).routeNativeElement!;
    expect(root.querySelector('app-hero img.avatar')?.getAttribute('alt')).toBe('');
    expect(root.querySelector('#contact img.portrait')?.getAttribute('alt')).toBe('Portret');
  });

  it('shows email with a copy action and CV downloads when configured', async () => {
    const site = {
      ...SITE_CONTENT_DATA.site,
      email: 'a@b.pl',
      cv: { pl: { path: 'cv/pl.pdf' }, en: null },
    };
    const root = (await render({ site })).routeNativeElement!;
    const contact = root.querySelector('#contact')!;
    expect(contact.querySelector('a[href="mailto:a@b.pl"]')).not.toBeNull();
    expect(contact.querySelector('button')?.textContent).toContain('Kopiuj adres');
    expect(contact.querySelectorAll('a[download]').length).toBe(1);
    expect(root.querySelector('app-hero')?.textContent).toContain('Kontakt i CV');
  });
});

describe('Project card', () => {
  beforeEach(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  it('calls a real product link "Otwórz aplikację", not a demo', async () => {
    const product = {
      ...project,
      kind: 'personal' as const,
      isLive: true,
      appUrl: 'https://app.example.com',
    };
    const root = (await render({ projects: [product] })).routeNativeElement!;
    const card = root.querySelector('app-project-card')!;
    const app = card.querySelector('a[href="https://app.example.com"]');
    expect(app?.textContent).toContain('Otwórz aplikację');
    expect(card.textContent).not.toContain('Live Demo');
    expect(card.querySelector('.badge--live')?.textContent?.trim()).toBe('Live');
  });
});

describe('Technology', () => {
  beforeEach(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  it('lists legacy technologies last, as muted chips tagged Legacy', async () => {
    const techStack = [
      { id: 'b', title: { pl: 'B', en: 'B' }, technologies: ['nestjs'], legacy: ['php'] } as const,
    ];
    const root = (await render({ techStack })).routeNativeElement!;
    const chips = [...root.querySelectorAll('#technology .chip')];
    expect(chips.map((c) => c.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'NestJS',
      'Legacy PHP / Zend',
    ]);
    expect(chips[1]!.classList).toContain('chip--legacy');
  });
});

describe('Ecosystem', () => {
  beforeEach(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  const tabs = (root: ParentNode) => [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const selected = (root: ParentNode) =>
    tabs(root).find((t) => t.getAttribute('aria-selected') === 'true')?.id;
  const activePanel = (root: ParentNode) => root.querySelector('[role="tabpanel"].is-active')?.id;

  it('starts on ERP with a single tab stop', async () => {
    const root = (await render()).routeNativeElement!;
    expect(selected(root)).toBe('eco-tab-erp');
    expect(tabs(root).filter((t) => t.tabIndex === 0).length).toBe(1);
    expect(activePanel(root)).toBe('eco-panel-erp');
  });

  it('switches system on click and with the arrow keys, wrapping around', async () => {
    const harness = await render();
    const root = harness.routeNativeElement!;
    tabs(root)[0]!.click();
    harness.detectChanges();
    expect(activePanel(root)).toBe('eco-panel-b2b');

    const tablist = root.querySelector('[role="tablist"]')!;
    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    harness.detectChanges();
    expect(selected(root)).toBe('eco-tab-wms');
    expect(document.activeElement?.id).toBe('eco-tab-wms');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    harness.detectChanges();
    expect(selected(root)).toBe('eco-tab-b2b');
  });

  it('shows one "My role" block for the whole ecosystem, below the map', async () => {
    const root = (await render()).routeNativeElement!;
    const role = root.querySelector('#ecosystem .role')!;
    expect(role.querySelector('h3')?.textContent?.trim()).toBe('Moja rola');
    expect(role.querySelectorAll('dt').length).toBe(
      SITE_CONTENT_DATA.ecosystemRole.responsibilities.length,
    );
    expect(root.querySelector('[role="tabpanel"] .role')).toBeNull();
  });

  it('hides the "My role" block without confirmed responsibilities', async () => {
    const ecosystemRole = { ...SITE_CONTENT_DATA.ecosystemRole, responsibilities: [] };
    const root = (await render({ ecosystemRole })).routeNativeElement!;
    expect(root.querySelector('#ecosystem .role')).toBeNull();
  });
});
