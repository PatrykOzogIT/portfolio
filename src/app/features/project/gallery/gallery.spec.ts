import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ProjectImage } from '../../../../content/model';
import { Gallery } from './gallery';

const image = (n: number): ProjectImage => ({
  src: `projects/demo/${n}.png`,
  width: 1600,
  height: 1000,
  alt: { pl: `Zrzut ${n}`, en: `Screenshot ${n}` },
  caption: { pl: `Podpis ${n}`, en: `Caption ${n}` },
});

function render(images: ProjectImage[]) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Gallery);
  fixture.componentRef.setInput('images', images);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Gallery', () => {
  beforeAll(() => {
    // jsdom has neither modal dialogs nor element scrolling.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
    HTMLElement.prototype.scrollTo ??= () => {};
    window.matchMedia ??= (() => ({ matches: false })) as unknown as typeof window.matchMedia;
  });

  it('shows a single image without carousel controls', () => {
    const { el } = render([image(1)]);
    expect(el.querySelectorAll('figure').length).toBe(1);
    expect(el.querySelector('.carousel')).toBeNull();
    expect(el.querySelector('.counter')).toBeNull();
    expect(el.querySelector('figcaption')?.textContent).toContain('Podpis 1');
  });

  it('turns two or more images into a carousel with a counter', () => {
    const { el } = render([image(1), image(2), image(3)]);
    expect(el.querySelectorAll('.slide').length).toBe(3);
    expect(el.querySelector('.carousel .counter')?.textContent?.trim()).toBe('1 / 3');
    const [prev, next] = el.querySelectorAll<HTMLButtonElement>('.controls button');
    expect(prev!.disabled).toBe(true);
    expect(next!.disabled).toBe(false);
  });

  it('moves with the arrow buttons and keys, without wrapping around', () => {
    const { el, fixture } = render([image(1), image(2)]);
    const next = el.querySelectorAll<HTMLButtonElement>('.controls button')[1]!;
    next.click();
    fixture.detectChanges();
    expect(el.querySelector('.carousel .counter')?.textContent?.trim()).toBe('2 / 2');
    expect(next.disabled).toBe(true);

    el.querySelector('.track')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(el.querySelector('.carousel .counter')?.textContent?.trim()).toBe('1 / 2');
  });

  it('labels slides for assistive technology', () => {
    const { el } = render([image(1), image(2)]);
    expect(el.querySelector('.slide')?.getAttribute('aria-label')).toBe('Zdjęcie 1 z 2');
  });

  it('opens the viewer at the clicked image and follows it back when closed', () => {
    const { el, fixture } = render([image(1), image(2), image(3)]);
    el.querySelectorAll<HTMLButtonElement>('.slide .frame')[2]!.click();
    fixture.detectChanges();

    const dialog = el.querySelector('dialog')!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('.counter')?.textContent?.trim()).toBe('3 / 3');

    dialog.querySelector<HTMLButtonElement>('.nav.prev')!.click();
    fixture.detectChanges();
    dialog.querySelector<HTMLButtonElement>('.close')!.click();
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
    expect(el.querySelector('.carousel .counter')?.textContent?.trim()).toBe('2 / 3');
  });
});
