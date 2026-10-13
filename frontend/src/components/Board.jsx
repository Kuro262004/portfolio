import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BORDER, PIN_Y, pinLength, seeded } from "../lib/circuit";

const COPPER = "#b9803f";
const COPPER_DIM = "#6f4d27";
const SIGNAL = "#7cff6b";

/**
 * The board under the page. It measures every chip ([data-chip-body]) and routes a copper trunk down the
 * left edge with a branch into each chip's pin. As you scroll, a signal head travels down the trunk; when it
 * passes a branch, that branch lights up and the chip powers on (data-powered="true" on the chip).
 */
export default function Board({ children }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const pin = pinLength();
    const chips = [...wrap.querySelectorAll("[data-chip-body]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.dataset.chipId, ref: el.dataset.ref, left: r.left - wr.left, top: r.top - wr.top, width: r.width };
    });
    if (!chips.length) return;

    const minLeft = Math.min(...chips.map((c) => c.left));
    const tx = Math.max(8, Math.round(Math.min(minLeft - pin - 40, minLeft * 0.4)));
    const branches = chips.map((c) => {
      const endX = c.left + BORDER - pin;
      const diag = Math.max(0, Math.min(24, (endX - tx) / 2));
      const y = c.top + PIN_Y;
      return { ...c, endX, diag, y, y0: y - diag };
    });
    setGeo({ w: wr.width, h: wr.height, tx, branches, trunkEnd: branches[branches.length - 1].y0 });
  }, []);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule); // content loading (projects, skills) changes chip heights
    ro.observe(wrapRef.current);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [measure]);

  // Scroll → signal head position → which branches are lit and which chips are powered.
  useEffect(() => {
    if (!geo) return;
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const trunkLit = svg.querySelector("[data-trunk-lit]");
    const head = svg.querySelector("[data-head]");
    const items = geo.branches.map((b) => ({
      b,
      chip: wrap.querySelector(`[data-chip-body][data-chip-id="${b.id}"]`),
      trace: svg.querySelector(`[data-branch="${b.id}"]`),
    }));

    let raf = 0;
    const update = () => {
      raf = 0;
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const y = window.scrollY + window.innerHeight * 0.6 - top; // the signal head, in board coordinates
      const clamped = Math.max(0, Math.min(y, geo.trunkEnd));
      trunkLit.setAttribute("y2", clamped);
      head.setAttribute("cy", clamped);
      for (const { b, chip, trace } of items) {
        const on = y >= b.y0;
        if (chip) chip.dataset.powered = on ? "true" : "false";
        trace?.classList.toggle("on", on);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [geo]);

  return (
    <div ref={wrapRef} className="relative">
      {geo && <Traces svgRef={svgRef} geo={geo} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Via({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill={COPPER} stroke="#3b2a14" strokeWidth="1.5" />
      <circle cx={x} cy={y} r="3" fill="#072a1c" />
    </g>
  );
}

function Traces({ svgRef, geo }) {
  const { w, h, tx, branches, trunkEnd } = geo;

  // A decorative 4-wire bus down the right edge on wide screens; it carries the same faint traveling signals.
  const bus = [];
  if (w >= 900) {
    const rnd = seeded(7);
    for (let i = 0; i < 4; i++) {
      const x0 = w - 12 - i * 9;
      let d = `M${x0} 50`;
      let y = 50;
      for (;;) {
        y += 160 + rnd() * 260;
        if (y > h - 140) break;
        // a 45° jog sideways and back, like routed neighbors
        const j = 9 * (rnd() > 0.5 ? 1 : -1);
        d += ` V${y} l${j} 9 V${y + 49} l${-j} 9`;
        y += 58;
      }
      d += ` V${h - 40}`;
      bus.push({ d, i, x: x0 });
    }
  }

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute left-0 top-0 z-0"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      {bus.map(({ d, i, x }) => (
        <g key={i} opacity="0.55">
          <path d={d} fill="none" stroke={COPPER_DIM} strokeWidth="3" strokeLinejoin="round" />
          <path d={d} pathLength="100" className="pulse slow" fill="none" stroke={SIGNAL} strokeWidth="2" style={{ animationDelay: `${i * 0.7}s` }} />
          <Via x={x} y={50} />
          <Via x={x} y={h - 40} />
        </g>
      ))}

      {/* power input: the pad sits just below the fixed header so it's visible at the top of the page */}
      <Via x={tx} y={82} />
      <text x={tx + 12} y="86" fill="#e6f0e8" opacity="0.75" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="2">
        VCC
      </text>

      {/* trunk: dim copper, a lit overlay that grows with scroll, and an ambient pulse */}
      <line x1={tx} y1="0" x2={tx} y2={trunkEnd} stroke={COPPER} strokeWidth="4" />
      <line x1={tx} y1="0" x2={tx} y2={trunkEnd} stroke={COPPER_DIM} strokeWidth="1.5" opacity="0.8" />
      <line data-trunk-lit x1={tx} y1="0" x2={tx} y2="0" stroke={SIGNAL} strokeWidth="4" style={{ filter: "drop-shadow(0 0 5px #7cff6b)" }} />
      <path d={`M${tx} 0 V${trunkEnd}`} pathLength="100" className="pulse slow" fill="none" stroke="#eaffea" strokeWidth="3" opacity="0.5" />
      <circle data-head cx={tx} cy="0" r="6" fill="#eaffea" style={{ filter: "drop-shadow(0 0 8px #7cff6b)" }} />

      {branches.map((b, i) => {
        const d = b.diag
          ? `M${tx} ${b.y0} L${tx + b.diag} ${b.y} H${b.endX}`
          : `M${tx} ${b.y} H${b.endX}`;
        return (
          <g key={b.id} data-branch={b.id} className="trace">
            <path d={d} fill="none" stroke={COPPER} strokeWidth="4" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={COPPER_DIM} strokeWidth="1.5" opacity="0.8" strokeLinejoin="round" />
            <path className="lit" d={d} fill="none" stroke={SIGNAL} strokeWidth="4" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px #7cff6b)" }} />
            <path className="pulse" d={d} pathLength="100" fill="none" stroke="#eaffea" strokeWidth="3" strokeLinejoin="round" style={{ animationDelay: `${i * 0.35}s` }} />
            <Via x={tx} y={b.y0} />
            <text x={tx + 11} y={b.y0 - 9} fill="#e6f0e8" opacity="0.6" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="1.5">
              TP{i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
