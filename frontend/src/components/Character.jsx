import { Award, FileText, GitCommitHorizontal, MapPin } from "lucide-react";
import Section from "./Section";
import Reveal from "./Reveal";
import { profile } from "../lib/profile";

export default function Character() {
  return (
    <Section id="character" refdes="U2" label="about" title="About">
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal className="part p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-widest text-signal-lime">
            <FileText size={16} aria-hidden /> readme.txt
          </h3>
          <div className="space-y-4 leading-relaxed text-silk/85">
            {profile.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 font-display text-xs uppercase tracking-wider text-silk/60">
            <MapPin size={14} aria-hidden /> {profile.location} · {profile.languages.join(", ")}
          </p>

          <h3 className="mb-3 mt-7 flex items-center gap-2 font-display text-sm uppercase tracking-widest text-signal-lime">
            <Award size={16} aria-hidden /> certifications
          </h3>
          <ul className="space-y-2.5">
            {profile.certifications.map((c) => (
              <li key={c.title} className="text-sm">
                <span className="font-semibold text-white">{c.title}</span>
                <span className="block text-silk/60">
                  {c.issuer} · <span className="text-copper-light">{c.date}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="part p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-widest text-signal-lime">
            <GitCommitHorizontal size={16} aria-hidden /> changelog
          </h3>
          <ol className="space-y-5">
            {profile.experience.map((job) => (
              <li key={job.role + job.company} className="grid grid-cols-[auto_1fr] gap-x-4">
                <span className="mt-0.5 h-fit rounded bg-board-700 px-2 py-0.5 font-display text-xs font-bold text-signal-lime">{job.version}</span>
                <div>
                  <p className="font-display text-xs uppercase tracking-widest text-copper-light">{job.period}</p>
                  <h4 className="text-base leading-snug">
                    {job.role} <span className="font-normal text-silk/60">· {job.company}</span>
                  </h4>
                  <p className="mt-1 text-sm text-silk/75">{job.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
