import { BoardState, Piece, Quest, TacticPuzzle } from '../src/types/janggi.ts';
import { createEmptyBoard, getPieceLabel, getLegalMoves, cloneBoard, isKingInCheck } from '../src/utils/janggiEngine.ts';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

// Test Quest 3
function testQ3(): Quest {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1'); // King at bottom center
  b[9][3] = p('cho', 'guard', 'c-g-1'); // Guard at corner
  b[1][4] = p('han', 'king', 'h-k-1');
  return {
    id: 'quest-3',
    title: '제3관: 사(士)의 대각선 호위',
    badge: '철벽의 사',
    category: 'pieces',
    description: '',
    acornReward: 15,
    initialBoard: b,
    turn: 'cho',
    objective: '',
    tip: '',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 9, c: 3 }, to: { r: 8, c: 4 } },
        feedbackSuccess: '',
        feedbackFail: '',
      }
    ]
  };
}

// Test Tactic 1
function testT1(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[3][4] = p('han', 'horse', 'h-m-1'); // Horse at (3, 4)
  b[5][4] = p('cho', 'soldier', 'c-s-1'); // Soldier at (5, 4)
  b[7][4] = p('cho', 'cannon', 'c-c-1');  // Cannon at (7, 4)
  return {
    id: 'tactic-1',
    title: '',
    level: '중급',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 5, c: 4 }, to: { r: 4, c: 4 } },
        opponentResponse: { from: { r: 1, c: 4 }, to: { r: 1, c: 5 }, commentary: '' },
        explanation: ''
      },
      {
        instruction: '',
        expectedMove: { from: { r: 7, c: 4 }, to: { r: 3, c: 4 } },
        explanation: ''
      }
    ]
  };
}

// Test Tactic 2: 양차 합세 작전
function testT2(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[3][0] = p('han', 'soldier', 'h-s-1'); // Target flank pawn
  b[3][3] = p('cho', 'chariot', 'c-r-1');  // Horizontal Chariot
  b[7][0] = p('cho', 'chariot', 'c-r-2');  // Vertical Chariot
  return {
    id: 'tactic-2',
    title: '',
    level: '고급',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 7, c: 0 }, to: { r: 4, c: 0 } },
        opponentResponse: { from: { r: 0, c: 3 }, to: { r: 1, c: 4 }, commentary: '' },
        explanation: ''
      },
      {
        instruction: '',
        expectedMove: { from: { r: 4, c: 0 }, to: { r: 3, c: 0 } },
        explanation: ''
      }
    ]
  };
}

// Test Tactic 3: 차의 절대 핀 봉쇄술
function testT3(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[1][2] = p('han', 'horse', 'h-m-1'); // Pinned piece
  b[0][5] = p('han', 'guard', 'h-g-1');
  b[3][0] = p('cho', 'chariot', 'c-r-1');
  b[2][2] = p('cho', 'soldier', 'c-s-1');
  return {
    id: 'tactic-3',
    title: '',
    level: '고급',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 0 } },
        opponentResponse: { from: { r: 0, c: 5 }, to: { r: 0, c: 4 }, commentary: '' },
        explanation: ''
      },
      {
        instruction: '',
        expectedMove: { from: { r: 2, c: 2 }, to: { r: 1, c: 2 } },
        explanation: ''
      }
    ]
  };
}

// Test Tactic 4: 상의 길 열기 (포격 길목 개척)
function testT4(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[1][4] = p('han', 'king', 'h-k-1');
  b[3][2] = p('han', 'chariot', 'h-r-1');
  b[5][2] = p('cho', 'soldier', 'c-s-1'); // bridge
  b[7][2] = p('cho', 'elephant', 'c-e-1'); // elephant to leap away
  b[8][2] = p('cho', 'cannon', 'c-c-1');   // cannon behind
  return {
    id: 'tactic-4',
    title: '',
    level: '고급',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 7, c: 2 }, to: { r: 5, c: 5 } },
        opponentResponse: { from: { r: 1, c: 4 }, to: { r: 0, c: 4 }, commentary: '' },
        explanation: ''
      },
      {
        instruction: '',
        expectedMove: { from: { r: 8, c: 2 }, to: { r: 3, c: 2 } },
        explanation: ''
      }
    ]
  };
}

