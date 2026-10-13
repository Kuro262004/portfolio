import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="card pointer-events-auto flex items-center gap-2 px-4 py-3 text-sm text-white"
          >
            <Bell size={16} className="text-accent-alt" aria-hidden /> {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
