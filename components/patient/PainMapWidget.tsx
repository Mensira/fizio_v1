'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useStore } from '@/lib/store';

const INTENSITY_COLORS = ['#27AE60', '#F39C12', '#E67E22', '#E74C3C', '#C0392B'];
const INTENSITY_LABELS_TR = ['Çok Hafif', 'Hafif', 'Orta', 'Şiddetli', 'Çok Şiddetli'];
const INTENSITY_LABELS_EN = ['Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];

const BODY_REGIONS = [
  { id: 'head', label: 'Baş', labelEn: 'Head', cx: 187.5, cy: 40 },
  { id: 'neck', label: 'Boyun', labelEn: 'Neck', cx: 187.5, cy: 85 },
  { id: 'l-shoulder', label: 'Sol Omuz', labelEn: 'L Shoulder', cx: 130, cy: 115 },
  { id: 'r-shoulder', label: 'Sağ Omuz', labelEn: 'R Shoulder', cx: 245, cy: 115 },
  { id: 'chest', label: 'Göğüs', labelEn: 'Chest', cx: 187.5, cy: 145 },
  { id: 'l-upper-arm', label: 'Sol Üst Kol', labelEn: 'L Upper Arm', cx: 110, cy: 170 },
  { id: 'r-upper-arm', label: 'Sağ Üst Kol', labelEn: 'R Upper Arm', cx: 265, cy: 170 },
  { id: 'abdomen', label: 'Karın', labelEn: 'Abdomen', cx: 187.5, cy: 200 },
  { id: 'l-forearm', label: 'Sol Ön Kol', labelEn: 'L Forearm', cx: 95, cy: 230 },
  { id: 'r-forearm', label: 'Sağ Ön Kol', labelEn: 'R Forearm', cx: 280, cy: 230 },
  { id: 'lower-back', label: 'Bel', labelEn: 'Lower Back', cx: 187.5, cy: 248 },
  { id: 'l-hand', label: 'Sol El', labelEn: 'L Hand', cx: 80, cy: 290 },
  { id: 'r-hand', label: 'Sağ El', labelEn: 'R Hand', cx: 295, cy: 290 },
  { id: 'l-hip', label: 'Sol Kalça', labelEn: 'L Hip', cx: 155, cy: 280 },
  { id: 'r-hip', label: 'Sağ Kalça', labelEn: 'R Hip', cx: 220, cy: 280 },
  { id: 'l-thigh', label: 'Sol Uyluk', labelEn: 'L Thigh', cx: 158, cy: 340 },
  { id: 'r-thigh', label: 'Sağ Uyluk', labelEn: 'R Thigh', cx: 217, cy: 340 },
  { id: 'l-knee', label: 'Sol Diz', labelEn: 'L Knee', cx: 160, cy: 400 },
  { id: 'r-knee', label: 'Sağ Diz', labelEn: 'R Knee', cx: 215, cy: 400 },
  { id: 'l-shin', label: 'Sol Baldır', labelEn: 'L Shin', cx: 162, cy: 460 },
  { id: 'r-shin', label: 'Sağ Baldır', labelEn: 'R Shin', cx: 213, cy: 460 },
  { id: 'l-ankle', label: 'Sol Ayak Bileği', labelEn: 'L Ankle', cx: 163, cy: 520 },
  { id: 'r-ankle', label: 'Sağ Ayak Bileği', labelEn: 'R Ankle', cx: 212, cy: 520 },
  { id: 'l-foot', label: 'Sol Ayak', labelEn: 'L Foot', cx: 160, cy: 555 },
  { id: 'r-foot', label: 'Sağ Ayak', labelEn: 'R Foot', cx: 215, cy: 555 },
];

export default function PainMapWidget() {
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const painPoints = useStore((s) => s.painPoints);
  const addPainPoint = useStore((s) => s.addPainPoint);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';
  const isPatient = userRole === 'patient';

  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<typeof BODY_REGIONS[0] | null>(null);
  const [intensity, setIntensity] = useState(3);

  const effectivePatientId = loggedInPatientId || '';
  const myPoints = painPoints.filter((p) => p.patientId === effectivePatientId);
  const intensityLabels = tr ? INTENSITY_LABELS_TR : INTENSITY_LABELS_EN;

  const handleRegionClick = (region: typeof BODY_REGIONS[0]) => {
    if (!isPatient) return;
    setSelectedRegion(region);
    setIntensity(3);
  };

  const confirmAdd = () => {
    if (!selectedRegion) return;
    // Convert to % for storage
    addPainPoint({
      id: `pp-${Date.now()}`,
      patientId: effectivePatientId,
      date: new Date().toISOString(),
      x: Math.round(selectedRegion.cx / 3.75),
      y: Math.round(selectedRegion.cy / 5.7),
      intensity,
      label: selectedRegion.label,
    });
    setSelectedRegion(null);
    showToast(tr ? 'Ağrı noktası eklendi' : 'Pain point added');
  };

  return (
    <Card className="p-0 overflow-visible">
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
            <MapPin className="h-4 w-4 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-main">{tr ? 'Ağrı Haritası' : 'Pain Map'}</h3>
            <p className="text-[11px] text-text-secondary">
              {isPatient ? (tr ? 'Ağrıyan bölgeye tıklayın' : 'Click painful area') : (tr ? 'Hastanın ağrı noktaları' : "Patient's pain points")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative px-2 pb-1">
        <svg viewBox="0 0 375 575" className="w-full" style={{ maxHeight: '460px' }}>
          <defs>
            <radialGradient id="skinFill" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="var(--color-text-main)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--color-text-main)" stopOpacity="0.03" />
            </radialGradient>
          </defs>

          {/* ===== ANATOMICAL HUMAN FIGURE ===== */}

          {/* Head - oval with slight jaw taper */}
          <path d="M187.5 8 C206 8, 218 20, 218 38 C218 50, 214 58, 208 64 C204 68, 196 72, 187.5 72 C179 72, 171 68, 167 64 C161 58, 157 50, 157 38 C157 20, 169 8, 187.5 8 Z"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.8" strokeOpacity="0.4" />

          {/* Neck */}
          <path d="M177 72 C177 76, 175 82, 174 88 L201 88 C200 82, 198 76, 198 72"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.6" strokeOpacity="0.3" />

          {/* Trapezius / Shoulders */}
          <path d="M174 88 C162 90, 145 96, 132 104 C125 108, 118 114, 116 120
                   L259 120 C257 114, 250 108, 243 104 C230 96, 213 90, 201 88"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.7" strokeOpacity="0.35" />

          {/* Torso - athletic / normal build */}
          <path d="M132 120 C128 130, 127 142, 128 155 C129 170, 131 185, 133 200
                   C135 215, 138 230, 140 245 C142 255, 144 262, 148 270
                   L227 270 C231 262, 233 255, 235 245
                   C237 230, 240 215, 242 200 C244 185, 246 170, 247 155
                   C248 142, 247 130, 243 120 Z"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.8" strokeOpacity="0.35" />

          {/* Chest definition lines */}
          <path d="M157 130 C167 138, 180 140, 187.5 139 C195 140, 208 138, 218 130"
                fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.4" strokeOpacity="0.15" />
          {/* Center line */}
          <line x1="187.5" y1="95" x2="187.5" y2="270" stroke="var(--color-text-secondary)" strokeWidth="0.3" strokeOpacity="0.1" />
          {/* Waist hint */}
          <path d="M140 238 Q187.5 232, 235 238" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.3" strokeOpacity="0.12" />
          {/* Navel */}
          <ellipse cx="187.5" cy="210" rx="2.5" ry="3.5" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.3" strokeOpacity="0.15" />

          {/* Left arm */}
          <path d="M132 120 C124 124, 118 132, 114 144
                   C110 158, 107 174, 104 190
                   C101 206, 98 222, 94 238
                   C91 250, 88 260, 84 272
                   L78 288 C76 294, 74 298, 73 302
                   C72 308, 76 310, 79 308
                   C82 305, 84 298, 86 290
                   L92 272 C95 260, 98 248, 101 234"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.7" strokeOpacity="0.35" />

          {/* Left hand */}
          <path d="M78 288 L74 296 C72 302, 68 308, 66 312 C64 316, 66 318, 68 316
                   L72 310 L70 316 C68 320, 70 322, 72 320 L76 312
                   L75 318 C74 322, 76 323, 78 320 L80 312
                   L80 316 C80 320, 82 320, 83 317 L84 308
                   L86 290"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Right arm */}
          <path d="M243 120 C251 124, 257 132, 261 144
                   C265 158, 268 174, 271 190
                   C274 206, 277 222, 281 238
                   C284 250, 287 260, 291 272
                   L297 288 C299 294, 301 298, 302 302
                   C303 308, 299 310, 296 308
                   C293 305, 291 298, 289 290
                   L283 272 C280 260, 277 248, 274 234"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.7" strokeOpacity="0.35" />

          {/* Right hand */}
          <path d="M297 288 L301 296 C303 302, 307 308, 309 312 C311 316, 309 318, 307 316
                   L303 310 L305 316 C307 320, 305 322, 303 320 L299 312
                   L300 318 C301 322, 299 323, 297 320 L295 312
                   L295 316 C295 320, 293 320, 292 317 L291 308
                   L289 290"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Pelvis area */}
          <path d="M148 270 C150 278, 152 284, 155 290 C158 295, 162 298, 168 300
                   L187.5 302 L207 300 C213 298, 217 295, 220 290
                   C223 284, 225 278, 227 270"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.6" strokeOpacity="0.3" />

          {/* Left leg */}
          <path d="M155 290 C153 305, 152 320, 152 335
                   C152 355, 153 370, 155 385
                   C156 395, 158 405, 159 415
                   C160 430, 161 445, 162 460
                   C163 475, 163 490, 163 505
                   C163 515, 163 522, 163 530"
                fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeOpacity="0.2" />
          <path d="M168 300 C172 310, 175 320, 176 332
                   C177 348, 176 362, 174 376
                   C172 390, 171 400, 170 412
                   C169 428, 168 444, 168 458
                   C168 475, 167 492, 167 505
                   C167 515, 166 525, 166 530
                   L163 530 L158 540 C155 550, 150 556, 145 558
                   C140 560, 140 558, 142 555
                   C146 550, 150 544, 155 536
                   L160 525 C160 510, 160 495, 159 478
                   C158 460, 156 440, 155 420
                   C153 400, 151 380, 150 360
                   C149 340, 148 320, 148 302
                   L155 290"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.7" strokeOpacity="0.35" />

          {/* Left knee cap hint */}
          <ellipse cx="161" cy="400" rx="8" ry="11" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.3" strokeOpacity="0.12" />

          {/* Right leg */}
          <path d="M207 300 C203 310, 200 320, 199 332
                   C198 348, 199 362, 201 376
                   C203 390, 204 400, 205 412
                   C206 428, 207 444, 207 458
                   C207 475, 208 492, 208 505
                   C208 515, 209 525, 209 530
                   L212 530 L217 540 C220 550, 225 556, 230 558
                   C235 560, 235 558, 233 555
                   C229 550, 225 544, 220 536
                   L215 525 C215 510, 215 495, 216 478
                   C217 460, 219 440, 220 420
                   C222 400, 224 380, 225 360
                   C226 340, 227 320, 227 302
                   L220 290"
                fill="url(#skinFill)" stroke="var(--color-text-secondary)" strokeWidth="0.7" strokeOpacity="0.35" />

          {/* Right knee cap hint */}
          <ellipse cx="214" cy="400" rx="8" ry="11" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.3" strokeOpacity="0.12" />

          {/* ===== CLICKABLE REGION OVERLAYS ===== */}
          {BODY_REGIONS.map((region) => {
            const existingPoint = myPoints.find(p => p.label === region.label);
            const isHovered = hoveredRegion === region.id;
            const isSelected = selectedRegion?.id === region.id;
            const rw = region.id.includes('hand') || region.id.includes('foot') || region.id.includes('ankle') ? 16 : region.id.includes('knee') ? 14 : 22;
            const rh = region.id.includes('thigh') || region.id.includes('shin') ? 30 : region.id.includes('arm') ? 25 : 18;

            return (
              <g key={region.id}>
                <ellipse
                  cx={region.cx} cy={region.cy} rx={rw} ry={rh}
                  fill={
                    isSelected ? 'rgba(231,76,60,0.2)'
                    : isHovered && isPatient ? 'rgba(47,128,237,0.12)'
                    : 'transparent'
                  }
                  stroke={
                    isSelected ? '#E74C3C'
                    : isHovered && isPatient ? 'rgba(47,128,237,0.35)'
                    : 'transparent'
                  }
                  strokeWidth="1"
                  strokeDasharray={isHovered && !isSelected ? '3 3' : 'none'}
                  className={isPatient ? 'cursor-pointer' : 'cursor-default'}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick(region)}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {existingPoint && (
                  <g>
                    <circle cx={region.cx} cy={region.cy} r="10"
                      fill={INTENSITY_COLORS[existingPoint.intensity - 1]} fillOpacity="0.2" />
                    <circle cx={region.cx} cy={region.cy} r="7"
                      fill={INTENSITY_COLORS[existingPoint.intensity - 1]} stroke="white" strokeWidth="1.5" />
                    <text x={region.cx} y={region.cy + 2.5}
                      textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">
                      {existingPoint.intensity}
                    </text>
                  </g>
                )}

                {isHovered && isPatient && (
                  <text x={region.cx} y={region.cy - rh - 4}
                    textAnchor="middle" fontSize="9" fill="var(--color-primary)" fontWeight="600">
                    {tr ? region.label : region.labelEn}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Intensity picker */}
      {selectedRegion && isPatient && (
        <div className="mx-4 mb-4 p-3 rounded-xl border border-danger/20 bg-danger/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
              <p className="text-xs font-semibold text-text-main">{tr ? selectedRegion.label : selectedRegion.labelEn}</p>
            </div>
            <button onClick={() => setSelectedRegion(null)} className="text-text-secondary hover:text-text-main">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setIntensity(v)}
                className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-2 border-2 transition-all ${
                  intensity === v ? 'scale-105 shadow-sm' : 'border-transparent opacity-40 hover:opacity-70'
                }`}
                style={{
                  borderColor: intensity === v ? INTENSITY_COLORS[v - 1] : undefined,
                  backgroundColor: intensity === v ? `${INTENSITY_COLORS[v - 1]}12` : undefined,
                }}
              >
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: INTENSITY_COLORS[v - 1] }}>{v}</div>
                <span className="text-[8px] text-text-secondary">{intensityLabels[v - 1]}</span>
              </button>
            ))}
          </div>
          <button onClick={confirmAdd} className="w-full rounded-lg bg-danger py-2.5 text-xs font-semibold text-white hover:bg-danger/90 transition-colors">
            {tr ? 'Kaydet' : 'Save'}
          </button>
        </div>
      )}

      {!selectedRegion && (
        <div className="px-5 pb-4 flex items-center justify-center gap-2">
          {INTENSITY_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-[9px] text-text-secondary">{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
