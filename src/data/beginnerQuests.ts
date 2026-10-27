import { BeginnerQuest, BoardState } from '../types/chess';
import { createPiece } from '../utils/chessEngine';

function emptyBoard(): BoardState {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

export const BEGINNER_QUESTS: BeginnerQuest[] = [
  {
    id: 1,
    gate: '제1관',
    title: '체스판과 중앙 요충지 (The Center)',
    concept: '체스판은 8×8, 총 64칸으로 이루어져 있습니다. 가운데 4개 칸(e4, d4, e5, d5)은 전장을 지배하는 가장 핵심적인 중앙 고지대입니다!',
    tip: '백의 e2 폰을 중앙 e4 칸으로 2칸 힘차게 밀어 올려 중앙을 선점하세요.',
    rewardAcorns: 30,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[6][4] = createPiece('p', 'w', 'p');
      b[0][4] = createPiece('k', 'b', 'k');
      b[1][4] = createPiece('p', 'b', 'p');
      return b;
    })(),
    targetMove: {
      from: { row: 6, col: 4 }, // e2
      to: { row: 4, col: 4 },   // e4
    },
    explanationOnClear: '완벽합니다! e4로 전진한 폰은 d5와 f5 칸을 통제하여 흑의 진입을 견제하고 백 비숍과 퀸의 길을 열어줍니다.',
  },
  {
    id: 2,
    gate: '제2관',
    title: '폰의 전진과 적군 대각선 포획 (Pawn Capture)',
    concept: '폰은 앞으로 직진하지만, 적 기물을 잡을 때는 오직 "대각선 앞 1칸"으로만 이동하며 잡습니다!',
    tip: 'e4에 있는 백 폰으로 d5에 있는 흑 폰을 대각선으로 포획하세요.',
    rewardAcorns: 35,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[4][4] = createPiece('p', 'w', 'e4');
      b[0][4] = createPiece('k', 'b', 'k');
      b[3][3] = createPiece('p', 'b', 'd5'); // enemy pawn
      return b;
    })(),
    targetMove: {
      from: { row: 4, col: 4 }, // e4
      to: { row: 3, col: 3 },   // d5
    },
    explanationOnClear: '정확합니다! 폰은 직진 이동과 대각선 포획이라는 독특하고 매력적인 규칙을 가집니다.',
  },
  {
    id: 3,
    gate: '제3관',
    title: '폰의 궁극 변신, 프로모션 (Pawn Promotion)',
    concept: '가장 연약한 폰이라도 적진 끝(8번째 랭크)에 무사히 도달하면 퀸, 룩, 비숍, 나이트 중 원하는 강력한 기물로 즉시 승급(Promotion)합니다!',
    tip: 'e7에 있는 백 폰을 e8 칸으로 전진시켜 최강의 기물 퀸(Queen)으로 승급시키세요.',
    rewardAcorns: 40,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[1][4] = createPiece('p', 'w', 'e7');
      b[0][0] = createPiece('k', 'b', 'k');
      return b;
    })(),
    targetMove: {
      from: { row: 1, col: 4 }, // e7
      to: { row: 0, col: 4 },   // e8
      promotion: 'q',
    },
    explanationOnClear: '축하합니다! 폰이 가장 강력한 기물인 퀸으로 재탄생하여 전세를 한 방에 장악했습니다.',
  },
  {
    id: 4,
    gate: '제4관',
    title: '유일한 공중도약 기사, 나이트 (Knight)',
    concept: '나이트는 기물들 중 유일하게 다른 기물을 뛰어넘을 수 있습니다! 이동 궤적은 직진 2칸 후 직각 1칸(L자)입니다.',
    tip: 'g1에 위치한 백 나이트를 f3로 뛰어넘어 중앙을 압박하세요.',
    rewardAcorns: 45,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][6] = createPiece('n', 'w', 'g1');
      b[6][5] = createPiece('p', 'w', 'f2');
      b[6][6] = createPiece('p', 'w', 'g2');
      b[0][4] = createPiece('k', 'b', 'k');
      return b;
    })(),
    targetMove: {
      from: { row: 7, col: 6 }, // g1
      to: { row: 5, col: 5 },   // f3
    },
    explanationOnClear: '훌륭합니다! 앞에 폰들이 길을 막고 있어도 나이트는 가볍게 뛰어넘어 활동적인 f3 칸으로 출격했습니다.',
  },
  {
    id: 5,
    gate: '제5관',
    title: '대각선의 날카로운 저격수, 비숍 (Bishop)',
    concept: '비숍은 대각선 방향으로 가로막는 기물이 없을 때까지 원하는 만큼 멀리 이동할 수 있습니다.',
    tip: 'c1의 백 비숍을 g5 칸까지 대각선으로 쭉 뻗어 흑의 d8 퀸을 핀으로 겨냥하세요.',
    rewardAcorns: 45,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][2] = createPiece('b', 'w', 'c1');
      b[0][4] = createPiece('k', 'b', 'k');
      b[0][3] = createPiece('q', 'b', 'd8');
      b[1][5] = createPiece('n', 'b', 'f6');
      return b;
    })(),
    targetMove: {
      from: { row: 7, col: 2 }, // c1
      to: { row: 3, col: 6 },   // g5
    },
    explanationOnClear: '멋집니다! Bg5로 흑의 f6 나이트를 핀(Pin)에 걸어 흑 진영을 심각한 긴장 상태로 몰아넣었습니다.',
  },
  {
    id: 6,
    gate: '제6관',
    title: '직선 전장의 중전차, 룩 (Rook)',
    concept: '룩은 가로(랭크)와 세로(파일)를 거침없이 직진하는 5점짜리 초강력 중기물입니다!',
    tip: 'a1에 있는 백 룩으로 8번째 랭크의 a8에 있는 적 룩을 직접 격파하세요.',
    rewardAcorns: 50,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][0] = createPiece('r', 'w', 'a1');
      b[0][4] = createPiece('k', 'b', 'k');
      b[0][0] = createPiece('r', 'b', 'a8');
      return b;
    })(),
    targetMove: {
      from: { row: 7, col: 0 }, // a1
      to: { row: 0, col: 0 },   // a8
    },
    explanationOnClear: '통쾌합니다! 열린 a파일을 따라 시원하게 돌격하여 상대 주력 룩을 제압했습니다.',
  },
  {
    id: 7,
    gate: '제7관',
    title: '전장의 절대 지배자, 퀸 (Queen)',
    concept: '퀸은 룩의 직진 능력과 비숍의 대각선 능력을 모두 합친 9점짜리 최강의 기물입니다!',
    tip: 'd1에 있는 백 퀸을 d8로 질주시켜 흑 킹에게 체크메이트를 선언하세요.',
    rewardAcorns: 55,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][3] = createPiece('q', 'w', 'd1');
      b[0][4] = createPiece('k', 'b', 'e8');
      b[1][3] = createPiece('p', 'b', 'd7');
      b[1][4] = createPiece('p', 'b', 'e7');
      b[1][5] = createPiece('p', 'b', 'f7');
      return b;
    })(),
    targetMove: {
      from: { row: 7, col: 3 }, // d1
      to: { row: 0, col: 3 },   // d8
    },
    explanationOnClear: '외통수(Checkmate)! 퀸의 거대한 사정거리로 흑 킹의 탈출로를 완전히 차단하며 경기를 끝냈습니다.',
  },
  {
    id: 8,
    gate: '제8관',
    title: '킹을 지키는 요새 기동, 캐슬링 (Castling)',
    concept: '한 번의 수로 킹을 2칸 피신시키고 룩을 중앙으로 끌어오는 궁극의 특수 규칙! 킹과 룩이 아직 한 번도 움직이지 않았어야 합니다.',
    tip: 'e1의 킹을 g1으로 2칸 옮겨 킹사이드 캐슬링(O-O)을 완성하세요.',
    rewardAcorns: 60,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][7] = createPiece('r', 'w', 'h1');
      b[6][5] = createPiece('p', 'w', 'f2');
      b[6][6] = createPiece('p', 'w', 'g2');
      b[6][7] = createPiece('p', 'w', 'h2');
      b[0][4] = createPiece('k', 'b', 'k');
      return b;
    })(),
    targetMove: {
      from: { row: 7, col: 4 }, // e1
      to: { row: 7, col: 6 },   // g1
    },
    explanationOnClear: '완벽한 캐슬링! 킹은 폰들의 호위를 받으며 안전해졌고, 룩은 중앙 전선으로 이동했습니다.',
  },
  {
    id: 9,
    gate: '제9관',
    title: '찰나의 기회, 앙파상 (En Passant)',
    concept: '상대 폰이 2칸 뛰어넘어 자신의 폰 바로 옆에 멈췄을 때, 마치 1칸만 움직인 것처럼 스쳐 지나간 칸으로 이동하며 잡는 특수 룰입니다.',
    tip: 'e5에 있는 백 폰으로 f5 칸으로 대각선 이동하며 갓 2칸 전진한 흑의 f5 폰을 낚아채세요.',
    rewardAcorns: 65,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[3][4] = createPiece('p', 'w', 'e5');
      b[3][5] = createPiece('p', 'b', 'f5'); // Just moved 2 squares from f7
      b[0][4] = createPiece('k', 'b', 'k');
      return b;
    })(),
    targetMove: {
      from: { row: 3, col: 4 }, // e5
      to: { row: 2, col: 5 },   // f6
    },
    explanationOnClear: '앙파상(En Passant) 성공! 프랑스어로 "스쳐 지나가며"라는 뜻으로, 고급 체스 마스터들이 애용하는 규칙입니다.',
  },
  {
    id: 10,
    gate: '제10관',
    title: '천하무적 외통수, 체크메이트 (Checkmate)',
    concept: '상대 킹이 공격(Check)받고 있으며, 잡거나 막거나 피할 수 있는 방법이 전혀 없을 때 게임은 즉시 체크메이트로 승리합니다!',
    tip: 'h5의 백 퀸을 f7 칸으로 급습시켜 흑 킹을 체크메이트(Scholar\'s Mate)로 장식하세요.',
    rewardAcorns: 100,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[3][7] = createPiece('q', 'w', 'h5');
      b[4][2] = createPiece('b', 'w', 'c4'); // Backing up f7
      b[0][4] = createPiece('k', 'b', 'e8');
      b[1][4] = createPiece('p', 'b', 'e7');
      b[1][5] = createPiece('p', 'b', 'f7');
      return b;
    })(),
    targetMove: {
      from: { row: 3, col: 7 }, // h5
      to: { row: 1, col: 5 },   // f7
    },
    explanationOnClear: '체크메이트(Checkmate)! 백 비숍이 f7 칸을 호위하고 있으므로 흑 킹은 퀸을 잡을 수 없어 탈출 불가능합니다!',
  },
];
