import { BoardState, Piece, TacticPuzzle } from '../types/janggi';
import { createEmptyBoard, getPieceLabel } from '../utils/janggiEngine';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

// Tactic 1: 멱 차단과 기물 포위
function createT1Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[5][4] = p('han', 'horse', 'h-m-1'); // Enemy horse in center
  b[7][3] = p('cho', 'soldier', 'c-s-1'); // Soldier ready to advance and block
  b[8][6] = p('cho', 'cannon', 'c-c-1'); // Cannon prepared to strike
  return b;
}

// Tactic 2: 양차 합세 작전
function createT2Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[2][0] = p('han', 'soldier', 'h-s-1');
  b[1][1] = p('han', 'horse', 'h-h-1'); // Enemy defending horse
  b[4][0] = p('cho', 'chariot', 'c-r-1'); // First chariot on 0-file
  b[7][1] = p('cho', 'chariot', 'c-r-2'); // Second chariot ready to coordinate on 1-file
  return b;
}

// Tactic 3: 포로 차 묶기 (Pin)
function createT3Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[1][1] = p('han', 'chariot', 'h-r-1'); // High value enemy chariot
  b[1][3] = p('han', 'guard', 'h-g-1');   // Screen in between
  b[1][8] = p('cho', 'cannon', 'c-c-1');  // Cho cannon ready to pin horizontally
  return b;
}

// Tactic 4: 기물 가치 교환과 미끼 유인술 (상 희생으로 차 낚기)
function createT4Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[3][2] = p('han', 'chariot', 'h-r-1'); // Enemy greedy chariot (13 pts)
  b[6][2] = p('cho', 'elephant', 'c-e-1'); // Cho elephant (3 pts) ready to bait
  b[8][2] = p('cho', 'cannon', 'c-c-1');   // Cho cannon (7 pts) behind
  b[5][2] = p('cho', 'soldier', 'c-s-1');  // Screen bridge
  return b;
}

// Tactic 5: 쌍포장 외통수 (Double Cannon Checkmate)
function createT5Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[0][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[0][5] = p('han', 'guard', 'h-g-2');
  b[1][4] = p('han', 'soldier', 'h-s-bridge'); // Screen in front of King
  b[3][4] = p('cho', 'cannon', 'c-c-front');   // Front cannon
  b[6][4] = p('cho', 'cannon', 'c-c-back');    // Back cannon
  return b;
}

// Tactic 6: 궁성 포위와 차장 콤보 (Palace Siege & Chariot Combo)
function createT6Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[2][3] = p('cho', 'soldier', 'c-s-1'); // Trapping corner
  b[2][5] = p('cho', 'soldier', 'c-s-2'); // Trapping corner
  b[4][4] = p('cho', 'chariot', 'c-r-1'); // Ready for decisive strike
  return b;
}

