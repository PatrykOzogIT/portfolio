import type { ProjectMeta, SiteConfig, SiteContent } from './model';
import {
  contactChannels,
  findPublishedProject,
  projectCardLayout,
  projectNeighbours,
  projectsHeadingKind,
  publishedProjects,
  visibleHomeSections,
} from './selectors';

function project(slug: string, order: number, extra: Partial<ProjectMeta> = {}): ProjectMeta {
  return {
    slug,
    order,
    published: true,
    kind: 'demo',
    title: { pl: slug, en: slug },
    shortDescription: { pl: '', en: '' },
    technologies: [],
    ...extra,
  };
}

const site: SiteConfig = {
  siteUrl: null,
  person: { name: 'Test', jobTitle: 'Dev' },
  links: { github: null, linkedin: null },
  email: null,
  cv: { pl: null, en: null },
  ogImage: null,
  photo: null,
};

function content(overrides: Partial<SiteContent> = {}): SiteContent {
  return {
    site,
    technologies: {} as SiteContent['technologies'],
    techStack: [],
    expertise: [],
    ecosystem: [],
    projects: [],
    projectSections: {},
    ...overrides,
  };
}

const slugs = (list: readonly { slug: string }[]) => list.map((p) => p.slug);

describe('publishedProjects', () => {
  it('drops unpublished projects and sorts by order', () => {
    const list = [
      project('c', 3),
      project('a', 1),
      project('hidden', 0, { published: false }),
      project('b', 2),
    ];
    expect(slugs(publishedProjects(list))).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input', () => {
    const list = [project('b', 2), project('a', 1)];
    publishedProjects(list);
    expect(slugs(list)).toEqual(['b', 'a']);
  });

  it('never finds an unpublished project by slug', () => {
    expect(findPublishedProject([project('x', 1, { published: false })], 'x')).toBeNull();
  });
});

describe('projectNeighbours', () => {
  const list = [
    project('a', 1),
    project('hidden', 2, { published: false }),
    project('b', 3),
    project('c', 4),
  ];

  it('has no previous on the first project and no wrap-around', () => {
    expect(projectNeighbours(list, 'a')).toEqual({
      previous: null,
      next: list[2],
      position: 1,
      total: 3,
    });
  });

  it('skips unpublished projects', () => {
    const n = projectNeighbours(list, 'b')!;
    expect(n.previous?.slug).toBe('a');
    expect(n.next?.slug).toBe('c');
    expect(n.position).toBe(2);
  });

  it('has no next on the last project', () => {
    expect(projectNeighbours(list, 'c')?.next).toBeNull();
  });

  it('returns null for unknown or unpublished slugs', () => {
    expect(projectNeighbours(list, 'hidden')).toBeNull();
    expect(projectNeighbours(list, 'nope')).toBeNull();
  });
});

describe('projectCardLayout', () => {
  const variants = (list: ProjectMeta[]) =>
    projectCardLayout(list).map((s) => `${s.project.slug}:${s.variant}`);

  it('renders a single project as a wide card', () => {
    expect(variants([project('a', 1)])).toEqual(['a:wide']);
  });

  it('pairs standard projects and widens the odd one out', () => {
    expect(variants([project('a', 1), project('b', 2), project('c', 3)])).toEqual([
      'a:standard',
      'b:standard',
      'c:wide',
    ]);
  });

  it('keeps order around a featured project without leaving holes', () => {
    const list = [
      project('a', 1),
      project('f', 2, { featured: true }),
      project('b', 3),
      project('c', 4),
    ];
    expect(variants(list)).toEqual(['a:wide', 'f:wide', 'b:standard', 'c:standard']);
  });

  it('ignores unpublished projects', () => {
    expect(variants([project('a', 1), project('x', 2, { published: false })])).toEqual(['a:wide']);
  });
});

describe('projectsHeadingKind', () => {
  it('uses the shared kind when all published projects have it', () => {
    const own = [project('a', 1, { kind: 'personal' }), project('b', 2, { kind: 'personal' })];
    expect(projectsHeadingKind(own)).toBe('personal');
    expect(projectsHeadingKind([project('a', 1)])).toBe('demo');
  });

  it('is mixed for different kinds, ignoring unpublished projects', () => {
    const a = project('a', 1, { kind: 'personal' });
    expect(projectsHeadingKind([a, project('b', 2)])).toBe('mixed');
    expect(projectsHeadingKind([a, project('x', 2, { published: false })])).toBe('personal');
  });
});

describe('contactChannels', () => {
  it('lists only configured CV files', () => {
    const c = contactChannels({ ...site, cv: { pl: { path: 'cv/pl.pdf' }, en: null } });
    expect(c.cv).toEqual([{ lang: 'pl', path: 'cv/pl.pdf' }]);
  });
});

describe('visibleHomeSections', () => {
  it('hides every section without data', () => {
    expect(visibleHomeSections(content())).toEqual([]);
  });

  it('shows expertise and technology when they have content', () => {
    const full = content({
      expertise: [
        {
          id: 'a',
          icon: 'architecture',
          title: { pl: '', en: '' },
          description: { pl: '', en: '' },
          points: { pl: [], en: [] },
        },
      ],
      techStack: [{ id: 'f', title: { pl: '', en: '' }, technologies: [] }],
    });
    expect(visibleHomeSections(full)).toEqual(['expertise', 'technology']);
  });

  it('shows projects only when at least one is published', () => {
    expect(
      visibleHomeSections(content({ projects: [project('a', 1, { published: false })] })),
    ).not.toContain('projects');
    expect(visibleHomeSections(content({ projects: [project('a', 1)] }))).toContain('projects');
  });

  it('shows contact when any channel exists', () => {
    const withGithub = content({
      site: { ...site, links: { github: 'https://github.com/x', linkedin: null } },
    });
    expect(visibleHomeSections(withGithub)).toContain('contact');
  });
});
