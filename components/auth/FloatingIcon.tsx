'use client';

import { motion } from 'framer-motion';

export default function FloatingIcon({ icon: Icon, x, y, delay }: { icon: React.ElementType; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 12 }}
    >
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}>
        <Icon className="h-4 w-4 text-white/60" />
      </motion.div>
    </motion.div>
  );
}
