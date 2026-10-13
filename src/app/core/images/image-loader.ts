import { IMAGE_CONFIG, IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import type { Provider } from '@angular/core';
import { IMAGE_MANIFEST } from '../../../content/generated/images';
import { IMAGE_WIDTHS, imageUrl } from '../../../content/images';

/**
 * NgOptimizedImage integration: `ngSrc="/images/photo.png"` resolves to the build-time WebP variant
 * that covers the requested width, and `srcset` is built from the generated widths.
 */
export function provideResponsiveImages(): Provider[] {
  return [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => imageUrl(IMAGE_MANIFEST, config.src, config.width),
    },
    { provide: IMAGE_CONFIG, useValue: { breakpoints: [...IMAGE_WIDTHS] } },
  ];
}
