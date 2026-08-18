// app/loading.tsx
'use client';

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#222222] text-white font-display"
    >
      {/* Logo / Brand */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6,
          ease: [0.33, 1, 0.68, 1]
        }}
        className="text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
          Jericho<span className="text-[#fd551d]">.</span>
        </h1>
        <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c0c0c0]">
          Visual Artist &amp; Web Developer
        </p>
      </motion.div>

      {/* Simple Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-xs text-[#c0c0c0] tracking-[0.2em]"
      >
        Loading
      </motion.p>

      {/* Minimal Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="w-12 h-[1px] bg-[#fd551d] mt-3"
      />

      {/* Bottom Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-700">
          Crafting digital experiences
        </p>
      </motion.div>
    </motion.div>
  );
}