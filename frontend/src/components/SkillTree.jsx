import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BrainCircuit, Briefcase, Code2, Palette, PowerOff, RotateCcw, Sparkles } from "lucide-react";
import Section from "./Section";
import { Cover, ProjectDialog } from "./Projects";
import { api } from "../lib/api";
import { useStore } from "../store/useStore";
import { CATEGORY_COLORS, CLASS_INFO } from "../lib/profile";
import { NODE_R, buildTree, toLevel } from "../lib/tree";

const ICONS = { developer: Code2, ai: BrainCircuit, designer: Palette, professional: Briefcase };
const NODE_W = 116; // max label column width (px)
const COPPER = "#8a5a2b";

function Pips({ level, color, on }) {
  return (
    <span className="mt-1 flex justify-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="h-1.5 w-2.5 rounded-[1px] sm:w-3" style={{ background: on && i <= level ? color : "#1c2925", boxShadow: on && i <= level ? `0 0 4px ${color}` : "none" }} />
      ))}
    </span>
  );
}

function Node({ node, leaves, color, Icon, powered, selected, onSelect }) {
  const { skill } = node;
  const level = skill ? toLevel(skill.level) : 5;
  const pad = (
    <motion.span
      className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 bg-ink-900"
      initial={false}
      animate={{
        scale: powered ? 1 : 0.88,
        borderColor: powered ? color : "#3a4a42",
        boxShadow: powered ? `0 0 ${selected ? 30 : 16}px ${color}aa, inset 0 0 12px ${color}33` : "0 0 0px transparent",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      {powered ? <Icon size={26} style={{ color }} aria-hidden /> : <PowerOff size={22} className="text-ink-600" aria-hidden />}
      {selected && <span className="pulse-ring absolute inset-0 rounded-full" style={{ "--c": color }} aria-hidden />}
    </motion.span>
  );

  const label = (
    <>
      <span className={`mt-2 block break-words font-display text-xs font-bold leading-tight sm:text-sm ${powered ? "text-white" : "text-silk/40"}`}>
        {skill ? skill.name : classLabel(node.key)}
      </span>
      {skill && (
        <>
          <span className={`block font-display text-[10px] uppercase tracking-wider ${powered ? "text-silk/60" : "text-silk/30"}`}>
            {powered ? `Lv ${level}` : "Offline"}
          </span>
          <Pips level={level} color={color} on={powered} />
        </>
      )}
    </>
  );

  // Labels share the canvas width evenly on narrow screens, capped at NODE_W on wide ones.
  const style = { left: `${node.xPct}%`, top: node.y - NODE_R, width: `min(${NODE_W}px, ${100 / leaves}%)` };

  // The class root is the power source (decoration); real skills are buttons you can select once powered.
  if (!skill) {
    return (
      <div className="absolute -translate-x-1/2 text-center" style={style}>
        <div className="flex justify-center">{pad}</div>
        {label}
      </div>
    );
  }
  return (
    <div className="absolute -translate-x-1/2 text-center" style={style}>
      <button
        onClick={() => onSelect(skill.id)}
        disabled={!powered}
        aria-pressed={selected}
        aria-label={powered ? `${skill.name}, level ${level} of 5. Show details` : `${skill.name}, offline`}
        className="group block w-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-lime enabled:cursor-pointer"
      >
        <span className="flex justify-center transition group-enabled:group-hover:-translate-y-0.5">{pad}</span>
        {label}
      </button>
    </div>
  );
}

// "class-developer" → "Developer"
function classLabel(key) {
  const id = key.replace("class-", "");
  return CLASS_INFO[id]?.label ?? id;
}

/** Copper traces between nodes. Right-angled like real routing; they light up in the class color as power arrives. */
function Edges({ tree, color, poweredDepth }) {
  const byKey = Object.fromEntries(tree.nodes.map((n) => [n.key, n]));
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 100 ${tree.height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {tree.edges.map((e) => {
        const a = byKey[e.from];
        const b = byKey[e.to];
        // start below the parent's label (name, level, pips) so the trace doesn't cross the text
        const y1 = a.y + NODE_R + (a.skill ? 58 : 26);
        const y2 = b.y - NODE_R;
        const mid = Math.round((y1 + y2) / 2);
        const d = `M${a.xPct} ${y1} V${mid} H${b.xPct} V${y2}`;
        const on = b.depth <= poweredDepth;
        return (
          <g key={`${e.from}-${e.to}`}>
            <path d={d} fill="none" stroke={COPPER} strokeWidth="5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
            <motion.path
              d={d}
              className="flow"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{ opacity: on ? 0.9 : 0 }}
              transition={{ duration: 0.6 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function Details({ skill, project, earnedWith, color, onOpenProject }) {
  const level = toLevel(skill.level);
  return (
    <motion.div
      key={skill.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="grid gap-6 md:grid-cols-[1fr_1.1fr]"
    >
      <div>
        <p className="font-display text-xs uppercase tracking-widest" style={{ color }}>
          {CLASS_INFO[skill.category]?.label} net
        </p>
        <h3 className="etch mt-1 text-3xl">{skill.name}</h3>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-sm text-copper-light">Lv {level}/5</span>
          <Pips level={level} color={color} on />
        </div>
        {skill.description && <p className="mt-4 leading-relaxed text-silk/85">{skill.description}</p>}
      </div>

      <div>
        <p className="silk mb-2">Earned in project</p>
        {project ? (
          <button
            onClick={() => onOpenProject(project)}
            className="part block w-full overflow-hidden text-left hover:border-signal-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-lime"
          >
            <Cover project={project} />
            <span className="block p-4">
              <span className="block font-display text-base font-bold text-white">{project.title}</span>
              <span className="mt-1 block text-sm text-silk/75">{project.summary}</span>
              {earnedWith.length > 0 && <span className="mt-2 block text-xs text-silk/60">Also taught: {earnedWith.map((s) => s.name).join(", ")}</span>}
              <span className="mt-3 inline-flex items-center gap-1 font-display text-xs uppercase tracking-wider text-signal-lime">
                <Sparkles size={12} aria-hidden /> View project
              </span>
            </span>
          </button>
        ) : (
          <p className="part p-4 text-sm text-silk/70">No project recorded yet — this one was learned off the clock.</p>
        )}
      </div>
    </motion.div>
  );
}

export default function SkillTree() {
  const reduce = useReducedMotion();
  const skillsQ = useQuery({ queryKey: ["skills"], queryFn: api.skills });
  const projectsQ = useQuery({ queryKey: ["projects", "all"], queryFn: () => api.projects("all") });
  const focusSkill = useStore((s) => s.focusSkill);
  const setFocusSkill = useStore((s) => s.setFocusSkill);

  const [cls, setCls] = useState("ai");
  const [selectedId, setSelectedId] = useState(null);
  const [openProject, setOpenProject] = useState(null);
  const [replay, setReplay] = useState(0);
  const [poweredDepth, setPoweredDepth] = useState(-1);

  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const inView = useInView(canvasRef, { once: true, amount: 0.2 });

  const skills = skillsQ.data ?? [];
  const projects = projectsQ.data ?? [];
  const tree = useMemo(() => buildTree(skills, cls), [skills, cls]);
  const color = CATEGORY_COLORS[cls];
  const Icon = ICONS[cls];

  // A wide tree scrolls sideways on phones: start centered on the root instead of cut off at the left.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [cls, tree.leaves]);

  // Power flows down the tree one tier at a time (a node only powers after its parent) once it is on screen.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setPoweredDepth(tree.maxDepth);
      return;
    }
    setPoweredDepth(0);
    const timers = [];
    for (let d = 1; d <= tree.maxDepth; d++) timers.push(setTimeout(() => setPoweredDepth(d), d * 700));
    return () => timers.forEach(clearTimeout);
  }, [inView, cls, replay, tree.maxDepth, reduce]);

  // A project's "skills earned" chip asks us to show a particular node.
  useEffect(() => {
    if (!focusSkill) return;
    setCls(focusSkill.category);
    setSelectedId(focusSkill.id);
    setFocusSkill(null);
  }, [focusSkill, setFocusSkill]);

  const selected = skills.find((s) => s.id === selectedId) ?? null;
  const selectedProject = selected ? projects.find((p) => p.id === selected.project_id) ?? null : null;
  const earnedWith = selected ? skills.filter((s) => s.project_id === selected.project_id && s.id !== selected.id) : [];

  const classSkills = tree.nodes.filter((n) => n.skill);
  const poweredCount = classSkills.filter((n) => n.depth <= poweredDepth).length;

  const changeClass = (next) => {
    setCls(next);
    setSelectedId(null);
  };

  return (
    <Section id="skills" refdes="U3" label="skill network" title="Skills">
      <Tabs.Root value={cls} onValueChange={changeClass}>
        <Tabs.List className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Choose a net">
          {Object.entries(CLASS_INFO).map(([id, info]) => {
            const C = ICONS[id];
            const c = CATEGORY_COLORS[id];
            return (
              <Tabs.Trigger
                key={id}
                value={id}
                className="part flex items-center gap-3 p-3 text-left hover:border-signal-lime data-[state=active]:border-[var(--c)] data-[state=active]:bg-ink-700 data-[state=active]:shadow-[0_0_16px_var(--c)]"
                style={{ "--c": c }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2" style={{ borderColor: c, color: c }}>
                  <C size={20} aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold uppercase tracking-wide text-white">{info.label}</span>
                  <span className="block text-xs text-silk/60">{info.blurb}</span>
                </span>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>

      <div className="pcb p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-xs uppercase tracking-widest" role="status">
            Nodes powered: <span style={{ color }}>{Math.max(0, poweredCount)}</span>
            <span className="text-silk/50"> / {classSkills.length}</span>
          </p>
          <button onClick={() => setReplay((n) => n + 1)} className="btn-ghost !px-3 !py-1.5 !text-xs">
            <RotateCcw size={14} aria-hidden /> Replay
          </button>
        </div>

        {skillsQ.isError && <p className="font-semibold text-copper-light">Couldn't load skills. Is the API running on port 8000?</p>}

        {tree.leaves > 4 && <p className="mb-2 font-display text-[11px] uppercase tracking-widest text-silk/50 sm:hidden">← swipe to see the whole tree →</p>}
        <div ref={scrollRef} className="overflow-x-auto pb-2">
          {/* wide trees keep a minimum width so labels stay readable; on phones the tree then scrolls sideways */}
          <div ref={canvasRef} className="relative w-full" style={{ height: tree.height, minWidth: tree.leaves * 84 }}>
            <Edges tree={tree} color={color} poweredDepth={poweredDepth} />
            {tree.nodes.map((n) => (
              <Node
                key={n.key}
                node={n}
                leaves={tree.leaves}
                color={color}
                Icon={Icon}
                powered={n.depth <= poweredDepth}
                selected={n.skill?.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="part mt-6 min-h-[16rem] p-5 sm:p-7" aria-live="polite">
        <AnimatePresence mode="wait">
          {selected ? (
            <Details
              key={selected.id}
              skill={selected}
              project={selectedProject}
              earnedWith={earnedWith}
              color={CATEGORY_COLORS[selected.category]}
              onOpenProject={setOpenProject}
            />
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center text-silk/60">
              <span className="blink text-signal-lime">&gt;</span> Select a powered node to see the project where the skill was earned.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ProjectDialog
        project={openProject}
        earned={openProject ? skills.filter((s) => s.project_id === openProject.id) : []}
        onClose={() => setOpenProject(null)}
      />
    </Section>
  );
}
