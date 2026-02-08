"use client";

import { motion } from "framer-motion";

export function SvgBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        {/* Top right orb - Cyan/Teal in light, Indigo in dark */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/30 to-teal-500/20 dark:from-indigo-500/20 dark:to-violet-600/10 blur-3xl animate-float" />
        
        {/* Bottom left orb - Emerald in light, Purple in dark */}
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-500/15 dark:from-purple-600/15 dark:to-indigo-500/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        
        {/* Center accent orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-indigo-500/5 to-transparent dark:from-indigo-400/5 dark:to-transparent blur-3xl" />
      </motion.div>

      {/* SVG Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-900 dark:text-white"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Decorative SVG shapes */}
      <svg
        className="absolute top-20 right-10 w-20 h-20 text-cyan-500/20 dark:text-indigo-400/20 animate-float"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </svg>

      <svg
        className="absolute bottom-32 left-10 w-16 h-16 text-emerald-500/20 dark:text-violet-400/20 animate-float"
        style={{ animationDelay: '-1s' }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="50,10 90,90 10,90" stroke="currentColor" strokeWidth="2" fill="none" />
        <polygon points="50,30 75,75 25,75" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      <svg
        className="absolute top-1/3 left-20 w-12 h-12 text-teal-500/15 dark:text-cyan-400/15 animate-float"
        style={{ animationDelay: '-3s' }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)" />
      </svg>

      {/* Database-themed SVG decoration */}
      <svg
        className="absolute bottom-1/4 right-20 w-24 h-24 text-indigo-500/10 dark:text-indigo-400/10"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="50" cy="25" rx="35" ry="12" stroke="currentColor" strokeWidth="2" />
        <path d="M15 25 L15 75 C15 81.627 30.67 87 50 87 C69.33 87 85 81.627 85 75 L85 25" stroke="currentColor" strokeWidth="2" fill="none" />
        <ellipse cx="50" cy="45" rx="35" ry="12" stroke="currentColor" strokeWidth="1" className="opacity-50" />
        <ellipse cx="50" cy="65" rx="35" ry="12" stroke="currentColor" strokeWidth="1" className="opacity-50" />
      </svg>
    </div>
  );
}
