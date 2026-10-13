// Geometry shared between the chip styling (.chip in index.css) and the trace router (Board.jsx).
export const PIN_Y = 53; // distance from a chip's outer top edge to the center of the left pin the trace attaches to
export const BORDER = 2; // chip border width
export const pinLength = () => (window.innerWidth < 640 ? 6 : 14); // keep in sync with --pin in index.css

/** Small deterministic PRNG so decorative traces look the same on every load. */
export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
