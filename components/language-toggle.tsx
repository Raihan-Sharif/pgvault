"use client";

import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl",
        "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
        "border border-slate-200 dark:border-slate-700",
        "hover:border-indigo-400 dark:hover:border-indigo-500",
        "shadow-sm hover:shadow-md transition-all duration-200"
      )}
      title={language === "en" ? "Switch to বাংলা" : "Switch to English"}
    >
      <Globe className="w-4 h-4 text-indigo-500" />
      
      <div className="relative flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
        {/* Slider background */}
        <motion.div
          className="absolute h-6 w-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-md shadow-sm"
          initial={false}
          animate={{ x: language === "en" ? 0 : 32 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
        
        {/* EN label */}
        <span
          className={cn(
            "relative z-10 w-8 h-6 flex items-center justify-center text-xs font-bold transition-colors",
            language === "en" ? "text-white" : "text-slate-600 dark:text-slate-400"
          )}
        >
          EN
        </span>
        
        {/* BN label */}
        <span
          className={cn(
            "relative z-10 w-8 h-6 flex items-center justify-center text-xs font-bold transition-colors",
            language === "bn" ? "text-white" : "text-slate-600 dark:text-slate-400"
          )}
        >
          বাং
        </span>
      </div>
    </motion.button>
  );
}
