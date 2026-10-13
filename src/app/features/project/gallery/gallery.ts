import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { ProjectImage } from '../../../../content/model';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { Lightbox } from './lightbox';
import { scrollToSlide, slideIndex } from './slides';

/**
 * Project gallery that adapts to the number of images:
 * one image → a single framed image; two or more → a swipeable carousel with arrows, counter and
 * keyboard support. Every image opens the full-screen viewer. (No images → the page omits the gallery.)
 * Images are never cropped: frames letterbox them on the surface colour.
 */
@Component({
  selector: 'app-gallery',
  imports: [NgOptimizedImage, Icon, Lightbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  readonly images = input.required<readonly ProjectImage[]>();

  protected readonly t = inject(LangService).t;
  protected readonly lang = inject(LangService).lang;
  protected readonly index = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly lightbox = viewChild.required(Lightbox);

  protected open(index: number): void {
    this.lightbox().open(index);
  }

  /**
   * Keep the carousel on the image the viewer was closed at, and move focus there
   * (the browser would return it to the thumbnail that opened the viewer, possibly off-screen).
   */
  protected followViewer(index: number): void {
    const track = this.track()?.nativeElement;
    if (track) scrollToSlide(track, index, 'instant');
    this.index.set(index);
    this.host.querySelectorAll<HTMLElement>('.frame')[index]?.focus({ preventScroll: true });
  }

  protected go(delta: number): void {
    const next = Math.min(Math.max(this.index() + delta, 0), this.images().length - 1);
    const track = this.track()?.nativeElement;
    if (track) scrollToSlide(track, next);
    this.index.set(next);
  }

  protected onScroll(track: HTMLElement): void {
    this.index.set(slideIndex(track));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.go(-1);
    else if (event.key === 'ArrowRight') this.go(1);
    else return;
    event.preventDefault();
  }

  protected slideLabel(i: number): string {
    return this.t()
      .gallery.slide.replace('{n}', String(i + 1))
      .replace('{total}', String(this.images().length));
  }
}
