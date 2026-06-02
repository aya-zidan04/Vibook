/**
 * Global page background — single cinematic gradient (light + dark).
 *
 * Base: #0A0A0A under a 145° linear gradient #1A1A1A → #0A0A0A.
 * Edit colors/angle here; keep in sync with admin-web `palette-colors.css`.
 */

/** OLED base under the gradient. */
export const pageBackgroundBase = '#0A0A0A';

/** Gradient start (lighter charcoal). */
export const pageBackgroundGradientStartColor = '#1A1A1A';

/** Gradient end (matches base). */
export const pageBackgroundGradientEndColor = '#0A0A0A';

/** CSS-compatible angle in degrees. */
export const pageBackgroundAngleDeg = 145;

function cssAngleToLinearGradientPoints(degrees: number): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  const rad = ((degrees - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  return {
    start: { x: 0.5 - x * 0.5, y: 0.5 - y * 0.5 },
    end: { x: 0.5 + x * 0.5, y: 0.5 + y * 0.5 },
  };
}

export const pageBackgroundGradientVector = cssAngleToLinearGradientPoints(pageBackgroundAngleDeg);

/** @deprecated Use {@link pageBackgroundBase}. */
export const darkCanvasBase = pageBackgroundBase;
