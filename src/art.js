// 도토리 등급별 팔레트 (index 0 = tier 1)
const PAL = [
  { body: '#B8D86B', body2: '#7FB041', cap: '#4E8F3A', cap2: '#3A7030' },
  { body: '#FFC857', body2: '#FF9F1C', cap: '#E8590C', cap2: '#B3430A' },
  { body: '#7DD8F5', body2: '#3FA7E0', cap: '#2563A8', cap2: '#1B4A82' },
  { body: '#E6EAF2', body2: '#A9B4C8', cap: '#7B879E', cap2: '#5E6A82' },
  { body: '#FFD95A', body2: '#E4A317', cap: '#B97A0C', cap2: '#8F5A06' },
  { body: '#FF6B8B', body2: '#C41E4F', cap: '#8F1239', cap2: '#6A0C2A' },
  { body: 'url(#rb)', body2: '', cap: '#6D3FD0', cap2: '#4B27A0' },
];

export const MAX_TIER = PAL.length;

export function acornSVG(tier, uid = '') {
  const p = PAL[tier - 1];
  const id = `g${tier}${uid}`;
  const rainbow = tier === 7;
  const bodyFill = rainbow ? `url(#rb${id})` : `url(#b${id})`;
  const defs = `<defs>
    <linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.body}"/><stop offset="1" stop-color="${p.body2 || p.body}"/></linearGradient>
    <linearGradient id="rb${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7aa8"/><stop offset=".35" stop-color="#ffd86b"/><stop offset=".65" stop-color="#6bf0c0"/><stop offset="1" stop-color="#6b9bff"/></linearGradient>
    <linearGradient id="c${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.cap}"/><stop offset="1" stop-color="${p.cap2}"/></linearGradient>
  </defs>`;
  const glow = tier >= 4 ? `<circle cx="32" cy="34" r="29" fill="${rainbow ? '#c4a8ff' : p.body}" opacity=".22"/>` : '';
  const sparkle = tier >= 5
    ? `<path d="M52 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" opacity=".95"/>${tier >= 6 ? '<path d="M10 22l1.5 3.5 3.5 1.5-3.5 1.5L10 32l-1.5-3.5L5 27l3.5-1.5z" fill="#fff" opacity=".9"/>' : ''}`
    : '';
  const leaf = tier === 1 ? '<path d="M33 14c2-8 10-10 15-7-1 7-8 10-15 7z" fill="#5FBF4A" stroke="#3B8A33" stroke-width="1.2"/>' : '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${glow}
    <path d="M32 61c-3 0-4-3-6-6C16 50 12 41 12 33h40c0 8-4 17-14 22-2 3-3 6-6 6z" fill="${bodyFill}" stroke="${p.cap2}" stroke-width="1.6" stroke-linejoin="round"/>
    <ellipse cx="22" cy="42" rx="3.2" ry="7" fill="#fff" opacity=".35" transform="rotate(14 22 42)"/>
    <rect x="30.5" y="8" width="3" height="9" rx="1.5" fill="${p.cap2}"/>
    <path d="M7 34c0-13 11-20 25-20s25 7 25 20c0 3-3 4-6 4H13c-3 0-6-1-6-4z" fill="url(#c${id})" stroke="${p.cap2}" stroke-width="1.6" stroke-linejoin="round"/>
    <g stroke="#fff" stroke-opacity=".18" stroke-width="1.4" fill="none"><path d="M16 24l8 6M26 20l8 8M38 20l8 8M12 31l6 5M46 24l5 6"/></g>
    <path d="M14 27c3-6 9-9 15-9" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <circle cx="25" cy="46" r="1.8" fill="#3a2414"/><circle cx="39" cy="46" r="1.8" fill="#3a2414"/>
    <path d="M28.5 50c1.6 1.6 5.4 1.6 7 0" stroke="#3a2414" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <circle cx="21" cy="50" r="2.2" fill="#ff8a9a" opacity=".55"/><circle cx="43" cy="50" r="2.2" fill="#ff8a9a" opacity=".55"/>
    ${leaf}${sparkle}</svg>`;
}

export function squirrelSVG() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="sq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8955A"/><stop offset="1" stop-color="#C46A2E"/></linearGradient></defs>
  <g class="sq-tail"><path d="M30 104C2 96-2 52 22 34c10-8 22 0 14 12-10 14-4 28 10 34z" fill="url(#sq)" stroke="#8F4A1E" stroke-width="2.5"/>
  <path d="M14 56c2-8 6-14 12-18" stroke="#FFD8B0" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/></g>
  <ellipse cx="68" cy="92" rx="30" ry="22" fill="url(#sq)" stroke="#8F4A1E" stroke-width="2.5"/>
  <ellipse cx="72" cy="98" rx="17" ry="13" fill="#FFE9CF"/>
  <path d="M46 50l-4-22 18 12z" fill="#C46A2E" stroke="#8F4A1E" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M88 50l4-22-18 12z" fill="#C46A2E" stroke="#8F4A1E" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="67" cy="62" rx="27" ry="24" fill="url(#sq)" stroke="#8F4A1E" stroke-width="2.5"/>
  <ellipse cx="67" cy="72" rx="16" ry="11" fill="#FFE9CF"/>
  <g class="sq-eyes"><circle cx="56" cy="60" r="4.2" fill="#2b1608"/><circle cx="78" cy="60" r="4.2" fill="#2b1608"/>
  <circle cx="57.4" cy="58.6" r="1.4" fill="#fff"/><circle cx="79.4" cy="58.6" r="1.4" fill="#fff"/></g>
  <ellipse cx="67" cy="68" rx="3.4" ry="2.6" fill="#5b2d12"/>
  <path d="M61 73c3 3 9 3 12 0" stroke="#5b2d12" stroke-width="2" stroke-linecap="round" fill="none"/>
  <rect x="64" y="73" width="3" height="5" rx="1" fill="#fff" stroke="#5b2d12" stroke-width="1"/><rect x="67.5" y="73" width="3" height="5" rx="1" fill="#fff" stroke="#5b2d12" stroke-width="1"/>
  <circle cx="48" cy="69" r="4" fill="#ff8a9a" opacity=".6"/><circle cx="86" cy="69" r="4" fill="#ff8a9a" opacity=".6"/>
  <g transform="translate(60 84) scale(.42)"><path d="M32 61c-3 0-4-3-6-6C16 50 12 41 12 33h40c0 8-4 17-14 22-2 3-3 6-6 6z" fill="#E0A060" stroke="#6B3F22" stroke-width="3"/><path d="M7 34c0-13 11-20 25-20s25 7 25 20c0 3-3 4-6 4H13c-3 0-6-1-6-4z" fill="#8A5530" stroke="#6B3F22" stroke-width="3"/></g>
  <ellipse cx="52" cy="92" rx="8" ry="6" fill="#C46A2E" stroke="#8F4A1E" stroke-width="2"/><ellipse cx="86" cy="92" rx="8" ry="6" fill="#C46A2E" stroke="#8F4A1E" stroke-width="2"/>
  </svg>`;
}
