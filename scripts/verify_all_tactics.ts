import { BEGINNER_QUESTS } from '../src/data/beginnerQuests.ts';
import { ADVANCED_TACTICS } from '../src/data/advancedTactics.ts';
import { getLegalMoves, cloneBoard, isKingInCheck } from '../src/utils/janggiEngine.ts';

console.log('=== VERIFYING BEGINNER QUESTS ===');
for (const q of BEGINNER_QUESTS) {
  let b = cloneBoard(q.initialBoard);
  for (let i = 0; i < q.steps.length; i++) {
    const step = q.steps[i];
    const legal = getLegalMoves(b, step.expectedMove.from.r, step.expectedMove.from.c);
    const isValid = legal.some(m => m.r === step.expectedMove.to.r && m.c === step.expectedMove.to.c);
    if (!isValid) {
      console.error(`[FAIL] Quest ${q.id} Step ${i + 1}: Move from (${step.expectedMove.from.r}, ${step.expectedMove.from.c}) to (${step.expectedMove.to.r}, ${step.expectedMove.to.c}) is ILLEGAL!`);
    } else {
      console.log(`[PASS] Quest ${q.id} Step ${i + 1}`);
    }
  }
}

console.log('\n=== VERIFYING ADVANCED TACTICS ===');
for (const t of ADVANCED_TACTICS) {
  let b = cloneBoard(t.initialBoard);
  for (let i = 0; i < t.steps.length; i++) {
    const step = t.steps[i];
    const legal = getLegalMoves(b, step.expectedMove.from.r, step.expectedMove.from.c);
    const isValid = legal.some(m => m.r === step.expectedMove.to.r && m.c === step.expectedMove.to.c);
    if (!isValid) {
      console.error(`[FAIL] Tactic ${t.id} Step ${i + 1}: Player move from (${step.expectedMove.from.r}, ${step.expectedMove.from.c}) to (${step.expectedMove.to.r}, ${step.expectedMove.to.c}) is ILLEGAL!`);
    } else {
      console.log(`[PASS] Tactic ${t.id} Step ${i + 1} Player Move`);
    }

    // Execute player move
    b[step.expectedMove.to.r][step.expectedMove.to.c] = b[step.expectedMove.from.r][step.expectedMove.from.c];
    b[step.expectedMove.from.r][step.expectedMove.from.c] = null;

    if (step.opponentResponse) {
      const oppLegal = getLegalMoves(b, step.opponentResponse.from.r, step.opponentResponse.from.c);
      const isOppValid = oppLegal.some(m => m.r === step.opponentResponse!.to.r && m.c === step.opponentResponse!.to.c);
      if (!isOppValid) {
        console.error(`[FAIL] Tactic ${t.id} Step ${i + 1}: Opponent move from (${step.opponentResponse.from.r}, ${step.opponentResponse.from.c}) to (${step.opponentResponse.to.r}, ${step.opponentResponse.to.c}) is ILLEGAL!`);
      } else {
        console.log(`[PASS] Tactic ${t.id} Step ${i + 1} Opponent Move`);
      }
      b[step.opponentResponse.to.r][step.opponentResponse.to.c] = b[step.opponentResponse.from.r][step.opponentResponse.from.c];
      b[step.opponentResponse.from.r][step.opponentResponse.from.c] = null;
    }
  }
}
