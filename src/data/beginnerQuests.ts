import { BoardState, Piece, Quest } from '../types/janggi';
import { createEmptyBoard, getPieceLabel } from '../utils/janggiEngine';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

// Quest 1: 궁(King)의 이동과 궁성
function createQ1Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1'); // Cho King at center of Cho palace
  b[1][4] = p('han', 'king', 'h-k-1');
  return b;
}

// Quest 2: 졸(Soldier)의 직진과 횡이동
function createQ2Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[6][4] = p('cho', 'soldier', 'c-s-1');
  b[5][4] = p('han', 'soldier', 'h-s-1'); // Target in front
  return b;
}

// Quest 3: 사(Guard)의 호위와 대각선 길
function createQ3Board(): BoardState {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1'); // Cho King at bottom center of palace
  b[9][3] = p('cho', 'guard', 'c-g-1'); // Corner of palace
  b[1][4] = p('han', 'king', 'h-k-1');
  b[7][5] = p('han', 'soldier', 'h-s-1'); // Threatening enemy
  return b;
}

// Quest 4: 차(Chariot)의 직선 질주와 포획
function createQ4Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[9][0] = p('cho', 'chariot', 'c-r-1');
  b[3][0] = p('han', 'soldier', 'h-s-1'); // Target
  return b;
}

// Quest 5: 포(Cannon)의 다리(Screen) 넘기 & 포불월포
function createQ5Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[7][1] = p('cho', 'cannon', 'c-c-1');
  b[5][1] = p('cho', 'soldier', 'c-s-bridge'); // Bridge/다리
  b[2][1] = p('han', 'horse', 'h-h-target');   // Target behind bridge
  return b;
}

// Quest 6: 마(Horse)의 날 일(日)자 도약과 '멱'의 원리
function createQ6Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[7][4] = p('cho', 'horse', 'c-h-1');
  b[5][5] = p('han', 'soldier', 'h-s-target'); // Target at (5, 5)
  // (6, 4) is EMPTY so the horse's orthogonal forward step is NOT blocked!
  return b;
}

// Quest 7: 상(Elephant)의 쓸 용(用)자 3칸 도약과 2개의 멱
function createQ7Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[8][2] = p('cho', 'elephant', 'c-e-1');
  b[5][4] = p('han', 'soldier', 'h-s-target'); // Target: 1 step up (7,2), 2 steps diag (6,3)->(5,4)
  return b;
}

// Quest 8: 장군(Check) 부르기
function createQ8Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[5][0] = p('cho', 'chariot', 'c-r-1');
  // Chariot moving to (1, 0) attacks Han King at (1, 4) horizontally -> CHECK!
  return b;
}

