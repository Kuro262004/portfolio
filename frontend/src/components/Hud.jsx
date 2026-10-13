import { motion, useScroll, useSpring } from "framer-motion";
import { useStore } from "../store/useStore";
import { profile } from "../lib/profile";

const NAV = [
  ["About", "U2", "#character"],
  ["Skills", "U3", "#skills"],
  ["Projects", "U4", "#quests"],
  ["Contact", "J1", "#contact"],
];

/** Fixed header strip, styled as a silkscreened pin header. The bar underneath is signal strength = scroll progress. */
export default function Hud() {
  const online = useStore((s) => s.online);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.4 });

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-copper-dark bg-board-950/90 backdrop-blur">
      <div className="container-page flex h-12 items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-silk">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-signal-lime shadow-[0_0_8px_2px_rgb(124_255_107/0.7)]" />
          {profile.name}
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {NAV.map(([label, ref, href]) => (
            <a key={href} href={href} className="group font-display text-xs uppercase tracking-widest text-silk/70 transition hover:text-signal-lime">
              <span className="mr-1.5 text-copper group-hover:text-signal-lime">{ref}</span>
              {label}
            </a>
          ))}
        </nav>

        {online > 0 ? (
          <span className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-signal-lime" title="Visitors on the site right now">
            <span aria-hidden className="blink h-2 w-2 rounded-full bg-signal-lime" /> {online} online
          </span>
        ) : (
          <span aria-hidden className="w-10" />
        )}
      </div>

      <nav aria-label="Sections" className="flex justify-around border-t border-board-600 py-1.5 md:hidden">
        {NAV.map(([label, , href]) => (
          <a key={href} href={href} className="font-display text-[11px] uppercase tracking-widest text-silk/70 hover:text-signal-lime">
            {label}
          </a>
        ))}
      </nav>

      <div className="h-1 bg-board-900" aria-hidden>
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-signal-lime to-signal-cyan"
          style={{ scaleX: progress, boxShadow: "0 0 8px rgb(124 255 107 / 0.8)" }}
        />
      </div>
    </header>
  );
}
