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
    return <div className="w-16 h-9 rounded-full skeleton" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-16 h-9 rounded-full p-1 transition-colors duration-300 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-indigo-900 dark:to-violet-900 border border-amber-200/50 dark:border-indigo-700/50 shadow-inner"
      aria-label="Toggle theme"
      whileTap={{ scale: 0.95 }}
    >
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className="w-4 h-4 text-amber-500/40 dark:text-amber-500/20" />
        <Moon className="w-4 h-4 text-indigo-400/20 dark:text-indigo-300/40" />
      </div>

      {/* Sliding indicator */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`
          relative z-10 w-7 h-7 rounded-full shadow-lg flex items-center justify-center
          ${isDark
            ? 'ml-auto bg-gradient-to-br from-indigo-500 to-violet-600'
            : 'mr-auto bg-gradient-to-br from-amber-400 to-orange-500'
          }
        `}
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-white" strokeWidth={2.5} />
          ) : (
            <Sun className="w-4 h-4 text-white" strokeWidth={2.5} />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
