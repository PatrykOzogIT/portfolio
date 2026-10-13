import { imageUrl, pickWidth, targetWidths, variantPath } from './images';

describe('image rules', () => {
  it('never upscales and keeps the original width as the last step', () => {
    expect(targetWidths(400)).toEqual([96, 160, 320, 400]);
    expect(targetWidths(1920)).toEqual([96, 160, 320, 480, 640, 960, 1280, 1600, 1920]);
    expect(targetWidths(3000).at(-1)).toBe(1920);
    expect(targetWidths(80)).toEqual([80]);
  });

  it('names variants predictably', () => {
    expect(variantPath('images/photo.png', 320)).toBe('images/photo.w320.webp');
    expect(variantPath('/projects/a/cover.jpeg', 96)).toBe('projects/a/cover.w96.webp');
  });

  it('picks the smallest width that covers the request', () => {
    expect(pickWidth([96, 160, 320, 400], 76)).toBe(96);
    expect(pickWidth([96, 160, 320, 400], 152)).toBe(160);
    expect(pickWidth([96, 160, 320, 400], 800)).toBe(400);
    expect(pickWidth([96, 160, 320, 400])).toBe(400);
  });

  it('builds URLs from the manifest and leaves unknown images untouched', () => {
    const manifest = { 'images/photo.png': [96, 160, 320, 400] };
    expect(imageUrl(manifest, '/images/photo.png', 150)).toBe('/img/images/photo.w160.webp');
    expect(imageUrl(manifest, 'logo.svg', 150)).toBe('/logo.svg');
  });
});
