import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PageLoader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
              animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Cart icon animation */}
            <motion.div
              className="relative mb-8"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cart body */}
                <motion.path
                  d="M16 24h8l8 32h28l8-24H28"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                {/* Wheels */}
                <motion.circle cx="34" cy="62" r="4" fill="hsl(var(--secondary))"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                />
                <motion.circle cx="56" cy="62" r="4" fill="hsl(var(--secondary))"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                />
                {/* Nest/egg in cart */}
                <motion.ellipse cx="42" cy="44" rx="10" ry="7"
                  fill="hsl(var(--secondary) / 0.3)"
                  stroke="hsl(var(--secondary))" strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                />
                <motion.ellipse cx="42" cy="42" rx="5" ry="4"
                  fill="hsl(var(--primary) / 0.15)"
                  stroke="hsl(var(--primary))" strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.3 }}
                />
              </svg>

              {/* Glow ring */}
              <motion.div
                className="absolute -inset-4 rounded-full border-2 border-secondary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Brand */}
            <motion.div
              className="flex items-center gap-0.5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-3xl font-black text-primary">Cart</span>
              <span className="text-3xl font-black text-secondary">Nest</span>
            </motion.div>

            {/* Loading text with typing effect */}
            <motion.p
              className="text-sm text-muted-foreground tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.5, 1] }}
              transition={{ delay: 0.6, duration: 2, repeat: Infinity }}
            >
              Loading CartNest…
            </motion.p>

            {/* Progress bar */}
            <motion.div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full gold-gradient"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
