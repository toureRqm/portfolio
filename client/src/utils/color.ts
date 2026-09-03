import type { CSSProperties } from 'react';

// Technology colors come from the database and were picked for a dark theme
// (React cyan, Node green...). On the light background they are unreadable as
// text, so we darken them for display only. The stored value never changes.

// Max relative luminance for roughly 4.5:1 against the #f6efe7 page background.
const MAX_LUMINANCE = 0.16;

function toRgb(hex: string): [number, number, number] | null {
  const value = hex.trim().replace('#', '');
  const short = value.length === 3;
  if (!short && value.length !== 6) return null;
  const channel = (i: number) =>
    parseInt(short ? value[i]! + value[i]! : value.slice(i * 2, i * 2 + 2), 16);
  const rgb: [number, number, number] = [channel(0), channel(1), channel(2)];
  return rgb.some((c) => Number.isNaN(c)) ? null : rgb;
}

function luminance([r, g, b]: [number, number, number]): number {
  const linear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Darkens a color until it reads on the light background, keeping its hue.
 * Returns the muted text color when the input is missing or malformed.
 */
export function readableOnLight(hex: string | null | undefined, fallback = '#6b5e56'): string {
  const rgb = hex ? toRgb(hex) : null;
  if (!rgb) return fallback;

  let [r, g, b] = rgb;
  for (let i = 0; i < 24 && luminance([r, g, b]) > MAX_LUMINANCE; i += 1) {
    r = Math.round(r * 0.88);
    g = Math.round(g * 0.88);
    b = Math.round(b * 0.88);
  }

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Tinted pill keeping the technology hue: soft background, readable label. */
export function techBadgeStyle(hex: string | null | undefined): CSSProperties {
  const color = readableOnLight(hex);
  return { backgroundColor: `${color}18`, color, border: `1px solid ${color}33` };
}
