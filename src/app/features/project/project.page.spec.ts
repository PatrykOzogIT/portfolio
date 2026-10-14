import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SITE_CONTENT_DATA } from '../../../content';
import type { ProjectMeta, SiteContent } from '../../../content/model';
import { routes } from '../../app.routes';
import { SITE_CONTENT } from '../../core/content';

function project(slug: string, order: number, extra: Partial<ProjectMeta> = {}): ProjectMeta {
  return {
    slug,
    order,
    published: true,
    kind: 'demo',
    title: { pl: `Projekt ${slug}`, en: `Project ${slug}` },
    shortDescription: { pl: 'Opis', en: 'Description' },
    technologies: ['angular', 'nestjs'],
    ...extra,
  };
}

const content: SiteContent = {
  ...SITE_CONTENT_DATA,
  projects: [
    project('alpha', 1, { kind: 'personal', githubUrl: 'https://github.com/x/alpha' }),
    project('secret', 2, { published: false }),
    project('beta', 3, {
      isLive: true,
      developmentStatus: 'in-development',
      appUrl: 'https://beta.example.com',
    }),
  ],
  projectSections: {
    alpha: {
      pl: async () => ({ about: '<p>O projekcie alpha</p>' }),
      en: async () => ({ about: '<p>About alpha</p>' }),
    },
  },
};

async function open(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(
        routes,
        withComponentInputBinding(),
        withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      ),
      { provide: SITE_CONTENT, useValue: content },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return harness;
}

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();

describe('Project page', () => {
  beforeEach(() => {
    // jsdom has no matchMedia; the mobile menu uses it after render.
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  });

  it('renders a published project with only the sections that have content', async () => {
    const harness = await open('/pl/projects/alpha');
    const root = harness.routeNativeElement!;
    expect(text(root.querySelector('h1'))).toBe('Projekt alpha');
    const headings = [...root.querySelectorAll('section h2')].map(text);
    expect(headings).toEqual(['01 O projekcie']);
    expect(text(root.querySelector('.prose'))).toBe('O projekcie alpha');
  });

  it('labels the project with its kind and shows Live / development badges only when set', async () => {
    const harness = await open('/pl/projects/alpha');
    const alpha = harness.routeNativeElement!;
    expect(text(alpha.querySelector('.eyebrow'))).toContain('Projekt własny');
    expect(alpha.querySelector('.badge')).toBeNull();

    await harness.navigateByUrl('/pl/projects/beta');
    const beta = harness.routeNativeElement!;
    expect(text(beta.querySelector('.eyebrow'))).toContain('Projekt demonstracyjny');
    expect([...beta.querySelectorAll('.status .badge')].map(text)).toEqual(['Live', 'W rozwoju']);
    expect(beta.querySelector('.badge--live')?.textContent?.trim()).toBe('Live');
  });

  it('labels the app link by project kind: Live Demo for demos', async () => {
    const root = (await open('/pl/projects/beta')).routeNativeElement!;
    const app = root.querySelector<HTMLAnchorElement>('a[href="https://beta.example.com"]');
    expect(text(app)).toContain('Live Demo');
    expect(app?.target).toBe('_blank');
  });

  it('shows the GitHub link safely and hides the missing demo link', async () => {
    const root = (await open('/pl/projects/alpha')).routeNativeElement!;
    const github = root.querySelector<HTMLAnchorElement>('a[href="https://github.com/x/alpha"]');
    expect(github?.target).toBe('_blank');
    expect(github?.rel).toBe('noopener noreferrer');
    expect(root.textContent).not.toContain('Live Demo');
  });

  it('links neighbours among published projects only, without wrap-around', async () => {
    const root = (await open('/pl/projects/alpha')).routeNativeElement!;
    const pager = root.querySelector('.pager');
    expect(text(pager)).toContain('Projekt beta');
    expect(text(pager)).not.toContain('Projekt secret');
    expect(text(pager)).not.toContain('Poprzedni projekt');
    expect(text(root.querySelector('.position'))).toBe('1 / 2');
  });

  it('treats an unpublished project as not found', async () => {
    const root = (await open('/pl/projects/secret')).routeNativeElement!;
    expect(text(root.querySelector('h1'))).toBe('Nie znaleziono strony');
  });

  it('keeps the same project when switching language', async () => {
    const harness = await open('/pl/projects/alpha');
    await harness.navigateByUrl('/en/projects/alpha');
    const root = harness.routeNativeElement!;
    expect(text(root.querySelector('h1'))).toBe('Project alpha');
    expect(text(root.querySelector('.prose'))).toBe('About alpha');
  });
});
