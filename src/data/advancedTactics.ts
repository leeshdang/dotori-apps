import { BoardState, Piece, TacticPuzzle } from '../types/janggi';
import { createEmptyBoard, getPieceLabel } from '../utils/janggiEngine';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

// Tactic 1: 멱 차단과 기물 포위술 (제1술)
function createT1Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1'); // Safe at palace bottom
  b[1][4] = p('han', 'king', 'h-k-1');
  b[3][4] = p('han', 'horse', 'h-m-1'); // Active center enemy horse
  b[5][4] = p('cho', 'soldier', 'c-s-1'); // Soldier ready to close forward myeok
  b[7][4] = p('cho', 'cannon', 'c-c-1');  // Cannon prepared to strike along column 4
  return b;
}

// Tactic 2: 양차 합세 작전 (兩車合勢 - 제2술)
function createT2Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[3][0] = p('han', 'soldier', 'h-s-1'); // Isolated enemy flank soldier
  b[3][3] = p('cho', 'chariot', 'c-r-1');  // Left chariot eyeing row 3
  b[7][0] = p('cho', 'chariot', 'c-r-2');  // Right chariot advancing up column 0
  return b;
}

// Tactic 3: 차의 절대 핀(Pin) 봉쇄술 (제3술)
function createT3Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[1][2] = p('han', 'horse', 'h-m-1'); // Enemy horse on 1st rank
  b[0][5] = p('han', 'guard', 'h-g-1');
  b[3][0] = p('cho', 'chariot', 'c-r-1'); // Chariot ready to seal 1st rank
  b[2][2] = p('cho', 'soldier', 'c-s-1'); // Soldier ready to advance and capture
  return b;
}

// Tactic 4: 상(象)의 길 열기 (포격 길목 개척술 - 제4술)
function createT4Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[3][2] = p('han', 'chariot', 'h-r-1');  // High value enemy chariot (13 pts)
  b[5][2] = p('cho', 'soldier', 'c-s-1');  // Screen/bridge on file 2
  b[7][2] = p('cho', 'elephant', 'c-e-1'); // Elephant blocking Cannon's sight
  b[8][2] = p('cho', 'cannon', 'c-c-1');   // Cannon behind waiting to strike
  return b;
}

// Tactic 5: 쌍포장(雙包將) 십자 포격 외통수 (제5술)
function createT5Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[0][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');    // Horizontal bridge on row 0
  b[0][5] = p('han', 'guard', 'h-g-2');    // Blocks King's escape to the right
  b[1][0] = p('cho', 'soldier', 'c-s-bridge'); // Vertical bridge on column 0
  b[2][0] = p('cho', 'cannon', 'c-c-horiz');   // Horizontal cannon ready to take row 0
  b[2][4] = p('cho', 'soldier', 'c-s-center'); // Controls (1,4) and serves as vertical bridge
  b[5][4] = p('cho', 'cannon', 'c-c-vert');    // Vertical cannon controlling column 4
  return b;
}

// Tactic 6: 마장·차장 양수겸장(兩手兼將) 외통수 (제6술)
function createT6Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[0][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');   // Blocks left escape
  b[0][5] = p('han', 'guard', 'h-g-2');   // Blocks right escape
  b[2][4] = p('cho', 'horse', 'c-h-1');   // Masking horse on column 4
  b[5][4] = p('cho', 'chariot', 'c-r-1'); // Chariot aiming down column 4
  return b;
}

