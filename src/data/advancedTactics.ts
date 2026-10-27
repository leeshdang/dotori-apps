import { AdvancedTactic, BoardState } from '../types/chess';
import { createPiece } from '../utils/chessEngine';

function emptyBoard(): BoardState {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

export const ADVANCED_TACTICS: AdvancedTactic[] = [
  {
    id: 1,
    number: '제1술',
    title: '천하무적 나이트의 로열 포크 (Royal Fork)',
    technique: '양걸이 공격 (Fork)',
    bigPicture:
      '상대의 킹과 퀸/룩이 나이트 사정거리 안에 들어오는 순간을 포착하여, 단 한 수의 L자 도약으로 두 최고 가치 기물을 동시에 노려 거대한 기물 이득을 확정 짓는 결정적 전술입니다.',
    concept: '포크는 하나의 기물로 둘 이상의 적 기물을 동시에 공격하는 전술입니다.',
    tip: 'c3에 있는 백 나이트를 d5로 뛰어넘어 e7의 흑 킹과 b6의 흑 퀸을 동시에 포크(Fork)하세요!',
    rewardAcorns: 60,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[5][2] = createPiece('n', 'w', 'c3');
      b[1][4] = createPiece('k', 'b', 'e7');
      b[2][1] = createPiece('q', 'b', 'b6');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 5, col: 2 }, to: { row: 3, col: 3 } }, // Nc3 -> d5 (Check on e7 + Attack on b6)
    ],
    opponentReplies: [
      { from: { row: 1, col: 4 }, to: { row: 0, col: 4 } }, // Ke7 -> e8
    ],
    explanationOnClear:
      '대성공! 흑 킹은 체크를 피하려 달아나야만 하므로, 다음 수에 공짜로 9점짜리 흑 퀸을 나이트로 포획할 수 있습니다. 이것이 바로 로열 포크의 위력입니다.',
  },
  {
    id: 2,
    number: '제2술',
    title: '도망갈 수 없는 절대 봉쇄 핀 (Absolute Pin)',
    technique: '절대 핀 (Absolute Pin)',
    bigPicture:
      '상대의 고가치 기물(나이트, 룩 등) 뒤에 킹이 일직선상으로 놓여 있을 때, 비숍으로 공격선을 꽂아 넣으면 상대 기물은 규칙상 킹을 노출시킬 수 없어 전혀 움직일 수 없는 식물 기물이 됩니다.',
    concept: '핀에 걸린 기물은 방패 역할을 해야 하므로 다른 곳으로 이동할 수 없습니다.',
    tip: 'f1의 백 비숍을 b5로 길게 뻗어 c6의 흑 나이트를 e8의 흑 킹에게 절대 핀(Pin)으로 묶으세요!',
    rewardAcorns: 65,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][5] = createPiece('b', 'w', 'f1');
      b[2][2] = createPiece('n', 'b', 'c6');
      b[0][4] = createPiece('k', 'b', 'e8');
      b[1][3] = createPiece('p', 'b', 'd7');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 7, col: 5 }, to: { row: 3, col: 1 } }, // Bb5 (Pins Nc6 to Ke8)
    ],
    opponentReplies: [
      { from: { row: 1, col: 3 }, to: { row: 2, col: 3 } }, // d7 -> d6
    ],
    explanationOnClear:
      '완벽한 봉쇄! c6 나이트는 움직이는 순간 킹이 노출되는 불법수가 되므로 완전히 묶였습니다. 다음 수에 백은 d4 또는 a4로 나이트를 일방적으로 사냥할 수 있습니다.',
  },
  {
    id: 3,
    number: '제3술',
    title: '피하면 뒤의 보물이 털리는 스큐어 (Skewer)',
    technique: '꼬치구이 공격 (Skewer)',
    bigPicture:
      '핀과 반대로, 가치가 더 높은 킹이나 퀸이 앞에 있고 그 뒤에 룩이나 비숍이 서 있을 때, 직선으로 꿰뚫어 앞의 기물이 도망칠 때 뒤의 기물을 낚아채는 전술입니다.',
    concept: '스큐어는 "앞의 거물을 쫓아내고 뒤의 기물을 잡는" 일명 꼬치구이 전술입니다.',
    tip: 'e1에 있는 백 룩을 e8로 전진시켜 e5의 흑 킹에게 장군(Check)을 부르고 뒤의 e2 흑 룩을 겨냥하세요!',
    rewardAcorns: 70,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][1] = createPiece('k', 'w', 'b1');
      b[7][4] = createPiece('r', 'w', 'e1');
      b[3][4] = createPiece('k', 'b', 'e5');
      b[6][4] = createPiece('r', 'b', 'e2');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 7, col: 4 }, to: { row: 0, col: 4 } }, // Re8 (Check on e5, skewers e2)
    ],
    opponentReplies: [
      { from: { row: 3, col: 4 }, to: { row: 3, col: 3 } }, // Ke5 -> d5
    ],
    explanationOnClear:
      '멋진 스큐어! 흑 킹이 체크를 피하기 위해 e열을 벗어나면, 백 룩은 뒤에 무방비로 남은 흑의 e2 룩을 통쾌하게 포획할 수 있습니다.',
  },
  {
    id: 4,
    number: '제4술',
    title: '길을 열며 터지는 디스커버드 체크 (Discovered Check)',
    technique: '발견된 공격 (Discovered Attack)',
    bigPicture:
      '앞을 막고 있던 내 기물이 자리를 비키면서 뒤에 대기하던 룩이나 퀸의 공격선이 활짝 열려 상대 킹에게 체크가 들어가고, 자리를 비킨 기물은 상대 퀸을 자유롭게 낚아채는 파괴적인 콤비네이션입니다.',
    concept: '움직인 기물과 드러난 기물이 서로 다른 목표물을 동시에 타격합니다.',
    tip: 'd4에 있는 백 나이트를 c6로 도약시켜 숨어있던 백 퀸의 체크를 열고 적 퀸을 공격하세요!',
    rewardAcorns: 75,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'k');
      b[7][3] = createPiece('q', 'w', 'd1');
      b[4][3] = createPiece('n', 'w', 'd4');
      b[0][3] = createPiece('k', 'b', 'd8');
      b[2][6] = createPiece('q', 'b', 'g6');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 4, col: 3 }, to: { row: 2, col: 2 } }, // Nd4 -> c6+ (Discovered check from Qd1 to Kd8)
    ],
    opponentReplies: [
      { from: { row: 0, col: 3 }, to: { row: 0, col: 2 } }, // Kd8 -> c8
    ],
    explanationOnClear:
      '경이로운 수순! 흑 킹이 Qd1의 디스커버드 체크에 걸려 피해야만 하므로, 흑은 g6에 있는 자신의 퀸을 지킬 틈이 없습니다. 다음 수에 백은 흑 퀸을 나이트나 퀸으로 잡을 수 있습니다.',
  },
  {
    id: 5,
    number: '제5술',
    title: '폰 방패 뒤에 갇힌 킹을 처단하는 백랭크 메이트 (Back-Rank Mate)',
    technique: '1열 외통수 (Back-Rank Mate)',
    bigPicture:
      '캐슬링한 상대 폰들이 한 번도 전진하지 않아 킹의 탈출구(루프트 Luft)가 없을 때, 룩이나 퀸으로 8번째 랭크(백랭크)를 침투하여 퇴로가 없는 킹을 일격에 끝장내는 실전 최다 빈출 외통수입니다.',
    concept: '자신의 폰들이 오히려 자신의 킹을 가두는 벽이 되는 순간을 응징합니다.',
    tip: 'd1에 있는 백 룩을 d8 끝까지 침투시켜 탈출로가 없는 흑 킹을 백랭크 메이트로 제압하세요!',
    rewardAcorns: 80,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][6] = createPiece('k', 'w', 'g1');
      b[6][5] = createPiece('p', 'w', 'f2');
      b[6][6] = createPiece('p', 'w', 'g2');
      b[6][7] = createPiece('p', 'w', 'h2');
      b[7][3] = createPiece('r', 'w', 'd1');
      b[0][6] = createPiece('k', 'b', 'g8');
      b[1][5] = createPiece('p', 'b', 'f7');
      b[1][6] = createPiece('p', 'b', 'g7');
      b[1][7] = createPiece('p', 'b', 'h7');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } }, // Rd1 -> d8#
    ],
    opponentReplies: [],
    explanationOnClear:
      '외통수(Checkmate)! f7, g7, h7 폰들에 가로막힌 흑 킹은 d8 룩의 공격을 피할 곳이 단 한 칸도 없어 게임이 즉시 종료되었습니다.',
  },
  {
    id: 6,
    number: '제6술',
    title: '숨 쉴 틈 없이 질식시키는 스모더드 메이트 (Smothered Mate)',
    technique: '질식 메이트 (Smothered Mate)',
    bigPicture:
      '킹이 아군 기물들에 완전히 둘러싸여 한 칸도 움직일 수 없을 때, 다른 기물은 통과하지 못하지만 나이트만이 가볍게 뛰어넘어 킹의 심장을 찌르는 체스 역사상 가장 아름다운 예술적 체크메이트입니다.',
    concept: '자기 기물들에 둘러싸여 질식(Smothered)된 킹을 나이트의 단독 도약으로 처단합니다.',
    tip: 'g5에 있는 백 나이트를 f7 칸으로 도약시켜 흑 킹에게 질식 체크메이트를 선물하세요!',
    rewardAcorns: 100,
    turn: 'w',
    initialBoard: (() => {
      const b = emptyBoard();
      b[7][4] = createPiece('k', 'w', 'e1');
      b[3][6] = createPiece('n', 'w', 'g5');
      b[0][7] = createPiece('k', 'b', 'h8');
      b[0][6] = createPiece('r', 'b', 'g8');
      b[1][7] = createPiece('p', 'b', 'h7');
      b[1][6] = createPiece('p', 'b', 'g7');
      return b;
    })(),
    solutionMoves: [
      { from: { row: 3, col: 6 }, to: { row: 1, col: 5 } }, // Nf7#
    ],
    opponentReplies: [],
    explanationOnClear:
      '예술적인 스모더드 메이트(Smothered Mate)! 흑 킹은 자신의 룩과 폰들에 둘러싸여 꼼짝달싹 못 한 채 나이트의 공격을 받고 장렬히 패배했습니다.',
  },
];
