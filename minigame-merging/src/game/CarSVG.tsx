import React from 'react';
import { CAR_PROPERTIES } from './types';

interface CarSVGProps {
  level: number;
  size?: number;
  shadow?: boolean;
}

// Shared wheel component
function Wheel({ cx, cy, r = 10 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />
      <circle cx={cx} cy={cy} r={r * 0.65} fill="#2a2a40" />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#888" />
      {[0, 60, 120, 180, 240, 300].map(angle => (
        <line
          key={angle}
          x1={cx} y1={cy}
          x2={cx + Math.cos((angle * Math.PI) / 180) * r * 0.6}
          y2={cy + Math.sin((angle * Math.PI) / 180) * r * 0.6}
          stroke="#666" strokeWidth="1.5"
        />
      ))}
    </g>
  );
}

// Sports car body (levels 1, 3, 14)
function SportsCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* body */}
      <path d="M10,52 L20,30 L42,22 L78,22 L90,30 L100,52 Z" fill={p} />
      {/* roof */}
      <path d="M28,30 L42,18 L72,18 L82,30 Z" fill={a} opacity="0.9" />
      {/* windshield */}
      <path d="M32,30 L43,20 L70,20 L80,30 Z" fill="#88ccff" opacity="0.6" />
      {/* hood scoop */}
      <ellipse cx={55} cy={37} rx={12} ry={4} fill={a} opacity="0.7" />
      {/* side stripe */}
      <path d="M20,44 L90,44" stroke={a} strokeWidth="2" opacity="0.5" />
      {/* headlight */}
      <ellipse cx={93} cy={42} rx={5} ry={3} fill="#ffe8a0" opacity="0.9" />
      <ellipse cx={93} cy={42} rx={3} ry={2} fill="#fff" />
      {/* taillight */}
      <ellipse cx={12} cy={44} rx={4} ry={2.5} fill="#ff4444" opacity="0.9" />
      {/* exhaust */}
      <rect x={14} y={50} width={6} height={3} rx={1} fill="#555" />
      <Wheel cx={28} cy={54} r={10} />
      <Wheel cx={82} cy={54} r={10} />
    </g>
  );
}

// Muscle car (levels 4, 5, 12)
function MuscleCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* body — wider, lower */}
      <path d="M8,52 L14,34 L34,24 L76,24 L96,34 L102,52 Z" fill={p} />
      {/* cabin */}
      <path d="M26,34 L36,22 L74,22 L80,34 Z" fill={a} opacity="0.85" />
      {/* windshield */}
      <path d="M30,34 L38,23 L72,23 L78,34 Z" fill="#aadeee" opacity="0.55" />
      {/* hood vents */}
      {[44, 54, 64].map(x => (
        <rect key={x} x={x} y={30} width={6} height={3} rx={1} fill="#000" opacity="0.5" />
      ))}
      {/* racing stripe */}
      <rect x={50} y={24} width={10} height={28} fill={a} opacity="0.25" />
      {/* headlight */}
      <rect x={94} y={37} width={8} height={5} rx={2} fill="#ffe8a0" opacity="0.9" />
      {/* taillight */}
      <rect x={8} y={37} width={7} height={5} rx={2} fill="#ff4444" opacity="0.9" />
      {/* exhaust pipes */}
      <rect x={10} y={49} width={7} height={4} rx={2} fill="#666" />
      <rect x={10} y={55} width={7} height={4} rx={2} fill="#666" />
      <Wheel cx={30} cy={55} r={11} />
      <Wheel cx={80} cy={55} r={11} />
    </g>
  );
}

// Formula / open-wheel (levels 8, 11, 16)
function FormulaCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* nose */}
      <path d="M90,44 L110,46 L90,50 Z" fill={p} />
      {/* main body */}
      <path d="M16,40 L90,36 L90,54 L16,54 Z" fill={p} />
      {/* cockpit fairing */}
      <path d="M30,40 L50,28 L68,28 L80,40 Z" fill={a} opacity="0.9" />
      {/* cockpit interior */}
      <ellipse cx={55} cy={36} rx={10} ry={6} fill="#1a1a2e" opacity="0.8" />
      {/* front wing */}
      <path d="M86,48 L112,44 L112,50 L86,54 Z" fill={a} opacity="0.8" />
      {/* rear wing */}
      <rect x={12} y={30} width={14} height={4} rx={1} fill={a} />
      <rect x={16} y={34} width={6} height={10} fill={a} opacity="0.7" />
      {/* sidepods */}
      <path d="M20,40 L16,36 L50,36 L50,40 Z" fill={a} opacity="0.5" />
      <path d="M20,54 L16,58 L50,58 L50,54 Z" fill={a} opacity="0.5" />
      {/* exhaust */}
      <rect x={14} y={42} width={5} height={3} rx={1} fill="#ff8800" opacity="0.9" />
      <Wheel cx={32} cy={60} r={9} />
      <Wheel cx={32} cy={34} r={9} />
      <Wheel cx={78} cy={60} r={9} />
      <Wheel cx={78} cy={34} r={9} />
    </g>
  );
}

