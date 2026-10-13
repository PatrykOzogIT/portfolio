import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ProjectImage } from '../../../../content/model';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { SlideTracker } from './slides';

/**
 * Full-screen image viewer on a native modal <dialog>: focus trap, Escape and inert page come from
 * the platform, and focus returns to the thumbnail that opened it. Swipe = native scroll snapping;
 * arrow keys and buttons for everyone else. Slides render only while open (keeps the page light).
 */
@Component({
  selector: 'app-lightbox',
  imports: [NgOptimizedImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
})
export class Lightbox {
  readonly images = input.required<readonly ProjectImage[]>();
  /** Emits the index shown when the viewer closes, so the gallery can follow. */
  readonly closed = output<number>();

  protected readonly t = inject(LangService).t;
  protected readonly lang = inject(LangService).lang;
  protected readonly isOpen = signal(false);
  protected readonly index = signal(0);
  private readonly slides = new SlideTracker();

  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  open(index: number): void {
    this.index.set(index);
    this.isOpen.set(true);
    this.dialog().nativeElement.showModal();
    afterNextRender(
      () => {
        const track = this.track()?.nativeElement;
        if (track) this.slides.goTo(track, index, 'instant');
      },
      { injector: this.injector },
    );
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /** Fired for every way of closing (button, Escape, backdrop). */
  protected onClosed(): void {
    this.isOpen.set(false);
    this.closed.emit(this.index());
  }

  protected go(delta: number): void {
    const next = Math.min(Math.max(this.index() + delta, 0), this.images().length - 1);
    const track = this.track()?.nativeElement;
    if (track) this.slides.goTo(track, next);
    this.index.set(next);
  }

  protected onScroll(track: HTMLElement): void {
    const index = this.slides.onScroll(track);
    if (index !== null) this.index.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.go(-1);
    else if (event.key === 'ArrowRight') this.go(1);
    else return;
    event.preventDefault();
  }

  /** A click on the empty area around the image closes the viewer. */
  protected onSlideClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  protected slideLabel(i: number): string {
    return this.t()
      .gallery.slide.replace('{n}', String(i + 1))
      .replace('{total}', String(this.images().length));
  }
}