// Test Tactic 5: 궁성 사선 차장 & 외통수
function testT5(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[0][4] = p('han', 'king', 'h-k-1');
  b[0][3] = p('han', 'guard', 'h-g-1');
  b[0][5] = p('han', 'guard', 'h-g-2');
  b[1][3] = p('cho', 'soldier', 'c-s-1');
  b[1][5] = p('cho', 'soldier', 'c-s-2');
  b[4][4] = p('cho', 'chariot', 'c-r-1');
  return {
    id: 'tactic-5',
    title: '',
    level: '마스터',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 4, c: 4 }, to: { r: 1, c: 4 } },
        explanation: ''
      }
    ]
  };
}

// Test Tactic 6: 마장·차장 양수겸장 외통수 (Discovered Double Check)
function testT6(): TacticPuzzle {
  const b = createEmptyBoard();
  b[9][4] = p('cho', 'king', 'c-k-1');
  b[0][5] = p('han', 'king', 'h-k-1');   // Han King at corner of palace
  b[0][4] = p('han', 'guard', 'h-g-1');  // Guard blocking palace
  b[1][5] = p('han', 'guard', 'h-g-2');  // Guard blocking retreat
  b[1][0] = p('cho', 'chariot', 'c-r-1'); // Chariot aiming along row 1
  b[1][3] = p('cho', 'horse', 'c-h-1');   // Horse currently on row 1 (masking Chariot)
  // When horse moves from (1, 3):
  // 1 step up to (0, 3) (empty), 1 step diag to (0, 5) -> HORSE CHECKS KING!
  // And with horse gone from (1, 3), Chariot on row 1 checks across line 1!
  return {
    id: 'tactic-6',
    title: '',
    level: '마스터',
    category: '',
    summary: '',
    strategicConcept: '',
    initialBoard: b,
    turn: 'cho',
    steps: [
      {
        instruction: '',
        expectedMove: { from: { r: 1, c: 3 }, to: { r: 0, c: 5 } }, // captures or jumps? Wait, (0, 5) has King!
        // In Janggi, Horse from (1, 3): 1 step orthogonal right (1, 4), then diag to (0, 5) or 1 step up (0, 3)?
        // Wait, from (2, 4) to (1, 4) then diag to (0, 5) checks King from (2, 4)?
        explanation: ''
      }
    ]
  };
}

console.log('--- TEST RUN ---');
const tests = [testQ3(), testT1(), testT2(), testT3(), testT4(), testT5()];
for (const t of tests) {
  let b = cloneBoard(t.initialBoard);
  for (let i = 0; i < t.steps.length; i++) {
    const s = t.steps[i];
    const legal = getLegalMoves(b, s.expectedMove.from.r, s.expectedMove.from.c);
    const ok = legal.some(m => m.r === s.expectedMove.to.r && m.c === s.expectedMove.to.c);
    console.log(`${t.id} Step ${i + 1}: ${ok ? 'VALID' : 'INVALID'}`);
    if (!ok) console.log('Legal moves were:', legal);
    b[s.expectedMove.to.r][s.expectedMove.to.c] = b[s.expectedMove.from.r][s.expectedMove.from.c];
    b[s.expectedMove.from.r][s.expectedMove.from.c] = null;
    if (s.opponentResponse) {
      const oppLegal = getLegalMoves(b, s.opponentResponse.from.r, s.opponentResponse.from.c);
      const oppOk = oppLegal.some(m => m.r === s.opponentResponse!.to.r && m.c === s.opponentResponse!.to.c);
      console.log(`${t.id} Step ${i + 1} Opponent: ${oppOk ? 'VALID' : 'INVALID'}`);
      if (!oppOk) console.log('Opp legal moves were:', oppLegal);
      b[s.opponentResponse.to.r][s.opponentResponse.to.c] = b[s.opponentResponse.from.r][s.opponentResponse.from.c];
      b[s.opponentResponse.from.r][s.opponentResponse.from.c] = null;
    }
  }
}
