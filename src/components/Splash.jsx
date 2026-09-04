import React from 'react';
import { motion } from 'motion/react';

export default function Splash() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-32 bg-green-700/10 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
           {/* Fallback PSN Logo placeholder since we don't have the image file path yet */}
           <div className="text-green-700 font-bold text-3xl">PSN</div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight mb-2"
        >
          FSBC
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[#0F172A]/70 text-sm md:text-base font-medium tracking-wide uppercase"
        >
          Functional System Basic Cooperative
        </motion.p>
      </motion.div>

      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#16a34a] to-transparent mt-12 origin-left"
      />

      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-12 text-[#1e3a8a] text-sm font-medium"
      >
        Building stronger financial futures together.
      </motion.p>
    </div>
  );
}
