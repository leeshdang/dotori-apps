const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'generate-i18n.cjs');
let txt = fs.readFileSync(file, 'utf8');

const koDwe = `    gameWeaponEvo: '무기 진화 2048', dweName: 'Dotori Weapon 2048',
    dweScore: '점수', dweBest: '최고', dweMax: '최고 무기', dweCodex: '무기 도감', dweUndo: '되돌리기',
    dweGameOver: '더 이상 합칠 무기가 없습니다!',
    dweHow: '상하좌우 스와이프나 방향키로 타일을 밀어 같은 무기를 합치세요!\\n나무 단검(2)부터 전설의 도토리 신검(2048)과 우주 창조의 검(4096)까지 진화시키세요.\\n위기 시 되돌리기(Undo)로 한 수를 취소할 수 있습니다.',
    dweGuideTitle: '무기 진화 계통도',
    dweGuide: [
      '🪵 같은 무기 2개가 부딪치면 다음 등급 무기로 진화합니다',
      '⚔️ 숫자가 커질수록 공격력과 무기 이펙트가 화려해집니다',
      '🐿️ 2048 달성 시 [도토리 전설신검]이 최종 강림합니다',
      '↩️ 한 번의 실수는 [되돌리기] 버튼으로 만회할 수 있습니다'
    ],
    dweAboutDesc: '숫자와 RPG 무기가 결합된 2048 진화 퍼즐입니다.\\n나무 단검부터 전설의 신검까지 모든 무기 도감을 수집해 보세요!',
  },`;

const enDwe = `    gameWeaponEvo: 'Weapon 2048', dweName: 'Dotori Weapon 2048',
    dweScore: 'Score', dweBest: 'Best', dweMax: 'Top Weapon', dweCodex: 'Codex', dweUndo: 'Undo',
    dweGameOver: 'No more moves possible!',
    dweHow: 'Swipe or press arrow keys to slide tiles and merge matching weapons!\\nEvolve from Wooden Dagger (2) up to Dotori Godsword (2048) and Cosmic Origin (4096).\\nUse Undo to recover from a critical mistake.',
    dweGuideTitle: 'Weapon Evolution Tree',
    dweGuide: [
      '🪵 Merge 2 identical weapons to forge the next tier',
      '⚔️ Higher tiers gain greater attack power and visual effects',
      '🐿️ Reach 2048 to unlock the legendary [Dotori Godsword]',
      '↩️ Use the Undo button to rewind one tricky move'
    ],
    dweAboutDesc: 'A weapon-forging 2048 evolution puzzle: merge swords to collect all legendary weapons in your codex!',
  },`;

const jaDwe = `    gameWeaponEvo: '武器進化2048', dweName: 'Dotori Weapon 2048',
    dweScore: 'スコア', dweBest: 'ベスト', dweMax: '最高武器', dweCodex: '武器図鑑', dweUndo: '元に戻す',
    dweGameOver: 'これ以上動かせません！',
    dweHow: 'スワイプや矢印キーでタイルを滑らせ、同じ武器を合体させよう！\\n木の短剣(2)から伝説のどんぐり神剣(2048)、宇宙創造の剣(4096)まで進化！\\nピンチの時は「元に戻す(Undo)」で一手やり直せます。',
    dweGuideTitle: '武器進化の掟',
    dweGuide: [
      '🪵 同じ武器がぶつかると上位ランクの武器へ鍛造されます',
      '⚔️ ランクが上がるほど攻撃力とエフェクトが豪華になります',
      '🐿️ 2048達成で伝説の[どんぐり神剣]が覚醒！',
      '↩️ 一手前のミスは「元に戻す」ボタンでリカバリー可能'
    ],
    dweAboutDesc: '数字とRPG武器が融合した2048進化パズルです。全12種の武器図鑑コンプリートを目指そう！',
  },`;

const zhDwe = `    gameWeaponEvo: '武器进化2048', dweName: 'Dotori Weapon 2048',
    dweScore: '得分', dweBest: '最高', dweMax: '最高武器', dweCodex: '武器图鉴', dweUndo: '撤销',
    dweGameOver: '无法继续移动！',
    dweHow: '滑动或使用方向键推动方块，合并相同的武器！\\n从木短剑(2)一路合成至传说中的橡果神剑(2048)以及创世之剑(4096)。\\n危急时刻可使用撤销(Undo)挽回一步。',
    dweGuideTitle: '武器进化谱系',
    dweGuide: [
      '🪵 两把相同武器相撞将锻造出下一阶神兵',
      '⚔️ 等级越高，攻击力与华丽光效越强',
      '🐿️ 达成 2048 将降临终极[橡果传说神剑]',
      '↩️ 走错一步？点击撤销即可重来该步'
    ],
    dweAboutDesc: '数字与RPG神兵结合的2048进化拼图：收集全部神剑，点亮你的武器图鉴！',
  },`;

// Replace closing brace of ko
txt = txt.replace(/dbhAboutDesc: '화면에 쏟아지는 물건들을[\s\S]*?'[,\s]*\n\s*\},/, `dbhAboutDesc: '화면에 쏟아지는 물건들을 블랙홀로 청소하는 Hole.io 스타일의 흡수 정리 게임입니다.\\n작은 물건부터 삼키며 초거대 블랙홀로 성장하세요!',\n${koDwe}`);

// Replace closing brace of en
txt = txt.replace(/dbhAboutDesc: 'A Hole\.io inspired cleanup game[\s\S]*?'[,\s]*\n\s*\},/, `dbhAboutDesc: 'A Hole.io inspired cleanup game where you move a growing black hole to swallow falling clutter.\\nStart small and grow into a supermassive hole!',\n${enDwe}`);

// Replace closing brace of ja
txt = txt.replace(/dbhAboutDesc: '画面に降り注ぐ物をブラックホールで[\s\S]*?'[,\s]*\n\s*\},/, `dbhAboutDesc: '画面に降り注ぐ物をブラックホールで吸い尽くすHole.ioスタイルの整理ゲームです。\\n小さな物から飲み込み超巨大ブラックホールへ進化しよう！',\n${jaDwe}`);

// Replace closing brace of zh
txt = txt.replace(/dbhAboutDesc: '以黑洞吞噬掉落物品的Hole\.io风格整理游戏[\s\S]*?'[,\s]*\n\s*\},/, `dbhAboutDesc: '以黑洞吞噬掉落物品的Hole.io风格整理游戏。\\n从小物件开始吞噬，成长为超大黑洞！',\n${zhDwe}`);

fs.writeFileSync(file, txt, 'utf8');
console.log('generate-i18n.cjs updated with DWE strings!');
