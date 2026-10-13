import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import Section from "./Section";
import Reveal from "./Reveal";
import { api } from "../lib/api";
import { contactSchema } from "../lib/schemas";
import { profile } from "../lib/profile";

export default function Contact() {
  const reduce = useReducedMotion();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const send = useMutation({
    mutationFn: api.sendMessage,
    onSuccess: () => reset(),
  });

  const mail = `mailto:${profile.email}?subject=${encodeURIComponent("Let's work together")}`;

  return (
    <Section id="contact" refdes="J1" label="connector" title="Contact">
      {/* the "hire me" call to action: a push-button switch */}
      <Reveal className="part mb-6 flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="silk">SW1 · momentary switch</p>
          <h3 className="etch mt-1 text-2xl sm:text-3xl">Connect me to your project</h3>
          <p className="mt-1 text-silk/75">Have something worth building? Press the button to open an email.</p>
        </div>
        <motion.a
          href={mail}
          aria-label={`Hire me: email ${profile.email}`}
          whileTap={reduce ? undefined : { y: 4 }}
          className="group flex shrink-0 items-center gap-4 rounded-full border border-ink-600 bg-ink-950 py-2 pl-2 pr-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-lime"
        >
          <span
            aria-hidden
            className="h-14 w-14 rounded-full border-2 border-red-300/40 bg-gradient-to-b from-red-500 to-red-700 shadow-[0_5px_0_#7f1d1d,0_0_18px_rgb(239_68_68/0.45)] transition group-hover:brightness-110 group-active:translate-y-1 group-active:shadow-[0_1px_0_#7f1d1d]"
          />
          <span className="text-left">
            <span className="block font-display text-lg font-bold uppercase tracking-wide text-white">Hire me</span>
            <span className="block font-display text-[10px] uppercase tracking-widest text-silk/60">press to connect</span>
          </span>
        </motion.a>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal>
          <form onSubmit={handleSubmit((v) => send.mutate(v))} className="part space-y-4 p-6" noValidate>
            <h3 className="font-display text-sm uppercase tracking-widest text-signal-lime">tx.message</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" className="input" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" type="email" className="input" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="body" className="label">Message</label>
              <textarea id="body" rows={5} className="input resize-y" {...register("body")} aria-invalid={!!errors.body} />
              {errors.body && <p className="field-error">{errors.body.message}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn-primary" disabled={send.isPending}>
                <Send size={16} aria-hidden /> {send.isPending ? "Sending…" : "Send message"}
              </button>
              {send.isSuccess && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-signal-lime" role="status">
                  <CheckCircle2 size={16} aria-hidden /> Message delivered. I'll reply soon.
                </p>
              )}
              {send.isError && <p className="text-sm font-semibold text-rose-400" role="alert">Couldn't send. Please try again.</p>}
            </div>
          </form>
        </Reveal>

        <Reveal delay={0.1} className="part flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded bg-silk p-3">
            <QRCodeSVG value={window.location.origin} size={140} level="M" bgColor="#e6f0e8" />
          </div>
          <p className="text-sm text-silk/70">Scan to open on your phone</p>
          <a href={`mailto:${profile.email}`} className="font-display text-sm font-bold text-copper-light underline underline-offset-4">
            {profile.email}
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
