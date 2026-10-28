const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'blackhole.js');
let code = fs.readFileSync(target, 'utf8');

// 1. time: 60 -> time: 30 in initial stage
code = code.replace('time: 60,', 'time: 30,');

// 2. time: 60 -> time: 30 in reset()
code = code.replace(/time:\s*60,/, 'time: 30,');

// 3. growth rate in updatePhysics
const oldGrowth = `// 블랙홀 성장 (점진적 반경 증가)\n          h.r += Math.max(0.6, (item.radius / h.r) * 1.8);`;
const newGrowth = `// 블랙홀 성장 (점진적 반경 증가, 최대 160 반경으로 화면 전체를 덮지 않고 밸런스 유지)\n          const growth = Math.max(0.3, (item.radius / h.r) * 0.9);\n          h.r = Math.min(160, h.r + growth);`;

if (code.includes('h.r += Math.max(0.6, (item.radius / h.r) * 1.8);')) {
  code = code.replace('h.r += Math.max(0.6, (item.radius / h.r) * 1.8);', `const growth = Math.max(0.3, (item.radius / h.r) * 0.9);\n          h.r = Math.min(160, h.r + growth);`);
} else {
  console.log('Growth line not found directly, checking...');
}

// 4. attach function handling
code = code.replace(
  'if (stage.items.length === 0) reset();',
  'if (stage.items.length === 0 || stage.over || stage.time <= 0) reset();\n  else startTimer();'
);

fs.writeFileSync(target, code, 'utf8');
console.log('blackhole.js updated successfully!');
