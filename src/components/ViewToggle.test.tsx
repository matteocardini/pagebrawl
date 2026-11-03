import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { supportsWebGL } from '../state/use-view-mode';
import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('marks the active view with aria-pressed', () => {
    const html = renderToStaticMarkup(<ViewToggle mode="2d" webgl onChange={() => {}} />);
    expect(html).toMatch(/aria-pressed="true"[^>]*>2D</);
    expect(html).toMatch(/aria-pressed="false"[^>]*>3D</);
    expect(html).not.toContain('disabled');
  });

  it('disables 3D and explains why when WebGL is unavailable', () => {
    const html = renderToStaticMarkup(<ViewToggle mode="2d" webgl={false} onChange={() => {}} />);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>3D</);
    expect(html).toContain('3D needs WebGL');
  });
});

describe('supportsWebGL', () => {
  it('is false when there is no DOM to create a canvas', () => {
    expect(supportsWebGL()).toBe(false);
  });
});
