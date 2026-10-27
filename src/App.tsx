import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Flame,
  Bot,
  Sliders,
  User,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  BoardState,
  BoardTheme,
  ChessPiece,
  GameState,
  Move,
  PieceColor,
  PieceType,
  Position,
  RankLevel,
} from './types/chess';
import {
  createInitialBoard,
  createInitialGameState,
  executeMoveOnBoard,
  findKing,
  getAllLegalMoves,
  getLegalMovesForPosition,
  getPieceNameByLang,
  isKingInCheck,
  makeMove,
  posToAlgebraic,
  validateMoveAttempt,
} from './utils/chessEngine';
import {
  RANK_LEVELS,
  selectAIMove,
  generateCoachHint,
} from './utils/aiEngine';
import { soundManager } from './utils/soundEffects';
import { BEGINNER_QUESTS } from './data/beginnerQuests';
import { ADVANCED_TACTICS } from './data/advancedTactics';

import { Header } from './components/Header';
import { Language } from './types/chess';
import { translations } from './i18n/translations';
import { ChessBoard } from './components/ChessBoard';
import { QuestPanel } from './components/QuestPanel';
import { TacticsPanel } from './components/TacticsPanel';
import { AIMatchPanel } from './components/AIMatchPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { TermsNoticeModal } from './components/TermsNoticeModal';
import { AboutModal } from './components/AboutModal';
import { RankCertificateModal } from './components/RankCertificateModal';

type ActiveTab = 'quests' | 'tactics' | 'aimatch' | 'analysis' | 'profile';

