// app/about/loading.tsx
'use client';

import { motion } from "framer-motion";

export default function AboutLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-[#222222] text-white font-display"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-black tracking-tight">
          Jericho<span className="text-[#fd551d]">.</span>
        </h2>
        <p className="mt-2 text-[10px] text-[#c0c0c0] tracking-[0.2em]">
          Loading About
        </p>
      </motion.div>
      
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-8 h-[1px] bg-[#fd551d] mt-3"
      />
    </motion.div>
  );
}