// SUV (level 9)
function SUVCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* body */}
      <path d="M8,55 L12,28 L98,28 L102,55 Z" fill={p} />
      {/* roof */}
      <rect x={16} y={18} width={78} height={12} rx={3} fill={a} opacity="0.85" />
      {/* windshield */}
      <path d="M18,28 L22,18 L88,18 L92,28 Z" fill="#aadeee" opacity="0.55" />
      {/* side window */}
      <rect x={24} y={20} width={25} height={8} rx={2} fill="#aadeee" opacity="0.4" />
      <rect x={56} y={20} width={24} height={8} rx={2} fill="#aadeee" opacity="0.4" />
      {/* roof rack */}
      <rect x={22} y={16} width={66} height={3} rx={1} fill="#666" />
      {/* headlight */}
      <rect x={96} y={36} width={8} height={6} rx={2} fill="#ffe8a0" opacity="0.9" />
      {/* taillight */}
      <rect x={6} y={36} width={8} height={6} rx={2} fill="#ff4444" opacity="0.9" />
      {/* skid plate */}
      <rect x={10} y={53} width={90} height={4} rx={2} fill="#555" />
      <Wheel cx={28} cy={57} r={12} />
      <Wheel cx={82} cy={57} r={12} />
    </g>
  );
}

// Luxury sedan (levels 2, 6, 7, 13)
function LuxuryCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* body */}
      <path d="M10,52 L18,34 L40,24 L75,24 L92,34 L100,52 Z" fill={p} />
      {/* cabin */}
      <path d="M28,34 L40,20 L72,20 L82,34 Z" fill={a} opacity="0.85" />
      {/* windshield */}
      <path d="M32,34 L42,21 L70,21 L80,34 Z" fill="#aadeee" opacity="0.5" />
      {/* rear window */}
      <path d="M28,34 L38,22 L28,22 Z" fill="#aadeee" opacity="0.35" />
      {/* chrome strip */}
      <path d="M18,44 L92,44" stroke="#ccc" strokeWidth="1.5" opacity="0.6" />
      {/* door crease */}
      <path d="M20,38 L90,38" stroke={a} strokeWidth="1" opacity="0.4" />
      {/* headlight LED strip */}
      <path d="M90,36 L100,42" stroke="#ffe8a0" strokeWidth="2.5" opacity="0.9" />
      <ellipse cx={97} cy={40} rx={4} ry={2.5} fill="#ffe8a0" opacity="0.7" />
      {/* taillight */}
      <path d="M10,36 L18,42" stroke="#ff4444" strokeWidth="2" opacity="0.9" />
      <ellipse cx={13} cy={40} rx={4} ry={2.5} fill="#ff4444" opacity="0.7" />
      {/* exhaust */}
      <rect x={16} y={50} width={5} height={3} rx={1} fill="#777" />
      <Wheel cx={28} cy={55} r={11} />
      <Wheel cx={80} cy={55} r={11} />
    </g>
  );
}

// Concept / futuristic (levels 10, 15, 17)
function ConceptCar({ p, a }: { p: string; a: string }) {
  return (
    <g>
      {/* low aerodynamic body */}
      <path d="M6,50 L16,28 L50,20 L85,24 L104,40 L100,50 Z" fill={p} />
      {/* glass dome */}
      <path d="M24,28 L46,16 L76,18 L88,28 Z" fill={a} opacity="0.7" />
      <path d="M28,28 L48,18 L74,19 L84,28 Z" fill="#88eeff" opacity="0.5" />
      {/* underbody glow strip */}
      <path d="M14,50 L100,50" stroke={a} strokeWidth="2.5" opacity="0.7" />
      {/* active aero fin */}
      <path d="M12,50 L8,34 L14,34 L16,50 Z" fill={a} opacity="0.7" />
      {/* headlight matrix */}
      {[0, 1, 2].map(i => (
        <rect key={i} x={98} y={36 + i * 4} width={6} height={2.5} rx={1} fill="#fff" opacity={0.9 - i * 0.2} />
      ))}
      {/* taillight matrix */}
      {[0, 1, 2].map(i => (
        <rect key={i} x={6} y={36 + i * 4} width={6} height={2.5} rx={1} fill="#ff4444" opacity={0.9 - i * 0.2} />
      ))}
      {/* wheel arch cutouts */}
      <Wheel cx={28} cy={52} r={10} />
      <Wheel cx={84} cy={52} r={10} />
    </g>
  );
}

const BODY_COMPONENTS: Record<string, React.FC<{ p: string; a: string }>> = {
  sports: SportsCar,
  muscle: MuscleCar,
  formula: FormulaCar,
  suv: SUVCar,
  luxury: LuxuryCar,
  concept: ConceptCar,
};

export default function CarSVG({ level, size = 100, shadow = true }: CarSVGProps) {
  const props = CAR_PROPERTIES[level];
  if (!props) return null;

  const Body = BODY_COMPONENTS[props.bodyStyle];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: shadow ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' : undefined }}
    >
      {/* gloss highlight */}
      <defs>
        <linearGradient id={`gloss-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="50%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="black" stopOpacity="0.12" />
        </linearGradient>
        <filter id={`glow-${level}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <Body p={props.primaryColor} a={props.accentColor} />

      {/* gloss overlay */}
      <path
        d="M10,52 L20,30 L42,22 L78,22 L90,30 L100,52 Z"
        fill={`url(#gloss-${level})`}
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
}
