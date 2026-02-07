"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl skeleton" />;
  }

  const themes = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      id: "system",
      label: "System",
      icon: Monitor,
      gradient: "from-slate-400 to-slate-600",
    },
  ];

  const currentIcon = resolvedTheme === "dark" ? Moon : Sun;
  const currentGradient =
    resolvedTheme === "dark"
      ? "from-indigo-500 to-purple-600"
      : "from-amber-400 to-orange-500";

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "p-2.5 rounded-xl glass transition-all",
          "hover:bg-indigo-50 dark:hover:bg-indigo-950/50",
          isOpen &&
            "bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20",
        )}
        aria-label="Toggle theme"
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {React.createElement(currentIcon, {
            className: "w-5 h-5 text-slate-700 dark:text-slate-300",
          })}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 glass-card rounded-xl overflow-hidden shadow-xl z-50"
          >
            {themes.map((t, index) => {
              const Icon = t.icon;
              const isActive = theme === t.id;

              return (
                <motion.button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.08)" }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-3 transition-colors",
                    isActive && "bg-indigo-50 dark:bg-indigo-500/10",
                  )}
                >
                  <motion.div
                    className={cn(
                      "p-1.5 rounded-lg",
                      isActive
                        ? `bg-gradient-to-br ${t.gradient} shadow-lg`
                        : "bg-slate-100 dark:bg-slate-700",
                    )}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5",
                        isActive
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400",
                      )}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-sm font-medium flex-1 text-left",
                      isActive
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {t.label}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-1 bg-indigo-100 dark:bg-indigo-500/20 rounded-full"
                    >
                      <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
