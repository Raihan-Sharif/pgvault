"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-11 h-11 rounded-xl skeleton" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-3 glass rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -90, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-indigo-400" strokeWidth={2.5} />
        ) : (
          <Sun className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
        )}
      </motion.div>
    </motion.button>
  );
}
