'use client';

import { motion } from 'framer-motion';

export default function PhysioScene() {
  return (
    <svg viewBox="0 0 500 400" className="w-full max-w-[440px]">
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <rect x="80" y="260" width="300" height="16" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <rect x="110" y="276" width="8" height="60" rx="4" fill="rgba(255,255,255,0.12)" />
        <rect x="342" y="276" width="8" height="60" rx="4" fill="rgba(255,255,255,0.12)" />
        <rect x="118" y="310" width="224" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
        <ellipse cx="150" cy="257" rx="35" ry="10" fill="rgba(255,255,255,0.12)" />
      </motion.g>
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
        <ellipse cx="230" cy="248" rx="90" ry="14" fill="rgba(91,158,244,0.2)" />
        <circle cx="148" cy="240" r="18" fill="rgba(91,158,244,0.25)" stroke="rgba(91,158,244,0.4)" strokeWidth="1" />
        <rect x="165" y="234" width="100" height="24" rx="12" fill="rgba(91,158,244,0.2)" />
        <rect x="265" y="238" width="80" height="14" rx="7" fill="rgba(91,158,244,0.18)" />
        <rect x="265" y="252" width="75" height="12" rx="6" fill="rgba(91,158,244,0.15)" />
        <rect x="200" y="258" width="8" height="25" rx="4" fill="rgba(91,158,244,0.15)" />
      </motion.g>
      <motion.g initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
        <circle cx="230" cy="150" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <circle cx="230" cy="134" r="10" fill="rgba(255,255,255,0.15)" />
        <path d="M208 172 L208 230 Q208 238 216 238 L244 238 Q252 238 252 230 L252 172 Q252 165 240 162 L230 160 L220 162 Q208 165 208 172Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <motion.path d="M208 185 L185 210 Q180 218 188 222 L200 228" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round"
          animate={{ d: ["M208 185 L185 210 Q180 218 188 222 L200 228", "M208 185 L185 212 Q178 220 186 225 L198 232", "M208 185 L185 210 Q180 218 188 222 L200 228"] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.path d="M252 185 L270 205 Q278 212 272 220 L258 232" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round"
          animate={{ d: ["M252 185 L270 205 Q278 212 272 220 L258 232", "M252 185 L272 208 Q280 215 274 223 L260 236", "M252 185 L270 205 Q278 212 272 220 L258 232"] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
        <motion.circle cx="200" cy="230" r="6" fill="rgba(255,255,255,0.25)" animate={{ cy: [230, 234, 230] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.circle cx="258" cy="234" r="6" fill="rgba(255,255,255,0.25)" animate={{ cy: [234, 238, 234] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
      </motion.g>
      {[{ cx: 210, cy: 245, delay: 0 }, { cx: 240, cy: 248, delay: 1.2 }, { cx: 270, cy: 246, delay: 2.4 }].map((ring, i) => (
        <motion.circle key={i} cx={ring.cx} cy={ring.cy} r="4" fill="none" stroke="rgba(91,158,244,0.5)" strokeWidth="1.5"
          animate={{ r: [4, 18, 4], opacity: [0.6, 0, 0.6] }} transition={{ duration: 3, delay: ring.delay + 1.5, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
      {[{ cx: 180, cy: 200, delay: 2 }, { cx: 280, cy: 190, delay: 2.8 }, { cx: 230, cy: 180, delay: 3.6 }].map((s, i) => (
        <motion.g key={`sparkle-${i}`}>
          <motion.line x1={s.cx - 5} y1={s.cy} x2={s.cx + 5} y2={s.cy} stroke="rgba(39,174,96,0.5)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0, 0.7, 0], scaleX: [0.5, 1, 0.5] }} transition={{ duration: 2, delay: s.delay, repeat: Infinity }} />
          <motion.line x1={s.cx} y1={s.cy - 5} x2={s.cx} y2={s.cy + 5} stroke="rgba(39,174,96,0.5)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0, 0.7, 0], scaleY: [0.5, 1, 0.5] }} transition={{ duration: 2, delay: s.delay, repeat: Infinity }} />
        </motion.g>
      ))}
      <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.15, y: 0 }} transition={{ delay: 1.5, duration: 1 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse key={i} cx="420" cy={120 + i * 22} rx={12 - Math.abs(i - 3)} ry="6" fill="white" />
        ))}
      </motion.g>
      <motion.path d="M365 280 Q385 260 405 280 Q425 300 405 310" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 1.5 }} />
      <motion.line x1="60" y1="336" x2="440" y2="336" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1 }} />
    </svg>
  );
}
