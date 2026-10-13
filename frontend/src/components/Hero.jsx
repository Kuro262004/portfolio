import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown } from "lucide-react";
import Typewriter from "./Typewriter";
import { ChipFrame } from "./Section";
import { api } from "../lib/api";
import { CATEGORY_COLORS, CLASS_INFO, profile } from "../lib/profile";

export default function Hero() {
  const reduce = useReducedMotion();
  const skills = useQuery({ queryKey: ["skills"], queryFn: api.skills });
  const projects = useQuery({ queryKey: ["projects", "all"], queryFn: () => api.projects("all") });

  const fade = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  const bootLog = [
    ["POWER", "OK"],
    ["SKILLS", skills.data ? `${skills.data.length} nodes` : "…"],
    ["PROJECTS", projects.data ? `${projects.data.length} loaded` : "…"],
    ["STATUS", profile.status],
  ];

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center pb-10 pt-32">
      <div className="container-page">
        <ChipFrame id="top" refdes="U1">
          <div className="grid items-center gap-10 p-6 pt-9 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="silk">
                U1 · CPU <span className="text-signal-lime">· boot sequence</span>
              </p>
              <h1 className="etch mt-3 text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
                <Typewriter text={profile.name} />
              </h1>

              <motion.ul {...fade(0.5)} className="mt-6 flex flex-wrap gap-2" aria-label="Skill nets">
                {Object.entries(CLASS_INFO).map(([id, info]) => (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded border px-2.5 py-1 font-display text-xs uppercase tracking-wider"
                    style={{ color: CATEGORY_COLORS[id], borderColor: `${CATEGORY_COLORS[id]}55`, background: `${CATEGORY_COLORS[id]}12` }}
                  >
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLORS[id], boxShadow: `0 0 6px ${CATEGORY_COLORS[id]}` }} />
                    {info.label}
                  </li>
                ))}
              </motion.ul>

              <motion.p {...fade(0.65)} className="mt-6 max-w-xl text-lg text-silk/80">
                {profile.tagline}
              </motion.p>

              <motion.div {...fade(0.8)} className="mt-8 flex flex-wrap gap-3">
                <a href="#skills" className="btn-primary">
                  Follow the signal <ArrowDown size={16} aria-hidden />
                </a>
                <a href="#contact" className="btn-ghost">
                  Contact
                </a>
              </motion.div>
            </div>

            {/* the die: boot log + gauges */}
            <motion.aside {...fade(0.4)} className="rounded-lg border border-ink-600 bg-ink-950 p-5" aria-label="System status">
              <p className="silk mb-3">sys.status</p>
              <dl className="space-y-1.5 font-display text-sm">
                {bootLog.map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <dt className="text-silk/60">
                      <span className="text-signal-lime">&gt;</span> {k}
                    </dt>
                    <span aria-hidden className="flex-1 border-b border-dotted border-ink-600" />
                    <dd className="text-signal-lime">{v}</dd>
                  </div>
                ))}
              </dl>

              <dl className="mt-6 space-y-3">
                {profile.stats.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between font-display text-[11px] uppercase tracking-wider">
                      <dt className="text-silk/60">{s.label}</dt>
                      <dd className="text-copper-light">{s.value}</dd>
                    </div>
                    <div className="h-2 rounded-sm bg-ink-700">
                      <motion.div
                        className="h-full rounded-sm bg-gradient-to-r from-signal-lime to-signal-cyan"
                        style={{ boxShadow: "0 0 8px rgb(124 255 107 / 0.5)" }}
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.9, delay: 0.9 }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
            </motion.aside>
          </div>
        </ChipFrame>
      </div>
    </section>
  );
}