// Quest 9: 외통수(Checkmate) 결정타
function createQ9Board(): BoardState {
  const b = createEmptyBoard();
  b[8][4] = p('cho', 'king', 'c-k-1');
  b[0][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[0][5] = p('han', 'guard', 'h-g-2');
  b[1][3] = p('cho', 'soldier', 'c-s-1'); // Blocks escape
  b[1][5] = p('cho', 'soldier', 'c-s-2'); // Blocks escape
  b[3][4] = p('cho', 'chariot', 'c-r-1'); // Moving to (1,4) will deliver CHECKMATE!
  return b;
}

export const BEGINNER_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: '제1관: 장기판과 궁(宮)의 첫걸음',
    badge: '궁의 발걸음',
    category: 'basics',
    description: '장기판은 가로 9줄, 세로 10줄의 교차점에 돌을 놓습니다. 궁성의 중심에 있는 초나라 궁(楚)을 위쪽으로 한 칸 움직여보세요.',
    acornReward: 10,
    initialBoard: createQ1Board(),
    turn: 'cho',
    objective: '초나라 궁(楚)을 (8, 4)에서 (7, 4)로 한 칸 전진시키세요.',
    tip: '궁과 사는 3×3 크기의 궁성을 벗어날 수 없으며, 선을 따라 한 칸씩만 이동할 수 있습니다.',
    steps: [
      {
        instruction: '궁(8, 4)을 클릭한 후 위쪽 (7, 4) 위치를 클릭하세요.',
        expectedMove: { from: { r: 8, c: 4 }, to: { r: 7, c: 4 } },
        feedbackSuccess: '훌륭합니다! 궁의 첫 걸음을 성공적으로 마쳤습니다. (+10 도토리 획득)',
        feedbackFail: '궁(8, 4)을 선택하고 위쪽 (7, 4) 칸을 클릭해야 합니다.',
      },
    ],
  },
  {
    id: 'quest-2',
    title: '제2관: 졸(卒)의 전진과 적군 격파',
    badge: '용감한 졸',
    category: 'pieces',
    description: '졸(병)은 오직 앞으로 1칸, 또는 좌우로 1칸만 움직일 수 있으며 뒤로는 절대 후퇴할 수 없습니다!',
    acornReward: 15,
    initialBoard: createQ2Board(),
    turn: 'cho',
    objective: '졸을 앞으로 한 칸 전진하여 눈앞의 한나라 병을 잡아보세요.',
    tip: '체스의 폰과 달리 장기의 졸은 대각선이 아니라 정면이나 좌우로 적을 잡습니다.',
    steps: [
      {
        instruction: '졸(6, 4)을 클릭한 뒤 적 병이 있는 (5, 4)를 클릭해 잡으세요.',
        expectedMove: { from: { r: 6, c: 4 }, to: { r: 5, c: 4 } },
        feedbackSuccess: '정확합니다! 전진하는 졸은 적을 두렵게 만드는 든든한 전선입니다. (+15 도토리 획득)',
        feedbackFail: '졸(6, 4)을 선택하고 정면 (5, 4)의 적 병을 공격하세요.',
      },
    ],
  },
  {
    id: 'quest-3',
    title: '제3관: 사(士)의 대각선 호위',
    badge: '철벽의 사',
    category: 'pieces',
    description: '사(士)는 궁을 지키는 2명의 호위무사입니다. 궁성의 대각선 선을 따라 이동할 수 있습니다.',
    acornReward: 15,
    initialBoard: createQ3Board(),
    turn: 'cho',
    objective: '사(9, 3)를 궁성 대각선 중심인 (8, 4)로 이동시켜 왕을 호위하세요.',
    tip: '궁성 네 귀퉁이와 중앙은 대각선으로 이어져 있어 대각선 행마가 가능합니다.',
    steps: [
      {
        instruction: '사(9, 3)를 클릭하고 대각선 중심 (8, 4)로 올려보세요.',
        expectedMove: { from: { r: 9, c: 3 }, to: { r: 8, c: 4 } },
        feedbackSuccess: '멋집니다! 사가 궁성 중심을 굳건히 지키고 있습니다. (+15 도토리 획득)',
        feedbackFail: '사(9, 3)를 대각선 경로인 (8, 4)로 이동시켜 주세요.',
      },
    ],
  },
  {
    id: 'quest-4',
    title: '제4관: 전장을 가르는 전차, 차(車)',
    badge: '전장의 지배자',
    category: 'pieces',
    description: '차(車)는 가로·세로 직선상에 장애물이 없는 한 끝까지 질주할 수 있는 장기 최강의 공격 기물(13점)입니다.',
    acornReward: 20,
    initialBoard: createQ4Board(),
    turn: 'cho',
    objective: '차(9, 0)를 북쪽으로 쾌속 진격시켜 (3, 0)에 위치한 적 병을 잡으세요.',
    tip: '차는 한 번에 여러 칸을 직진할 수 있으며, 궁성 안에서는 대각선으로도 달릴 수 있습니다.',
    steps: [
      {
        instruction: '좌측 구석의 차(9, 0)를 클릭하고 (3, 0)의 적 병을 타격하세요.',
        expectedMove: { from: { r: 9, c: 0 }, to: { r: 3, c: 0 } },
        feedbackSuccess: '호쾌한 진격! 차의 위력을 제대로 체감하셨습니다. (+20 도토리 획득)',
        feedbackFail: '차(9, 0)를 선택하고 일직선상의 (3, 0) 적 병을 잡아주세요.',
      },
    ],
  },
  {
    id: 'quest-5',
    title: '제5관: 다리를 넘는 대포, 포(包)',
    badge: '포병 명사수',
    category: 'pieces',
    description: '포(包)는 반드시 다른 기물(다리) 딱 하나를 건너뛰어야만 이동 및 포획이 가능합니다. 포끼리는 넘거나 잡을 수 없습니다(포불월포)!',
    acornReward: 20,
    initialBoard: createQ5Board(),
    turn: 'cho',
    objective: '중간의 졸(5, 1)을 다리 삼아 (2, 1)에 있는 적 마(馬)를 포획하세요.',
    tip: '다리가 없으면 포는 한 칸도 움직일 수 없습니다. 아군이나 적군 기물 모두 다리가 될 수 있습니다.',
    steps: [
      {
        instruction: '포(7, 1)를 클릭하고 다리 너머의 적 마(2, 1)를 클릭해 포격하세요.',
        expectedMove: { from: { r: 7, c: 1 }, to: { r: 2, c: 1 } },
        feedbackSuccess: '명중! 다리를 이용한 포의 곡사 포격을 완벽히 구사했습니다. (+20 도토리 획득)',
        feedbackFail: '포(7, 1)를 선택하고 다리 너머 (2, 1)의 마를 목표로 지정하세요.',
      },
    ],
  },
  {
    id: 'quest-6',
    title: '제6관: 날 일(日)자로 뛰는 마(馬)와 멱',
    badge: '준마의 기동',
    category: 'pieces',
    description: '마(馬)는 직진 1칸 후 대각선 1칸(날 일자 형태)으로 도약합니다. 단, 직진하는 바로 앞칸(멱)이 막히면 뛸 수 없습니다.',
    acornReward: 20,
    initialBoard: createQ6Board(),
    turn: 'cho',
    objective: '마(7, 4)를 앞으로 한 칸, 오른쪽 대각선으로 한 칸 뛰어 (5, 5)의 적 병을 잡으세요.',
    tip: '체스의 나이트와 달리 앞칸(멱)에 기물이 있으면 길이 차단되므로 항상 멱이 열려있는지 확인해야 합니다.',
    steps: [
      {
        instruction: '마(7, 4)를 클릭하고 목표 지점 (5, 5)의 적을 타격하세요.',
        expectedMove: { from: { r: 7, c: 4 }, to: { r: 5, c: 5 } },
        feedbackSuccess: '완벽한 도약! 멱이 트인 길로 적을 정확히 제압했습니다. (+20 도토리 획득)',
        feedbackFail: '마(7, 4)를 선택하고 (5, 5) 지점으로 이동해 적을 잡으세요.',
      },
    ],
  },
  {
    id: 'quest-7',
    title: '제7관: 쓸 용(用)자로 3칸 도약하는 상(象)',
    badge: '대지의 거상',
    category: 'pieces',
    description: '상(象)은 직진 1칸 후 대각선 2칸으로 시원하게 도약합니다. 지나가는 2개의 멱(길목)이 모두 비어 있어야 합니다.',
    acornReward: 25,
    initialBoard: createQ7Board(),
    turn: 'cho',
    objective: '상(8, 2)을 위로 1칸(7, 2), 우상 대각선 2칸(6, 3)->(5, 4)으로 뛰어 적 병을 포획하세요.',
    tip: '상은 먼 거리의 기물을 기습하기에 최고의 기물입니다. 길목에 장애물이 없는지 주의 깊게 살피세요.',
    steps: [
      {
        instruction: '상(8, 2)을 클릭하고 (5, 4)의 적 병을 타격하세요.',
        expectedMove: { from: { r: 8, c: 2 }, to: { r: 5, c: 4 } },
        feedbackSuccess: '시원한 도약 성공! 상의 3칸 행마를 완벽히 이해하셨습니다. (+25 도토리 획득)',
        feedbackFail: '상(8, 2)을 선택하고 (5, 4) 지점의 적을 잡아보세요.',
      },
    ],
  },
  {
    id: 'quest-8',
    title: '제8관: 천지를 울리는 장군(將軍)!',
    badge: '장군 선언',
    category: 'rules',
    description: '상대의 궁(왕)을 직접 공격할 수 있는 위치에 기물을 놓는 것을 "장군"이라고 부릅니다. 차로 장군을 불러보세요.',
    acornReward: 25,
    initialBoard: createQ8Board(),
    turn: 'cho',
    objective: '차(5, 0)를 북쪽 (1, 0)으로 전진시켜 한나라 궁(1, 4)에 장군을 부르세요.',
    tip: '장군을 당한 상대는 반드시 궁을 피하거나, 공격 기물을 잡거나, 길목을 막아야만 합니다.',
    steps: [
      {
        instruction: '차(5, 0)를 클릭하고 한나라 궁과 같은 가로선인 (1, 0)으로 이동하세요.',
        expectedMove: { from: { r: 5, c: 0 }, to: { r: 1, c: 0 } },
        feedbackSuccess: '장군! 한나라 궁을 정면으로 겨누었습니다. (+25 도토리 획득)',
        feedbackFail: '차(5, 0)를 (1, 0)으로 이동시켜 왕을 위협해야 합니다.',
      },
    ],
  },
  {
    id: 'quest-9',
    title: '제9관: 도망칠 곳 없는 외통수(Checkmate)',
    badge: '외통수 달인',
    category: 'rules',
    description: '장군을 불렀을 때 상대 왕이 피할 곳도 없고, 막을 길도 없으면 "외통수"로 게임에서 승리합니다!',
    acornReward: 30,
    initialBoard: createQ9Board(),
    turn: 'cho',
    objective: '차(3, 4)를 적 궁성 바로 앞 (1, 4)로 침투시켜 완벽한 외통수를 완성하세요.',
    tip: '상대 궁의 퇴로가 아군 졸과 사로 막혀 있어 차의 침투 한 방에 게임이 끝납니다.',
    steps: [
      {
        instruction: '차(3, 4)를 클릭하고 (1, 4)로 진입시켜 외통수를 만드세요.',
        expectedMove: { from: { r: 3, c: 4 }, to: { r: 1, c: 4 } },
        feedbackSuccess: '외통수 승리! 기초 수련을 모두 수료하여 도토리 장기 초심자 칭호를 획득했습니다! (+30 도토리)',
        feedbackFail: '차(3, 4)를 (1, 4) 칸으로 전진시켜 외통수를 완성하세요.',
      },
    ],
  },
];