export const App: React.FC = () => {
  // Navigation & View
  const [activeTab, setActiveTab] = useState<ActiveTab>('quests');
  const [isMobileView, setIsMobileView] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('dotori_lang') as Language;
    return saved && ['ko', 'en', 'ja', 'zh'].includes(saved) ? saved : 'ko';
  });

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('dotori_lang', newLang);
  };
  const [isMuted, setIsMuted] = useState(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('royal-wood');
  const [isFlipped, setIsFlipped] = useState(false);

  // Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMandatoryTerms, setIsMandatoryTerms] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certRankName, setCertRankName] = useState('15급 (새싹 도토리)');

  // Acorns & Profile stats (persisted)
  const [acorns, setAcorns] = useState<number>(() => {
    return parseInt(localStorage.getItem('dotori_chess_acorns') || '100', 10);
  });
  const [completedQuests, setCompletedQuests] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dotori_chess_quests') || '[]');
    } catch {
      return [];
    }
  });
  const [completedTactics, setCompletedTactics] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dotori_chess_tactics') || '[]');
    } catch {
      return [];
    }
  });
  const [matchStats, setMatchStats] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('dotori_chess_stats') ||
          JSON.stringify({ wins: 0, losses: 0, draws: 0 })
      );
    } catch {
      return { wins: 0, losses: 0, draws: 0 };
    }
  });
  const [highestRank, setHighestRank] = useState<string>(() => {
    return localStorage.getItem('dotori_chess_rank') || '18급 (새싹 도토리)';
  });

  // Game States
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Position;
    to: Position;
  } | null>(null);
  const [coachHint, setCoachHint] = useState<string | null>(null);
  const [coachWarning, setCoachWarning] = useState<{
    message: string;
    timestamp: number;
    threatenedKingPos?: Position;
  } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Auto-dismiss coach warning toast after 4 seconds
  useEffect(() => {
    if (!coachWarning) return;
    const timer = setTimeout(() => {
      setCoachWarning(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [coachWarning]);

  // Quest Mode State
  const [currentQuest, setCurrentQuest] = useState(BEGINNER_QUESTS[0]);
  const [isQuestCleared, setIsQuestCleared] = useState(false);

  // Tactics Mode State
  const [currentTactic, setCurrentTactic] = useState(ADVANCED_TACTICS[0]);
  const [tacticStep, setTacticStep] = useState(0);
  const [isTacticCleared, setIsTacticCleared] = useState(false);

  // AI Match Level
  const [selectedAILevel, setSelectedAILevel] = useState<RankLevel>(RANK_LEVELS[0]);

  // First Launch Terms Detection (Mandatory per dotori-use_notice_instruction.md)
  useEffect(() => {
    const agreed = localStorage.getItem('dotori_terms_agreed');
    if (agreed !== 'true') {
      setIsMandatoryTerms(true);
      setShowTermsModal(true);
    }
  }, []);

  const handleAgreeTerms = () => {
    localStorage.setItem('dotori_terms_agreed', 'true');
    setShowTermsModal(false);
    setIsMandatoryTerms(false);
  };

  // Sync Acorns & Progress
  useEffect(() => {
    localStorage.setItem('dotori_chess_acorns', acorns.toString());
  }, [acorns]);

  useEffect(() => {
    localStorage.setItem('dotori_chess_quests', JSON.stringify(completedQuests));
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem('dotori_chess_tactics', JSON.stringify(completedTactics));
  }, [completedTactics]);

  useEffect(() => {
    localStorage.setItem('dotori_chess_stats', JSON.stringify(matchStats));
  }, [matchStats]);

  useEffect(() => {
    localStorage.setItem('dotori_chess_rank', highestRank);
  }, [highestRank]);

  // Initialize board depending on active tab
  useEffect(() => {
    if (activeTab === 'quests') {
      loadQuest(currentQuest);
    } else if (activeTab === 'tactics') {
      loadTactic(currentTactic);
    } else if (activeTab === 'aimatch') {
      setGameState(createInitialGameState());
      setSelectedPos(null);
      setLegalMoves([]);
      setCoachHint(null);
    } else if (activeTab === 'analysis') {
      setGameState(createInitialGameState());
      setSelectedPos(null);
      setLegalMoves([]);
      setCoachHint(null);
    }
  }, [activeTab]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // Reset progress
  const handleResetProgress = () => {
    if (window.confirm('모든 퀘스트 및 전술 학습 진도, 도토리 코인을 초기화하시겠습니까?')) {
      setAcorns(100);
      setCompletedQuests([]);
      setCompletedTactics([]);
      setMatchStats({ wins: 0, losses: 0, draws: 0 });
      setHighestRank('18급 (새싹 도토리)');
      localStorage.removeItem('dotori_chess_quests');
      localStorage.removeItem('dotori_chess_tactics');
      localStorage.removeItem('dotori_chess_stats');
      localStorage.removeItem('dotori_chess_rank');
      localStorage.setItem('dotori_chess_acorns', '100');
      alert('학습 데이터가 초기화되었습니다.');
    }
  };

  // --- QUEST MODE LOGIC ---
  const loadQuest = (quest = currentQuest) => {
    setCurrentQuest(quest);
    setIsQuestCleared(false);
    setSelectedPos(null);
    setLegalMoves([]);
    setCoachHint(null);

    const initialG: GameState = {
      board: quest.initialBoard,
      turn: quest.turn,
      castlingRights: {
        w: { kingside: true, queenside: true },
        b: { kingside: true, queenside: true },
      },
      enPassantTarget: quest.id === 9 ? { row: 2, col: 5 } : null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      moveHistory: [],
      capturedWhite: [],
      capturedBlack: [],
    };
    setGameState(initialG);
  };

  const handleQuestSuccess = () => {
    setIsQuestCleared(true);
    soundManager.playSuccess();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    if (!completedQuests.includes(currentQuest.id)) {
      setCompletedQuests(prev => [...prev, currentQuest.id]);
      setAcorns(prev => prev + currentQuest.rewardAcorns);
    }
  };

  const handleNextQuest = () => {
    const idx = BEGINNER_QUESTS.findIndex(q => q.id === currentQuest.id);
    if (idx < BEGINNER_QUESTS.length - 1) {
      loadQuest(BEGINNER_QUESTS[idx + 1]);
    }
  };

  // --- TACTICS MODE LOGIC ---
  const loadTactic = (tactic = currentTactic) => {
    setCurrentTactic(tactic);
    setTacticStep(0);
    setIsTacticCleared(false);
    setSelectedPos(null);
    setLegalMoves([]);
    setCoachHint(null);

    const initialG: GameState = {
      board: tactic.initialBoard,
      turn: tactic.turn,
      castlingRights: {
        w: { kingside: true, queenside: true },
        b: { kingside: true, queenside: true },
      },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      moveHistory: [],
      capturedWhite: [],
      capturedBlack: [],
    };
    setGameState(initialG);
  };

  const handleTacticSuccess = () => {
    setIsTacticCleared(true);
    soundManager.playSuccess();
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });

    if (!completedTactics.includes(currentTactic.id)) {
      setCompletedTactics(prev => [...prev, currentTactic.id]);
      setAcorns(prev => prev + currentTactic.rewardAcorns);
    }
  };

  const handleNextTactic = () => {
    const idx = ADVANCED_TACTICS.findIndex(t => t.id === currentTactic.id);
    if (idx < ADVANCED_TACTICS.length - 1) {
      loadTactic(ADVANCED_TACTICS[idx + 1]);
    }
  };

  // --- AI MATCH LOGIC ---
  const handleAIMoveExecution = (currentState: GameState) => {
    if (currentState.isCheckmate || currentState.isDraw || currentState.isStalemate) return;
    if (currentState.turn !== 'b') return;

    setAiThinking(true);

    setTimeout(() => {
      const { move } = selectAIMove(currentState, selectedAILevel.id);
      setAiThinking(false);

      if (move) {
        const nextState = makeMove(currentState, move);
        setGameState(nextState);

        if (move.captured || move.isEnPassant) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        if (nextState.isCheckmate) {
          soundManager.playCheckmate();
          if (nextState.winner === 'b') {
            setMatchStats((prev: { wins: number; losses: number; draws: number }) => ({
              ...prev,
              losses: prev.losses + 1,
            }));
          }
        } else if (nextState.isCheck) {
          soundManager.playCheck();
        } else if (nextState.isDraw || nextState.isStalemate) {
          setMatchStats((prev: { wins: number; losses: number; draws: number }) => ({
            ...prev,
            draws: prev.draws + 1,
          }));
        }
      }
    }, 450);
  };

  // Execute a verified legal move
  const applyMove = (move: Move) => {
    // 1. In Quest Mode
    if (activeTab === 'quests') {
      const target = currentQuest.targetMove;
      const isExpected =
        move.from.row === target.from.row &&
        move.from.col === target.from.col &&
        move.to.row === target.to.row &&
        move.to.col === target.to.col;

      const nextState = makeMove(gameState, move);
      setGameState(nextState);

      if (move.captured || move.isEnPassant) soundManager.playCapture();
      else soundManager.playMove();

      if (isExpected) {
        handleQuestSuccess();
      }
      setSelectedPos(null);
      setLegalMoves([]);
      return;
    }

    // 2. In Tactics Mode
    if (activeTab === 'tactics') {
      const expected = currentTactic.solutionMoves[tacticStep];
      const isExpected =
        expected &&
        move.from.row === expected.from.row &&
        move.from.col === expected.from.col &&
        move.to.row === expected.to.row &&
        move.to.col === expected.to.col;

      const nextState = makeMove(gameState, move);
      setGameState(nextState);

      if (move.captured || move.isEnPassant) soundManager.playCapture();
      else soundManager.playMove();

      setSelectedPos(null);
      setLegalMoves([]);

      if (isExpected) {
        // Check if more steps or opponent reply
        const reply = currentTactic.opponentReplies[tacticStep];
        if (reply) {
          setTimeout(() => {
            const oppLegalMoves = getLegalMovesForPosition(nextState, reply.from);
            const chosen = oppLegalMoves.find(
              m => m.to.row === reply.to.row && m.to.col === reply.to.col
            );
            if (chosen) {
              const replyState = makeMove(nextState, chosen);
              setGameState(replyState);
              if (chosen.captured) soundManager.playCapture();
              else soundManager.playMove();
            }
            setTacticStep(prev => prev + 1);
          }, 400);
        } else {
          // Finished!
          handleTacticSuccess();
        }
      } else {
        alert('다른 수입니다! 전술의 핵심 목표를 생각하며 다시 시도해 보세요.');
      }
      return;
    }

    // 3. In AI Match / Analysis Mode
    const nextState = makeMove(gameState, move);
    setGameState(nextState);
    setSelectedPos(null);
    setLegalMoves([]);

    if (move.captured || move.isEnPassant) {
      soundManager.playCapture();
    } else {
      soundManager.playMove();
    }

    if (nextState.isCheckmate) {
      soundManager.playCheckmate();
      if (nextState.winner === 'w') {
        // Player won!
        setMatchStats((prev: { wins: number; losses: number; draws: number }) => ({
          ...prev,
          wins: prev.wins + 1,
        }));
        setAcorns((prev: number) => prev + 150);
        setCertRankName(selectedAILevel.title.split(' ')[0]);
        setHighestRank(selectedAILevel.title);
        setShowCertModal(true);
      }
    } else if (nextState.isCheck) {
      soundManager.playCheck();
    }

    if (activeTab === 'aimatch' && nextState.turn === 'b') {
      handleAIMoveExecution(nextState);
    }
  };

  // Handle Board Square Click
  const handleSquareClick = (pos: Position) => {
    // If pending promotion is open, ignore
    if (pendingPromotion) return;

    // If waiting for AI, ignore
    if (aiThinking) return;

    // 1. Check if clicked square is one of legal move targets
    const targetMove = legalMoves.find(
      m => m.to.row === pos.row && m.to.col === pos.col
    );

    if (targetMove && selectedPos) {
      setCoachWarning(null);

      // Check for promotion trigger
      const movingPiece = gameState.board[selectedPos.row][selectedPos.col];
      const isPawnPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && pos.row === 0) ||
          (movingPiece.color === 'b' && pos.row === 7));

      if (isPawnPromotion && !targetMove.promotion) {
        setPendingPromotion({ from: selectedPos, to: pos });
        return;
      }

      applyMove(targetMove);
      return;
    }

    // 2. Clicked a square that is NOT a legal move target while a piece was selected
    const clickedPiece = gameState.board[pos.row][pos.col];

    if (selectedPos) {
      // If user clicked the same piece again, deselect
      if (selectedPos.row === pos.row && selectedPos.col === pos.col) {
        setSelectedPos(null);
        setLegalMoves([]);
        setCoachWarning(null);
        return;
      }

      // If user clicked another piece of their own turn color, switch selection to it
      if (clickedPiece && clickedPiece.color === gameState.turn) {
        setSelectedPos(pos);
        const moves = getLegalMovesForPosition(gameState, pos);
        setLegalMoves(moves);

        // If newly selected piece has 0 moves, check why and warn
        if (moves.length === 0) {
          const evalRes = validateMoveAttempt(gameState, pos, undefined, lang);
          if (!evalRes.allowed && evalRes.message) {
            setCoachWarning({
              message: evalRes.message,
              timestamp: Date.now(),
              threatenedKingPos: evalRes.threatenedKingPos,
            });
            soundManager.playWarning();
          }
        } else {
          setCoachWarning(null);
        }
        return;
      }

      // User tried to move selected piece to an invalid/illegal destination square
      const validation = validateMoveAttempt(gameState, selectedPos, pos, lang);
      if (!validation.allowed && validation.message) {
        setCoachWarning({
          message: validation.message,
          timestamp: Date.now(),
          threatenedKingPos: validation.threatenedKingPos,
        });
        soundManager.playWarning();
        return; // Keep piece selected so user understands what happened!
      }
    }

    // 3. Selecting a piece for the first time
    if (clickedPiece && clickedPiece.color === gameState.turn) {
      setSelectedPos(pos);
      const moves = getLegalMovesForPosition(gameState, pos);
      setLegalMoves(moves);

      if (moves.length === 0) {
        const evalRes = validateMoveAttempt(gameState, pos, undefined, lang);
        if (!evalRes.allowed && evalRes.message) {
          setCoachWarning({
            message: evalRes.message,
            timestamp: Date.now(),
            threatenedKingPos: evalRes.threatenedKingPos,
          });
          soundManager.playWarning();
        }
      } else {
        setCoachWarning(null);
      }
    } else {
      setSelectedPos(null);
      setLegalMoves([]);
      setCoachWarning(null);
    }
  };

  const handleSelectPromotion = (promo: PieceType) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);

    const moves = getLegalMovesForPosition(gameState, from);
    const chosen = moves.find(
      m => m.to.row === to.row && m.to.col === to.col && m.promotion === promo
    );

    if (chosen) {
      applyMove(chosen);
    }
  };

  // Undo move
  const handleUndoMove = () => {
    if (gameState.moveHistory.length < 2) return;
    // Undo both AI move and Player move
    const newHistory = gameState.moveHistory.slice(0, -2);
    let state = createInitialGameState();
    for (const m of newHistory) {
      state = makeMove(state, m);
    }
    setGameState(state);
    setSelectedPos(null);
    setLegalMoves([]);
    soundManager.playMove();
  };

  // Resign
  const handleResign = () => {
    if (window.confirm('기권하고 패배를 인정하시겠습니까?')) {
      const ended: GameState = {
        ...gameState,
        isCheckmate: true,
        winner: gameState.turn === 'w' ? 'b' : 'w',
      };
      setGameState(ended);
      setMatchStats((prev: { wins: number; losses: number; draws: number }) => ({
        ...prev,
        losses: prev.losses + 1,
      }));
    }
  };

  // Coach Hint
  const handleShowCoachHint = () => {
    const hint = generateCoachHint(gameState);
    if (hint.move) {
      setCoachHint(hint.explanation);
      setSelectedPos(hint.move.from);
      setLegalMoves([hint.move]);
    } else {
      setCoachHint(hint.explanation);
    }
  };

  // New Game Trigger
  const handleNewGame = () => {
    setGameState(createInitialGameState());
    setSelectedPos(null);
    setLegalMoves([]);
    setCoachHint(null);
    if (activeTab === 'quests') loadQuest(currentQuest);
    if (activeTab === 'tactics') loadTactic(currentTactic);
  };

  const kingPosInCheck = gameState.isCheck ? findKing(gameState.board, gameState.turn) : null;
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1] || null;

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-[#13172a] via-[#0d101d] to-[#080913] text-gray-100 overflow-hidden font-sans select-none relative">
      {/* Background Radial Glow Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[45vw] h-[45vw] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Mandatory Common Header */}
      <Header
        isMobileView={isMobileView}
        setIsMobileView={setIsMobileView}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onOpenTerms={() => {
          setIsMandatoryTerms(false);
          setShowTermsModal(true);
        }}
        onOpenAbout={() => setShowAboutModal(true)}
        onResetProgress={handleResetProgress}
        onNewGame={handleNewGame}
        aiThinking={aiThinking}
        acorns={acorns}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Main Container: Desktop Split-View OR Smartphone Simulation View */}
      <div className="flex-1 flex overflow-hidden p-1.5 sm:p-2.5 lg:p-4 gap-2 lg:gap-4 justify-center items-center">
        {/* Smartphone Simulation Wrapper */}
        <div
          className={`flex-1 flex flex-col lg:flex-row h-full max-w-[1440px] transition-all duration-300 ${
            isMobileView
              ? 'max-w-[420px] h-[94vh] my-auto bg-[#131627] border-4 border-[#333752] rounded-[48px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden relative'
              : 'w-full'
          }`}
        >
          {/* Smartphone Top Dynamic Island Notch (Only in Mobile View) */}
          {isMobileView && (
            <div className="w-full flex justify-center py-1.5 shrink-0 bg-transparent z-30">
              <div className="w-24 h-4 bg-black/90 rounded-full border border-white/10 flex items-center justify-end px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
              </div>
            </div>
          )}

          {/* Left / Center: Board Viewport (Never squashed, always properly sized) */}
          <div className="w-full lg:flex-1 shrink-0 lg:shrink flex flex-col items-center justify-center p-1.5 sm:p-2 lg:p-4 lg:overflow-y-auto custom-scrollbar">
            <ChessBoard
              board={gameState.board}
              selectedPos={selectedPos}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isCheck={gameState.isCheck}
              kingPosInCheck={kingPosInCheck}
              isFlipped={isFlipped}
              theme={boardTheme}
              interactive={!aiThinking}
              onSquareClick={handleSquareClick}
              pendingPromotion={pendingPromotion}
              onSelectPromotion={handleSelectPromotion}
              coachWarning={coachWarning}
            />

            {/* Turn & High-Visibility Last Move Status Strip */}
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 px-3.5 py-2 glass-panel rounded-xl w-[min(88vw,calc(46vh-30px),380px)] sm:w-[min(80vw,calc(50vh-20px),440px)] lg:w-[460px] xl:w-[500px] border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    gameState.turn === 'w'
                      ? 'bg-white border-amber-300 shadow-[0_0_10px_white]'
                      : 'bg-gray-950 border-gray-400 shadow-[0_0_10px_rgba(0,0,0,0.9)]'
                  }`}
                />
                <span className="text-xs font-extrabold text-white">
                  {gameState.turn === 'w' ? '백(White) 차례' : '흑(Black) 차례'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold">
                  {gameState.fullmoveNumber}수
                </span>
              </div>

              {/* Prominent High-Visibility Last Move Pill */}
              {lastMove ? (
                <div className="flex items-center gap-1.5 text-xs bg-amber-400/20 border border-amber-400/50 px-2.5 py-1 rounded-lg text-amber-200 font-medium">
                  <span className="text-[10px] font-bold text-amber-400">최근 착수:</span>
                  <span className="font-extrabold text-yellow-300">
                    {lastMove.piece.color === 'w' ? '백' : '흑'} {getPieceNameByLang(lastMove.piece.type, lang)}
                  </span>
                  <span className="font-mono text-white font-bold">
                    {posToAlgebraic(lastMove.from)} ➔ {posToAlgebraic(lastMove.to)}
                  </span>
                  {gameState.moveHistory.length > 0 && (
                    <span className="font-mono text-[11px] font-black text-black bg-yellow-300 px-1.5 py-0.2 rounded shadow-sm">
                      {gameState.moveHistory[gameState.moveHistory.length - 1].san}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 italic">
                  대국 준비 완료
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Active Tab Controls & Bottom Navigation */}
          <div
            className={`flex flex-col bg-[#14172a]/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/15 min-h-0 ${
              isMobileView
                ? 'w-full flex-1'
                : 'w-full flex-1 lg:flex-initial lg:w-[420px] xl:w-[460px] lg:h-full'
            }`}
          >
            {/* Tab Panel Content (Scrollable) */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar">
              {activeTab === 'quests' && (
                <QuestPanel
                  currentQuest={currentQuest}
                  completedQuests={completedQuests}
                  onSelectQuest={loadQuest}
                  onResetQuest={() => loadQuest(currentQuest)}
                  onShowHint={handleShowCoachHint}
                  isCleared={isQuestCleared}
                  onNextQuest={handleNextQuest}
                />
              )}

              {activeTab === 'tactics' && (
                <TacticsPanel
                  currentTactic={currentTactic}
                  completedTactics={completedTactics}
                  onSelectTactic={loadTactic}
                  onResetTactic={() => loadTactic(currentTactic)}
                  onShowHint={handleShowCoachHint}
                  isCleared={isTacticCleared}
                  onNextTactic={handleNextTactic}
                  stepIndex={tacticStep}
                />
              )}

              {activeTab === 'aimatch' && (
                <AIMatchPanel
                  gameState={gameState}
                  selectedLevel={selectedAILevel}
                  onSelectLevel={lvl => {
                    setSelectedAILevel(lvl);
                    handleNewGame();
                  }}
                  onUndoMove={handleUndoMove}
                  onResign={handleResign}
                  onShowHint={handleShowCoachHint}
                  coachHint={coachHint}
                  boardTheme={boardTheme}
                  setBoardTheme={setBoardTheme}
                  isFlipped={isFlipped}
                  setIsFlipped={setIsFlipped}
                  onShowCertificate={() => {
                    setCertRankName(selectedAILevel.title.split(' ')[0]);
                    setShowCertModal(true);
                  }}
                  playerColor="w"
                />
              )}

              {activeTab === 'analysis' && (
                <AnalysisPanel
                  gameState={gameState}
                  onResetBoard={() => setGameState(createInitialGameState())}
                  onClearBoard={() =>
                    setGameState({
                      ...createInitialGameState(),
                      board: Array(8)
                        .fill(null)
                        .map(() => Array(8).fill(null)),
                    })
                  }
                  onLoadFEN={fen => {
                    alert('FEN이 적용되었습니다.');
                  }}
                  onCoachHint={handleShowCoachHint}
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePanel
                  acorns={acorns}
                  completedQuests={completedQuests}
                  completedTactics={completedTactics}
                  matchStats={matchStats}
                  highestRank={highestRank}
                  onOpenCertificate={() => {
                    setCertRankName(highestRank);
                    setShowCertModal(true);
                  }}
                />
              )}
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="p-2 bg-[#090a10]/95 border-t border-white/10 grid grid-cols-5 gap-1 shrink-0">
              {[
                { id: 'quests' as ActiveTab, label: '입문 퀘스트', icon: Trophy },
                { id: 'tactics' as ActiveTab, label: '고급 전술', icon: Flame },
                { id: 'aimatch' as ActiveTab, label: 'AI 급수전', icon: Bot },
                { id: 'analysis' as ActiveTab, label: '자유 분석', icon: Sliders },
                { id: 'profile' as ActiveTab, label: '내 프로필', icon: User },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition cursor-pointer relative ${
                      isActive
                        ? 'text-pink-400 font-bold bg-white/5'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                    )}
                    <Icon size={18} className="mb-1" />
                    <span className="text-[10px] truncate max-w-full">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mandatory Terms & Notice Modal */}
      <TermsNoticeModal
        isOpen={showTermsModal}
        onAgree={handleAgreeTerms}
        isMandatoryFirstLaunch={isMandatoryTerms}
        onClose={() => setShowTermsModal(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onOpenTerms={() => {
          setIsMandatoryTerms(false);
          setShowTermsModal(true);
        }}
      />

      {/* Official Certificate Modal */}
      <RankCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        rankName={certRankName}
        playerName="체스 수련자"
      />
    </div>
  );
};

export default App;
