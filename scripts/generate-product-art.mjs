// Generates KAJOK product SVG artwork into client/public/products/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../client/public/products');
fs.mkdirSync(OUT, { recursive: true });

const svg = (inner, c1, c2) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
  <radialGradient id="bg" cx="50%" cy="38%" r="80%">
    <stop offset="0%" stop-color="${c1}" stop-opacity="0.28"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </linearGradient>
</defs>
<rect width="600" height="600" fill="#F8F6FC"/>
<rect width="600" height="600" fill="url(#bg)"/>
<g transform="translate(300,270)">${inner}</g>
<text x="300" y="548" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="26" letter-spacing="6" fill="#32145F" fill-opacity="0.85">KAJOK</text>
</svg>`;

const G = {
  phone: c => `<rect x="-95" y="-185" width="190" height="370" rx="34" fill="url(#body)"/>
  <rect x="-82" y="-172" width="164" height="344" rx="24" fill="#191523"/>
  <rect x="-74" y="-164" width="148" height="300" rx="18" fill="${c}"/>
  <rect x="-40" y="-158" width="80" height="14" rx="7" fill="#191523"/>
  <circle cx="0" cy="152" r="6" fill="#ffffff" fill-opacity="0.7"/>`,
  tv: () => `<rect x="-185" y="-130" width="370" height="215" rx="10" fill="#191523"/>
  <rect x="-172" y="-117" width="344" height="189" rx="5" fill="url(#body)"/>
  <rect x="-60" y="85" width="120" height="14" fill="#191523"/>
  <rect x="-110" y="99" width="220" height="12" rx="6" fill="#191523"/>`,
  headphones: () => `<path d="M-140 60 v-30 a140 140 0 0 1 280 0 v30" fill="none" stroke="url(#body)" stroke-width="34" stroke-linecap="round"/>
  <rect x="-172" y="20" width="80" height="130" rx="26" fill="url(#body)"/>
  <rect x="92" y="20" width="80" height="130" rx="26" fill="url(#body)"/>
  <rect x="-158" y="38" width="52" height="94" rx="16" fill="#191523" fill-opacity="0.35"/>
  <rect x="106" y="38" width="52" height="94" rx="16" fill="#191523" fill-opacity="0.35"/>`,
  speaker: c => `<rect x="-95" y="-165" width="190" height="330" rx="34" fill="url(#body)"/>
  <circle cx="0" cy="55" r="62" fill="#191523"/><circle cx="0" cy="55" r="34" fill="${c}"/><circle cx="0" cy="55" r="12" fill="#191523"/>
  <circle cx="0" cy="-95" r="26" fill="#191523"/><circle cx="0" cy="-95" r="11" fill="${c}"/>`,
  laptop: () => `<rect x="-170" y="-120" width="340" height="210" rx="12" fill="#191523"/>
  <rect x="-158" y="-108" width="316" height="186" rx="6" fill="url(#body)"/>
  <path d="M-205 118 h410 l22 26 a10 10 0 0 1 -9 15 H-218 a10 10 0 0 1 -9 -15 Z" fill="#191523"/>`,
  monitor: () => `<rect x="-180" y="-140" width="360" height="225" rx="12" fill="#191523"/>
  <rect x="-168" y="-128" width="336" height="201" rx="6" fill="url(#body)"/>
  <rect x="-14" y="85" width="28" height="60" fill="#191523"/>
  <rect x="-90" y="143" width="180" height="12" rx="6" fill="#191523"/>`,
  tshirt: c => `<path d="M-95 -120 L-185 -70 L-140 25 L-105 -5 L-105 160 L105 160 L105 -5 L140 25 L185 -70 L95 -120 Q0 -70 -95 -120 Z" fill="url(#body)"/>
  <path d="M-95 -120 Q0 -70 95 -120 Q0 -35 -95 -120 Z" fill="${c}" fill-opacity="0.55"/>`,
  shoe: c => `<path d="M-180 90 Q-185 -20 -60 -30 L30 40 Q140 55 190 90 Q195 125 150 125 L-135 125 Q-182 125 -180 90 Z" fill="url(#body)"/>
  <path d="M-175 96 h360" stroke="#ffffff" stroke-width="10" stroke-opacity="0.8"/>
  <path d="M-60 -28 L-15 12 M-15 -28 L30 12 M30 -28 L75 12" stroke="#191523" stroke-opacity="0.35" stroke-width="8" fill="none"/>`,
  watch: c => `<rect x="-52" y="-190" width="104" height="120" rx="16" fill="url(#body)"/>
  <rect x="-52" y="70" width="104" height="120" rx="16" fill="url(#body)"/>
  <rect x="-98" y="-80" width="196" height="160" rx="46" fill="#191523"/>
  <rect x="-84" y="-66" width="168" height="132" rx="36" fill="${c}"/>
  <text x="0" y="12" text-anchor="middle" font-family="Arial" font-weight="700" font-size="44" fill="#ffffff">10:09</text>`,
  washer: c => `<rect x="-150" y="-180" width="300" height="360" rx="18" fill="url(#body)"/>
  <rect x="-150" y="-180" width="300" height="64" rx="18" fill="#ffffff" fill-opacity="0.22"/>
  <circle cx="-110" cy="-148" r="11" fill="#191523"/><circle cx="-70" cy="-148" r="11" fill="#191523"/>
  <circle cx="20" cy="20" r="92" fill="#191523"/><circle cx="20" cy="20" r="68" fill="${c}"/><circle cx="20" cy="20" r="40" fill="#F8F6FC" fill-opacity="0.85"/>`,
  blender: () => `<path d="M-70 -170 L70 -170 L45 20 L-45 20 Z" fill="url(#body)"/>
  <path d="M-78 -190 L78 -190 L78 -162 L-78 -162 Z" fill="#191523"/>
  <rect x="-95" y="20" width="190" height="26" rx="10" fill="#191523"/>
  <rect x="-78" y="46" width="156" height="110" rx="16" fill="#191523"/>
  <circle cx="0" cy="101" r="18" fill="url(#body)"/>`,
  bottle: () => `<rect x="-30" y="-190" width="60" height="46" rx="8" fill="#191523"/>
  <rect x="-14" y="-152" width="28" height="26" fill="#191523"/>
  <path d="M-80 -126 L80 -126 L95 40 Q95 160 0 160 Q-95 160 -95 40 Z" fill="url(#body)"/>
  <path d="M-80 -126 L80 -126 L83 -60 L-83 -60 Z" fill="#ffffff" fill-opacity="0.25"/>`,
  dryer: c => `<rect x="-160" y="-120" width="320" height="240" rx="48" fill="url(#body)"/>
  <rect x="-115" y="60" width="34" height="70" rx="14" fill="#191523"/>
  <circle cx="60" cy="0" r="78" fill="#191523"/><circle cx="60" cy="0" r="52" fill="${c}"/><circle cx="60" cy="0" r="20" fill="#191523"/>`,
  ball: () => `<circle cx="0" cy="0" r="150" fill="url(#body)"/>
  <polygon points="0,-52 49,-16 30,45 -30,45 -49,-16" fill="#191523"/>
  <path d="M0 -52 L0 -150 M49 -16 L142 -46 M30 45 L88 128 M-30 45 L-88 128 M-49 -16 L-142 -46" stroke="#191523" stroke-width="14"/>`,
  dumbbell: () => `<rect x="-30" y="-24" width="220" height="48" rx="10" fill="#191523"/>
  <rect x="-180" y="-70" width="52" height="140" rx="12" fill="url(#body)"/>
  <rect x="-122" y="-52" width="40" height="104" rx="10" fill="url(#body)"/>
  <rect x="190" y="-70" width="52" height="140" rx="12" fill="url(#body)" transform="translate(-62,0)"/>
  <rect x="128" y="-52" width="40" height="104" rx="10" fill="url(#body)"/>`,
  gamepad: () => `<path d="M-160 -60 Q-190 -60 -195 60 Q-198 150 -120 150 Q-60 150 -40 80 L40 80 Q60 150 120 150 Q198 150 195 60 Q190 -60 160 -60 Z" fill="url(#body)"/>
  <circle cx="105" cy="10" r="14" fill="#ffffff"/><circle cx="150" cy="-35" r="14" fill="#ffffff"/>
  <rect x="-150" y="-12" width="70" height="20" rx="6" fill="#191523"/><rect x="-125" y="-37" width="20" height="70" rx="6" fill="#191523"/>`,
  lego: c => `<rect x="-160" y="-60" width="320" height="150" rx="14" fill="url(#body)"/>
  ${[-110, -37, 37, 110].map(x => `<circle cx="${x}" cy="-78" r="22" fill="url(#body)" stroke="${c}" stroke-opacity="0.4" stroke-width="4"/>`).join('')}
  <path d="M-160 30 L-60 -60 L40 30 L160 -60" stroke="#ffffff" stroke-opacity="0.3" stroke-width="18" fill="none"/>`,
  jacket: c => `<path d="M-100 -125 L-195 -70 L-150 60 L-110 25 L-110 165 L110 165 L110 25 L150 60 L195 -70 L100 -125 Q0 -75 -100 -125 Z" fill="url(#body)"/>
  <path d="M0 -102 L0 165" stroke="${c}" stroke-width="8" stroke-opacity="0.7"/>
  <path d="M-30 -100 L0 -62 L30 -100" fill="none" stroke="#191523" stroke-width="10"/>`,
};

const items = [
  ['phone-s25', 'phone', '#7C6CF0', '#32145F'], ['phone-ip16', 'phone', '#8E9BAE', '#191523'],
  ['phone-redmi', 'phone', '#38BDF8', '#6C3BCE'], ['phone-ip16b', 'phone', '#A78BFA', '#4C1D95'],
  ['tv-sony', 'tv', '#A78BFA', '#32145F'], ['headphones-xm5', 'headphones', '#6C3BCE', '#191523'],
  ['speaker-jbl', 'speaker', '#FF6B35', '#C2410C'], ['laptop-ip5', 'laptop', '#64748B', '#0F172A'],
  ['laptop-x1', 'laptop', '#94A3B8', '#1E293B'], ['monitor-lg', 'monitor', '#F43F5E', '#881337'],
  ['tshirt-black', 'tshirt', '#3F3F46', '#09090B'], ['jacket-navy', 'jacket', '#1E3A5F', '#0F1B2D'],
  ['shoe-am270', 'shoe', '#E2E8F0', '#64748B'], ['shoe-ub5', 'shoe', '#F97316', '#7C2D12'],
  ['watch-gw7', 'watch', '#6C3BCE', '#32145F'], ['watch-aw10', 'watch', '#A8B2C1', '#3F4756'],
  ['washer-lg', 'washer', '#C084FC', '#581C87'], ['blender-ph', 'blender', '#60A5FA', '#1E3A8A'],
  ['perfume', 'bottle', '#F9A8D4', '#9D174D'], ['dryer', 'dryer', '#FDA4AF', '#9F1239'],
  ['ball', 'ball', '#F8FAFC', '#CBD5E1'], ['dumbbell', 'dumbbell', '#6C3BCE', '#32145F'],
  ['gamepad', 'gamepad', '#E2E8F0', '#94A3B8'], ['lego', 'lego', '#FBBF24', '#B45309'], ['phone-ip16b2', 'phone', '#A78BFA', '#4C1D95'],
];

for (const [name, glyph, c1, c2] of items) {
  const inner = (G[glyph] || G.phone)(c1);
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg(inner, c1, c2));
}
console.log('generated', fs.readdirSync(OUT).length, 'product SVGs in', OUT);
