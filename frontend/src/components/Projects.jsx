import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Star, X } from "lucide-react";
import Section from "./Section";
import { api } from "../lib/api";
import { useStore } from "../store/useStore";
import { CATEGORIES, CATEGORY_COLORS } from "../lib/profile";

export function Cover({ project, tall = false }) {
  const height = tall ? "h-48" : "h-36";
  if (project.image_url) {
    return <img src={project.image_url} alt="" loading="lazy" className={`${height} w-full object-cover`} />;
  }
  const color = CATEGORY_COLORS[project.category];
  return (
    <div
      aria-hidden
      className={`${height} relative overflow-hidden border-b border-ink-600`}
      style={{ background: `linear-gradient(135deg, ${color}40, #0a3a27 75%)` }}
    >
      {/* a little trace + via, so even image-less covers look like part of the board */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
        <path d="M0 30 H35 L45 20 H100" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <circle cx="35" cy="30" r="1.4" fill={color} fillOpacity="0.5" />
      </svg>
      <span className="absolute -bottom-3 left-3 font-display text-7xl font-bold leading-none" style={{ color: `${color}55` }}>
        {project.title.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

/** Jump from a project to the skill it taught: tell the tree which node to select, then scroll to it. */
function goToSkill(skill, setFocusSkill) {
  setFocusSkill({ id: skill.id, category: skill.category });
  document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
}

// A hub project can teach a lot; the card shows the first few and the dialog lists them all.
function SkillChips({ skills, max = 6 }) {
  const setFocusSkill = useStore((s) => s.setFocusSkill);
  if (!skills.length) return null;
  const shown = skills.slice(0, max);
  const hidden = skills.length - shown.length;
  return (
    <div className="mt-4">
      <p className="silk mb-1.5 !text-[10px]">Skills earned</p>
      <ul className="flex flex-wrap gap-1.5">
        {hidden > 0 && (
          <li className="order-last self-center px-1 font-display text-xs text-silk/60">+{hidden} more</li>
        )}
        {shown.map((s) => (
          <li key={s.id}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToSkill(s, setFocusSkill);
              }}
              className="flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold transition hover:brightness-125"
              style={{ color: CATEGORY_COLORS[s.category], borderColor: `${CATEGORY_COLORS[s.category]}66`, background: `${CATEGORY_COLORS[s.category]}14` }}
              title={`See ${s.name} on the skill network`}
            >
              ● {s.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ project, index, earned, onOpen }) {
  const color = CATEGORY_COLORS[project.category];
  return (
    <motion.li layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}>
      {/* div+role instead of a button: the skill chips inside are buttons too */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(project)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(project))}
        className="part block h-full w-full cursor-pointer overflow-hidden text-left hover:-translate-y-0.5 hover:border-signal-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-lime"
      >
        <Cover project={project} />
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between font-display text-[11px] uppercase tracking-wider">
            <span style={{ color }}>
              PRJ-{String(index + 1).padStart(2, "0")} · {project.category}
            </span>
            {project.featured && (
              <span className="flex items-center gap-1 text-copper-light">
                <Star size={11} aria-hidden /> Featured
              </span>
            )}
          </div>
          <h3 className="text-lg leading-tight">{project.title}</h3>
          <p className="mt-2 text-sm text-silk/75">{project.summary}</p>
          <SkillChips skills={earned} />
        </div>
      </div>
    </motion.li>
  );
}

export function ProjectDialog({ project, earned = [], onClose }) {
  return (
    <Dialog.Root open={!!project} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-board-950/85 backdrop-blur-sm" />
        <Dialog.Content className="panel fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-[0_0_40px_rgb(124_255_107/0.12)]">
          {project && (
            <>
              <Cover project={project} tall />
              <Dialog.Close
                className="absolute right-3 top-3 rounded border border-ink-600 bg-ink-900 p-2 text-silk hover:border-signal-lime hover:text-signal-lime"
                aria-label="Close"
              >
                <X size={16} />
              </Dialog.Close>
              <div className="p-6">
                <p className="silk" style={{ color: CATEGORY_COLORS[project.category] }}>
                  {project.category} project
                </p>
                <Dialog.Title className="etch mt-1 text-3xl leading-tight">{project.title}</Dialog.Title>
                <Dialog.Description className="mt-2 text-silk/75">{project.summary}</Dialog.Description>
                {project.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-silk/85">{project.description}</p>}
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {project.tags.map((t) => (
                    <li key={t} className="rounded bg-ink-700 px-2 py-0.5 font-display text-xs text-silk/80">
                      {t}
                    </li>
                  ))}
                </ul>
                {earned.length > 0 && (
                  <p className="mt-4 text-sm text-silk/70">
                    Skills earned: <span className="font-semibold text-silk">{earned.map((s) => s.name).join(", ")}</span>
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="btn-primary">
                      <ExternalLink size={16} aria-hidden /> Live site
                    </a>
                  )}
                  {project.repo_url && (
                    <a href={project.repo_url} target="_blank" rel="noreferrer" className="btn-ghost">
                      <Github size={16} aria-hidden /> Source
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Projects() {
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", category],
    queryFn: () => api.projects(category),
  });
  const { data: skills = [] } = useQuery({ queryKey: ["skills"], queryFn: api.skills });
  const earnedBy = (project) => skills.filter((s) => s.project_id === project.id);

  return (
    <Section id="quests" refdes="U4" label="projects" title="Projects">
      <Tabs.Root value={category} onValueChange={setCategory}>
        <Tabs.List className="mb-8 flex flex-wrap gap-2" aria-label="Filter projects by net">
          {CATEGORIES.map((c) => (
            <Tabs.Trigger
              key={c.id}
              value={c.id}
              className="rounded border border-ink-600 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-silk/70 transition hover:border-signal-lime hover:text-signal-lime data-[state=active]:border-signal-lime data-[state=active]:bg-signal-lime data-[state=active]:text-ink-950"
            >
              {c.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {isLoading && <p>Loading projects…</p>}
      {isError && <p className="font-semibold text-copper-light">Couldn't load projects. Is the API running on port 8000?</p>}
      {data && data.length === 0 && <p>No projects on this net yet.</p>}

      <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {data?.map((p, i) => <ProjectCard key={p.id} project={p} index={i} earned={earnedBy(p)} onOpen={setSelected} />)}
        </AnimatePresence>
      </motion.ul>

      <ProjectDialog project={selected} earned={selected ? earnedBy(selected) : []} onClose={() => setSelected(null)} />
    </Section>
  );
}