export const ADVANCED_TACTICS: TacticPuzzle[] = [
  {
    id: 'tactic-1',
    title: '제1술: 멱 차단과 기물 포위술 (상대 말을 가두고 사냥하기)',
    level: '중급',
    category: '기물 사냥',
    summary: '상대의 가장 기동성 높은 마(馬)의 앞길(멱)을 2점짜리 졸로 틀어막아 무력화시킨 뒤, 포로 안전하게 낚아채는 전술입니다.',
    strategicConcept: `장기에서 기물을 잡으려 할 때 무작정 쫓아가면 도망갑니다. 
진정한 고수는 먼저 '퇴로(멱)'를 닫아 상대가 갈 곳이 없게 만든 뒤 여유롭게 포획합니다.
마(5점)의 멱을 졸(2점)로 막으면 마는 한 발자국도 도약하지 못하고 갇히게 됩니다.`,
    initialBoard: createT1Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '졸(7, 3)을 오른쪽 (7, 4)로 당겨 상대 마의 전진 멱을 차단하세요!',
        expectedMove: { from: { r: 7, c: 3 }, to: { r: 7, c: 4 } },
        opponentResponse: {
          from: { r: 1, c: 4 },
          to: { r: 1, c: 5 },
          commentary: '상대 마가 발이 묶여 움직이지 못하자, 상대 왕이 불안하여 한 칸 피합니다!',
        },
        explanation: '훌륭합니다! 마의 앞길인 (6, 4)와 (7, 4)가 졸로 막혀 마의 핵심 도약로가 봉쇄되었습니다.',
      },
      {
        instruction: '이제 포(8, 6)를 좌측 (8, 4)로 이동시켜 졸을 다리 삼아 갇힌 마를 포격하세요!',
        expectedMove: { from: { r: 8, c: 6 }, to: { r: 8, c: 4 } },
        explanation: '작전 성공! 졸로 멱을 닫고 포로 가둔 말을 완벽하게 제압했습니다. 이것이 기물 사냥의 큰 그림입니다!',
      },
    ],
  },
  {
    id: 'tactic-2',
    title: '제2술: 양차 합세 작전 (필승의 날개 돌파)',
    level: '고급',
    category: '합세 공격',
    summary: '두 대의 차(車)를 한쪽 진영(1열과 2열)으로 집중시켜 상대의 수비 진형을 수적으로 압도하여 박살내는 프로기사들의 필승 공격법입니다.',
    strategicConcept: `기물을 분산시키면 힘이 약해집니다. 장기의 꽃은 두 대의 차가 한곳에 화력을 쏟아붓는 '양차 합세'입니다.
상대 수비 기물이 아무리 든든해도 2대의 차가 연속으로 들이치면 방어선은 반드시 무너집니다.`,
    initialBoard: createT2Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '우측의 차(7, 1)를 북쪽 (2, 1)로 진격시켜 상대 마를 협공하세요!',
        expectedMove: { from: { r: 7, c: 1 }, to: { r: 2, c: 1 } },
        opponentResponse: {
          from: { r: 2, c: 0 },
          to: { r: 1, c: 0 },
          commentary: '상대가 병을 올려 버텨보려 하지만 이미 늦었습니다!',
        },
        explanation: '두 대의 차가 0열과 1열에서 완벽한 양차 합세 편대를 구성했습니다.',
      },
      {
        instruction: '좌측 차(4, 0)를 (1, 0)으로 돌진시켜 적 병을 잡고 상대 궁성을 압박하세요!',
        expectedMove: { from: { r: 4, c: 0 }, to: { r: 1, c: 0 } },
        explanation: '통렬한 돌파! 양차 합세의 압도적인 공격력으로 상대 측면 수비선을 완전히 궤멸시켰습니다!',
      },
    ],
  },
  {
    id: 'tactic-3',
    title: '제3술: 포로 차 묶기 (절대 봉쇄 핀 전술)',
    level: '고급',
    category: '봉쇄술',
    summary: '상대의 가장 강력한 기물인 차(13점)를 포의 공격선에 묶어두어 완전히 손발을 묶어버리는 고급 봉쇄 기술입니다.',
    strategicConcept: `상대의 13점짜리 차는 언제나 가장 위협적입니다. 
하지만 포와 중간 다리를 이용해 차의 길목을 가로막으면, 차는 움직이는 순간 뒤가 뚫리거나 다른 기물이 잡히게 되어 '얼어붙게' 됩니다.`,
    initialBoard: createT3Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '포(1, 8)를 서쪽 (1, 5)로 기동하여 다리(1, 3)를 통해 상대 차(1, 1)를 정조준하세요!',
        expectedMove: { from: { r: 1, c: 8 }, to: { r: 1, c: 5 } },
        opponentResponse: {
          from: { r: 1, c: 4 },
          to: { r: 0, c: 4 },
          commentary: '차를 지키기 위해 상대 궁이 다급하게 이동합니다!',
        },
        explanation: '정확합니다! 상대 차(1, 1)는 이제 포의 포격 사정권에 갇혀 한 걸음도 움직이지 못합니다.',
      },
    ],
  },
  {
    id: 'tactic-4',
    title: '제4술: 기물 가치 교환과 미끼 유인술 (희생타의 큰 그림)',
    level: '고급',
    category: '기물 교환',
    summary: '3점짜리 상을 미끼로 던져 상대의 13점짜리 차를 유인한 뒤, 숨어있던 포로 차를 낚아채 +10점의 압도적 우위를 점하는 덫입니다.',
    strategicConcept: `기물의 점수 가치를 아는 것이 프로와 아마추어의 가장 큰 차이입니다.
차(13점) > 포(7점) > 마(5점) > 상(3점) = 사(3점) > 졸/병(2점).
작은 기물(상 3점)을 일부러 주어서 큰 기물(차 13점)을 잡는 것은 무려 10점의 막대한 이득을 안겨주는 장기의 최고급 묘수입니다.`,
    initialBoard: createT4Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '상(6, 2)을 북쪽으로 전진시켜 (3, 0)으로 도약해 차의 미끼가 되세요!',
        expectedMove: { from: { r: 6, c: 2 }, to: { r: 3, c: 0 } },
        opponentResponse: {
          from: { r: 3, c: 2 },
          to: { r: 3, c: 0 },
          commentary: '욕심 많은 상대 차가 공짜인 줄 알고 상을 덥석 잡았습니다!',
        },
        explanation: '미끼를 완벽하게 물었습니다! 이제 2열에 있던 상이 사라져 포의 공격로가 시원하게 열렸습니다.',
      },
      {
        instruction: '포(8, 2)를 북쪽 (1, 2)로 쏘아 올려 상대 진영을 통타하세요!',
        expectedMove: { from: { r: 8, c: 2 }, to: { r: 1, c: 2 } },
        explanation: '절묘한 덫 완성! 상을 희생하여 상대의 주력 전차를 격파하고 전세를 완전히 뒤집었습니다!',
      },
    ],
  },
  {
    id: 'tactic-5',
    title: '제5술: 쌍포장 외통수 (천하무적 쌍포 콤비네이션)',
    level: '마스터',
    category: '외통수',
    summary: '두 대의 포가 서로를 다리 삼아 교대로 장군을 부르며 상대 왕을 꼼짝 못 하게 가두는 한국 장기 고유의 예술적인 외통수입니다.',
    strategicConcept: `포는 포를 넘을 수 없지만, 두 포 사이에 다른 기물이 하나라도 있으면 엄청난 파괴력을 냅니다.
앞포가 길을 열고 뒷포가 덮치는 '쌍포장'은 상대 왕이 아무리 많은 사와 수비 기물을 거느리고 있어도 피할 수 없는 결정타가 됩니다.`,
    initialBoard: createT5Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '앞쪽 포(3, 4)를 (0, 4)로 쏘아 첫 번째 장군을 부르세요!',
        expectedMove: { from: { r: 3, c: 4 }, to: { r: 0, c: 4 } },
        explanation: '장군! 상대 왕은 포의 공격선에서 피할 수 없으며 완벽한 쌍포장 외통수에 걸려들었습니다!',
      },
    ],
  },
  {
    id: 'tactic-6',
    title: '제6술: 궁성 가두기와 차장 콤보 (종반 마무리 빅픽처)',
    level: '마스터',
    category: '엔드게임',
    summary: '양쪽 귀퉁이의 퇴로를 졸로 틀어막은 뒤, 중앙에서 차가 번개처럼 내리꽂혀 승리를 결정짓는 실전 종반 외통수 기술입니다.',
    strategicConcept: `아무리 유리해도 마무리를 짓지 못하면 역전당합니다.
종반전의 큰 그림은 '왕의 숨구멍'을 하나씩 없애는 것입니다.
양쪽 모서리를 좁혀 왕을 중앙 좁은 통로에 몰아넣은 뒤 차로 내리꽂는 순간 대국은 끝납니다.`,
    initialBoard: createT6Board(),
    turn: 'cho',
    steps: [
      {
        instruction: '중앙의 차(4, 4)를 (1, 4)로 과감하게 내리꽂아 외통수를 완성하세요!',
        expectedMove: { from: { r: 4, c: 4 }, to: { r: 1, c: 4 } },
        explanation: '외통수 완성! 궁성의 퇴로를 완벽히 옥죄고 차로 종지부를 찍었습니다. 모든 고급 전술을 마스터하셨습니다!',
      },
    ],
  },
];