export const ADVANCED_TACTICS: TacticPuzzle[] = [
  {
    id: 'tactic-1',
    title: '제1술: 멱 차단과 기물 포위술 (상대 말을 가두고 사냥하기)',
    level: '중급',
    category: '기물 사냥',
    summary: '중앙에서 날뛰는 상대 마(馬)의 앞 멱을 졸로 틀어막아 도약을 원천 봉쇄한 뒤, 그 졸을 다리 삼아 포로 사냥하는 교과서적 전술입니다.',
    strategicConcept: `장기에서 기물을 잡으려 할 때 무작정 쫓아가면 도망갑니다. 
진정한 고수는 먼저 '퇴로(멱)'를 닫아 상대가 갈 곳이 없게 만든 뒤 여유롭게 포획합니다.
마(5점)의 멱을 졸(2점)로 막으면 마는 한 발자국도 도약하지 못하고 갇히게 됩니다.`,
    initialBoard: createT1Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '중앙의 졸을 앞으로 한 칸 전진시켜 상대 마의 전진 멱을 차단하세요!',
        expectedMove: { from: { r: 5, c: 4 }, to: { r: 4, c: 4 } },
        opponentResponse: {
          from: { r: 1, c: 4 },
          to: { r: 1, c: 5 },
          commentary: '상대 마가 앞길이 막혀 꼼짝 못하자, 한나라 궁이 불안하여 한 칸 피합니다!',
        },
        explanation: '정확합니다! 마의 핵심 전진 멱이 졸로 막혀 마가 완전히 갇혔습니다.',
      },
      {
        instruction: '이제 포를 전진된 졸 너머로 발사하여 발이 묶인 마를 포획하세요!',
        expectedMove: { from: { r: 7, c: 4 }, to: { r: 3, c: 4 } },
        explanation: '작전 성공! 졸로 멱을 닫고, 그 졸을 다리 삼아 포로 마를 완벽히 낚아챘습니다!',
      },
    ],
  },
  {
    id: 'tactic-2',
    title: '제2술: 양차 합세 작전 (兩車合勢 - 필승의 날개 돌파)',
    level: '고급',
    category: '합세 공격',
    summary: '두 대의 차(車)를 상대의 취약한 측면 진영으로 집중시켜 가로와 세로에서 협공하는 한국 장기 최고의 필승 포진법입니다.',
    strategicConcept: `기물을 분산시키면 힘이 약해집니다. 장기의 꽃은 두 대의 차가 한곳에 화력을 쏟아붓는 '양차 합세'입니다.
상대 수비 기물이 아무리 든든해도 2대의 차가 연속으로 들이치면 방어선은 반드시 무너집니다.`,
    initialBoard: createT2Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '하단의 차를 0열 4선으로 전진시켜, 가로선 차와 함께 상대 측면 병을 양방향 협공하세요!',
        expectedMove: { from: { r: 7, c: 0 }, to: { r: 4, c: 0 } },
        opponentResponse: {
          from: { r: 0, c: 3 },
          to: { r: 1, c: 3 },
          commentary: '양차의 동시 위협에 한나라 방어선이 마비되어, 사를 올려 궁성을 지키려 합니다!',
        },
        explanation: '가로와 세로에서 완벽한 양차 합세 포위망이 형성되었습니다!',
      },
      {
        instruction: '0열의 차로 눈앞의 고립된 적 병을 잡아내며 상대 궁성을 무너뜨리세요!',
        expectedMove: { from: { r: 4, c: 0 }, to: { r: 3, c: 0 } },
        explanation: '통렬한 돌파! 양차 합세의 압도적인 화력으로 상대 측면 수비선을 완전히 궤멸시켰습니다!',
      },
    ],
  },
  {
    id: 'tactic-3',
    title: '제3술: 차의 절대 핀(Pin) 봉쇄술 (움직이면 궁이 잡히는 절대 부동)',
    level: '고급',
    category: '봉쇄술',
    summary: '상대 마(馬)를 상대 궁(왕)과 같은 직선상에 묶어두어, 움직이는 순간 장군이 되므로 단 한 칸도 움직이지 못하게 만드는 절대 봉쇄 전술입니다.',
    strategicConcept: `상대의 강력한 기물이라도 뒤에 왕이 버티고 있으면 움직일 수 없습니다. 
이를 '절대 핀(Absolute Pin)'이라고 부릅니다. 
발이 묶여 돌처럼 굳어버린 기물은 서서히 졸이나 마를 올려 손쉽게 요리할 수 있습니다.`,
    initialBoard: createT3Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '좌측 차를 1선으로 신속히 진격시켜 상대 마와 왕을 같은 선상에 일직선으로 묶어버리세요!',
        expectedMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 0 } },
        opponentResponse: {
          from: { r: 0, c: 5 },
          to: { r: 0, c: 4 },
          commentary: '상대 마가 움직이면 왕이 잡히므로 발이 묶여, 어쩔 수 없이 사를 당깁니다!',
        },
        explanation: '절대 핀 성공! 상대 마는 궁을 지키느라 한 발자국도 뛸 수 없는 석상이 되었습니다.',
      },
      {
        instruction: '앞선의 졸을 전진시켜 꼼짝 못하는 상대 마를 포획하세요!',
        expectedMove: { from: { r: 2, c: 2 }, to: { r: 1, c: 2 } },
        explanation: '완벽한 봉쇄 제압! 상대가 손도 쓰지 못하게 묶어두고 전리품을 취하는 최고수의 수순입니다!',
      },
    ],
  },
  {
    id: 'tactic-4',
    title: '제4술: 상(象)의 길 열기 (포격 길목 개척술)',
    level: '고급',
    category: '사선 개척',
    summary: '아군 포의 사정거리를 가로막고 있던 상(象)을 대각선으로 전개하여 포의 길목을 열어젖히고 적의 13점짜리 차를 격파하는 전술입니다.',
    strategicConcept: `장기에서 기물이 겹쳐 있으면 서로의 길을 방해합니다.
특히 대포(포)는 앞에 방해물이 둘 이상이면 포격할 수 없습니다.
상을 절묘한 위치로 전개함과 동시에 뒤의 대포가 불을 뿜는 '발견 공격(Discovered Attack)'의 묘미를 경험해보세요.`,
    initialBoard: createT4Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '상(象)을 우측 대각선으로 시원하게 도약시켜 포의 전방 사격선을 뚫으세요!',
        expectedMove: { from: { r: 7, c: 2 }, to: { r: 5, c: 5 } },
        opponentResponse: {
          from: { r: 1, c: 4 },
          to: { r: 0, c: 4 },
          commentary: '상의 도약으로 포의 직격 사선이 열리자 한나라 궁이 경악하여 피합니다!',
        },
        explanation: '포의 앞길이 완벽히 열렸습니다! 중간의 졸 하나만 다리로 남아 상대 차가 사정권에 들어왔습니다.',
      },
      {
        instruction: '포로 중간의 졸을 건너뛰어 적의 최강 기물 차(車)를 포격하여 파괴하세요!',
        expectedMove: { from: { r: 8, c: 2 }, to: { r: 3, c: 2 } },
        explanation: '대어 포획 성공! 상의 행마 하나로 포의 사선을 열어 적의 핵심 기물을 단숨에 분쇄했습니다!',
      },
    ],
  },
  {
    id: 'tactic-5',
    title: '제5술: 쌍포장(雙包將) 십자 포격 외통수 (천하무적 쌍포)',
    level: '마스터',
    category: '외통수',
    summary: '가로선과 세로선에 배치된 두 대의 대포가 궁성을 십자 형태로 포위하여 피할 수 없는 완벽한 외통수를 터뜨리는 명국면입니다.',
    strategicConcept: `한국 장기에서 쌍포는 가장 변화무쌍하고 두려운 존재입니다.
세로선에서 궁성의 중앙 퇴로를 봉쇄하고, 가로선에서 다리를 밟아 장군을 치면 궁은 궁성 벽에 갇혀 그대로 숨이 끊어집니다.`,
    initialBoard: createT5Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '좌측 포를 다리를 넘어 0선 좌측 구석으로 기동하여 적 사를 다리 삼아 가로 장군을 부르세요!',
        expectedMove: { from: { r: 2, c: 0 }, to: { r: 0, c: 0 } },
        explanation: '외통수(Checkmate)! 가로에서는 포가 장군을 부르고, 세로선은 포와 졸이 봉쇄하여 상대 왕이 단 한 칸도 피할 수 없습니다!',
      },
    ],
  },
  {
    id: 'tactic-6',
    title: '제6술: 마장·차장 양수겸장(兩手兼將) 외통수 (궁극의 일격)',
    level: '마스터',
    category: '외통수',
    summary: '마가 도약하여 장군을 부르는 순간, 마 뒤에 숨어있던 차의 사선이 동시에 열리며 두 기물이 한 번에 장군을 부르는 피할 길 없는 외통수입니다.',
    strategicConcept: `장기에서 가장 강력한 무기는 '양수겸장'입니다. 
두 기물이 동시에 장군을 부르면 어떤 기물로도 두 곳을 동시에 막을 수 없으며, 반드시 궁이 피해야만 합니다.
하지만 피할 곳마저 전부 차단되어 있다면 그것이 바로 완벽한 승리의 외통수입니다.`,
    initialBoard: createT6Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '차 앞을 가로막고 있던 마(馬)를 좌상귀로 뛰어올려 마장과 차장을 동시에 터뜨리세요!',
        expectedMove: { from: { r: 2, c: 4 }, to: { r: 1, c: 2 } },
        explanation: '천하무적 양수겸장 외통수! 마의 도약 장군과 차의 중앙 관통 장군이 동시에 폭발하여 완벽하게 승리하였습니다!',
      },
    ],
  },
];
