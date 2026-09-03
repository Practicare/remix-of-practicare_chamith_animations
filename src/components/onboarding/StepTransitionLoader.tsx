import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  message?: string;
}

export function StepTransitionLoader({ message = "Personalising your workspace…" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/85 backdrop-blur-xl"
    >
      {/* Pulsing halo */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-primary/20 blur-2xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-28 h-28 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute w-28 h-28 rounded-full border-2 border-accent/40"
          animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        <motion.div
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-elevated"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-9 h-9 text-primary-foreground" />
        </motion.div>

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15, ease: "easeOut" }}
            />
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 text-base md:text-lg font-medium text-foreground/80 tracking-tight"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
