import React, { useState, useEffect, useRef } from 'react';
import {
  AIRankTier,
  BoardState,
  FormationType,
  Move,
  Piece,
  Position,
  Quest,
  Side,
  TacticPuzzle,
  UserProfile,
  PieceTheme,
  Language,
} from './types/janggi';
import { BEGINNER_QUESTS } from './data/beginnerQuests';
import { ADVANCED_TACTICS } from './data/advancedTactics';
import {
  cloneBoard,
  generateNotation,
  getInitialBoard,
  getLegalMoves,
  isKingInCheck,
  getAllLegalMoves,
} from './utils/janggiEngine';
import { getBestAIMove, getEducationalHint, AI_RANK_TIERS } from './utils/aiEngine';
import { sound } from './utils/soundEffects';
import { Header } from './components/Header';
import { TermsNoticeModal } from './components/TermsNoticeModal';
import { JanggiBoard } from './components/JanggiBoard';
import { QuestPanel } from './components/QuestPanel';
import { TacticsPanel } from './components/TacticsPanel';
import { AIMatchPanel } from './components/AIMatchPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { RankCertificateModal } from './components/RankCertificateModal';
import { MatchResultModal } from './components/MatchResultModal';
import { PieceThemeModal } from './components/PieceThemeModal';
import { MiniGamesPanel } from './components/MiniGamesPanel';
import { translations } from './i18n/translations';
import { BookOpen, Zap, Swords, User, Trophy, ShieldAlert, Gamepad2 } from 'lucide-react';

declare const __APP_VERSION__: string;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'DJL-20261017_2214';

type TabMode = 'quest' | 'tactic' | 'aimatch' | 'minigames' | 'profile';

const INITIAL_PROFILE: UserProfile = {
  ratingTier: '18k',
  ratingGrade: '18급 (새싹 도토리)',
  ratingPoints: 100,
  acorns: 50,
  clearedQuests: [],
  clearedTactics: [],
  matchHistory: [],
};

export const App: React.FC = () => {
  // Localization & Theme State
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('djl_lang') as Language;
    if (saved && ['ko', 'en', 'ja', 'zh'].includes(saved)) return saved;
    return 'ko';
  });
  const t = translations[lang] || translations.ko;

  const [pieceTheme, setPieceTheme] = useState<PieceTheme>(() => {
    const saved = localStorage.getItem('djl_piece_theme') as PieceTheme;
    if (saved && ['chess-classic', 'chess-modern', 'wood', 'crystal', 'modern'].includes(saved)) return saved;
    return 'chess-classic';
  });

  const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('djl_lang', newLang);
  };

  const handleChangePieceTheme = (newTheme: PieceTheme) => {
    setPieceTheme(newTheme);
    localStorage.setItem('djl_piece_theme', newTheme);
  };

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<TabMode>('quest');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('도토리 장기 엔진 준비 완료');
  const [isThinking, setIsThinking] = useState(false);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  // User Profile & Storage State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('djl_user_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Certified Rank Modal State
  const [certModal, setCertModal] = useState<{
    isOpen: boolean;
    grade: string;
    opponentTierName: string;
    turns: number;
    acornsEarned: number;
  }>({
    isOpen: false,
    grade: '',
    opponentTierName: '',
    turns: 0,
    acornsEarned: 0,
  });

  // Match Result Modal State (Loss / Resign / Over)
  const [matchResultModal, setMatchResultModal] = useState<{
    isOpen: boolean;
    result: 'win' | 'loss' | 'draw';
    reason: string;
    opponentTierName: string;
    turns: number;
  }>({
    isOpen: false,
    result: 'loss',
    reason: '',
    opponentTierName: '',
    turns: 0,
  });

  // Game Board & Move State
  const [board, setBoard] = useState<BoardState>(() => cloneBoard(BEGINNER_QUESTS[0].initialBoard));
  const [turn, setTurn] = useState<Side>('cho');
  const [playerSide, setPlayerSide] = useState<Side>('cho');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isInCheck, setIsInCheck] = useState(false);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [hintAdvice, setHintAdvice] = useState<string | null>(null);

  // Tab 1: Beginner Quests State
  const [currentQuest, setCurrentQuest] = useState<Quest>(BEGINNER_QUESTS[0]);
  const [currentQuestStep, setCurrentQuestStep] = useState(0);
  const [questFeedback, setQuestFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Tab 2: Advanced Tactics State
  const [currentTactic, setCurrentTactic] = useState<TacticPuzzle>(ADVANCED_TACTICS[0]);
  const [currentTacticStep, setCurrentTacticStep] = useState(0);
  const [tacticFeedback, setTacticFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Tab 3: AI Match State
  const [aiTier, setAiTier] = useState<AIRankTier>('18k');
  const [choFormation, setChoFormation] = useState<FormationType>('gwima');
  const [hanFormation, setHanFormation] = useState<FormationType>('gwima');
  const [isPlayingAIMatch, setIsPlayingAIMatch] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [matchHistory, setMatchHistory] = useState<Move[]>([]);
  const boardHistoryRef = useRef<BoardState[]>([]);
  const handlePassTurnRef = useRef<((isTimeout?: boolean) => void) | null>(null);

  // 30-Second Turn Countdown Timer for AI Match
  useEffect(() => {
    if (activeTab !== 'aimatch' || !isPlayingAIMatch || isThinking) return;

    // Timeout: lose turn (pass), opponent AI moves from current state
    if (timerSeconds <= 0) {
      if (turn === playerSide) {
        handlePassTurnRef.current?.(true);
      } else {
        setTurn(playerSide);
        setTimerSeconds(30);
        setStatusText('상대 AI의 30초 시간 초과로 나의 차례가 되었습니다.');
      }
      return;
    }

    // Play tick sound on last 5 seconds of player's turn
    if (turn === playerSide && timerSeconds <= 5) {
      sound.playTick();
    }

    const timerId = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [activeTab, isPlayingAIMatch, turn, playerSide, timerSeconds, isThinking]);

  // Sound muting hookup
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Save profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('djl_user_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage error
    }
  }, [profile]);

  // First-launch terms notice verification check
  useEffect(() => {
    const agreed = localStorage.getItem('dotori_terms_agreed') === 'true';
    if (!agreed) {
      setIsFirstLaunch(true);
      setShowTermsModal(true);
    }
  }, []);

  const handleAgreeTerms = () => {
    localStorage.setItem('dotori_terms_agreed', 'true');
    setShowTermsModal(false);
    setIsFirstLaunch(false);
  };

  const handleResetProgress = () => {
    setProfile(INITIAL_PROFILE);
    localStorage.removeItem('djl_user_profile');
    handleSelectQuest(BEGINNER_QUESTS[0]);
    setStatusText('진도 및 전적이 초기화되었습니다.');
  };

  // Helper: check king state on board
  const updateCheckState = (b: BoardState, currentTurn: Side) => {
    const inCheck = isKingInCheck(b, currentTurn);
    setIsInCheck(inCheck);
    if (inCheck) {
      sound.playCheck();
      setStatusText(`장군(將軍)! ${currentTurn === 'cho' ? '초(楚)' : '한(漢)'}의 궁이 위협받고 있습니다!`);
    } else {
      setStatusText(isPlayingAIMatch ? (currentTurn === playerSide ? '당신의 착수 차례입니다.' : 'AI 수읽기 중...') : '도토리 장기 학습 중');
    }
  };

  // Switch to Quest mode
  const handleSelectQuest = (q: Quest) => {
    setCurrentQuest(q);
    setCurrentQuestStep(0);
    setQuestFeedback(null);
    setBoard(cloneBoard(q.initialBoard));
    setTurn(q.turn);
    setPlayerSide(q.turn);
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setHintAdvice(null);
    updateCheckState(q.initialBoard, q.turn);
  };

  // Switch to Tactic mode
  const handleSelectTactic = (t: TacticPuzzle) => {
    setCurrentTactic(t);
    setCurrentTacticStep(0);
    setTacticFeedback(null);
    setBoard(cloneBoard(t.initialBoard));
    setTurn(t.turn);
    setPlayerSide(t.turn);
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setHintAdvice(null);
    updateCheckState(t.initialBoard, t.turn);
  };

  // Start new AI match
  const handleStartAIMatch = () => {
    const initialB = getInitialBoard(choFormation, hanFormation);
    setBoard(initialB);
    setTurn('cho');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setHintAdvice(null);
    setMatchHistory([]);
    boardHistoryRef.current = [cloneBoard(initialB)];
    setTimerSeconds(30);
    setIsPlayingAIMatch(true);
    setStatusText(
      playerSide === 'cho'
        ? '공식 급수 판정 대국이 시작되었습니다. (30초 제한, 초 선수, 나의 차례)'
        : '공식 급수 판정 대국이 시작되었습니다. (30초 제한, 초 선수 - AI가 첫 수를 둡니다)'
    );
    updateCheckState(initialB, 'cho');

    // If player is Han, AI moves first as Cho
    if (playerSide === 'han') {
      setIsThinking(true);
      setTimeout(() => {
        const { move: aiMove } = getBestAIMove(initialB, 'cho', aiTier);
        setIsThinking(false);
        if (aiMove) {
          const newB = cloneBoard(initialB);
          const aiCaptured = newB[aiMove.to.r][aiMove.to.c];
          newB[aiMove.to.r][aiMove.to.c] = newB[aiMove.from.r][aiMove.from.c];
          newB[aiMove.from.r][aiMove.from.c] = null;
          if (aiCaptured) sound.playCapture();
          else sound.playPlace();

          const aiMoveObj: Move = {
            ...aiMove,
            notation: generateNotation(aiMove),
          };
          setBoard(newB);
          setLastMove(aiMoveObj);
          setTurn('han');
          setMatchHistory([aiMoveObj]);
          boardHistoryRef.current.push(cloneBoard(newB));
          updateCheckState(newB, 'han');
          setTimerSeconds(30);
          setStatusText('AI의 첫 수가 완료되었습니다. (나의 차례 - 30초)');
        }
      }, 600);
    }
  };

  // Handle Board Position Click
  const handleSelectPos = (pos: Position) => {
    if (isThinking) return;
    if (activeTab === 'aimatch' && !isPlayingAIMatch) return;

    const clickedPiece = board[pos.r][pos.c];

    // If a piece was already selected and clicked position is a valid target move
    if (selectedPos && validMoves.some((m) => m.r === pos.r && m.c === pos.c)) {
      executeUserMove(selectedPos, pos);
      return;
    }

    // Otherwise, select own piece
    if (clickedPiece && clickedPiece.side === turn) {
      if (activeTab === 'aimatch' && clickedPiece.side !== playerSide) return;

      setSelectedPos(pos);
      const legal = getLegalMoves(board, pos.r, pos.c);
      setValidMoves(legal);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  // Execute User Move
  const executeUserMove = (from: Position, to: Position) => {
    const movingPiece = board[from.r][from.c];
    if (!movingPiece) return;

    const capturedPiece = board[to.r][to.c];
    const newBoard = cloneBoard(board);
    newBoard[to.r][to.c] = movingPiece;
    newBoard[from.r][from.c] = null;

    if (capturedPiece) {
      sound.playCapture();
    } else {
      sound.playPlace();
    }

    const moveObj: Move = {
      from,
      to,
      piece: movingPiece,
      captured: capturedPiece,
      notation: generateNotation({ from, to, piece: movingPiece, captured: capturedPiece }),
    };

    setBoard(newBoard);
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(moveObj);
    setHintMove(null);
    setHintAdvice(null);

    // MODE 1: Beginner Quest Check
    if (activeTab === 'quest') {
      const step = currentQuest.steps[currentQuestStep];
      const isExpected =
        step.expectedMove &&
        step.expectedMove.from.r === from.r &&
        step.expectedMove.from.c === from.c &&
        step.expectedMove.to.r === to.r &&
        step.expectedMove.to.c === to.c;

      if (isExpected) {
        sound.playSuccess();
        setQuestFeedback({ success: true, msg: step.feedbackSuccess });

        // Grant reward & mark cleared
        if (!profile.clearedQuests.includes(currentQuest.id)) {
          setProfile((prev) => ({
            ...prev,
            acorns: prev.acorns + currentQuest.acornReward,
            clearedQuests: [...prev.clearedQuests, currentQuest.id],
          }));
        }
      } else {
        setQuestFeedback({ success: false, msg: step.feedbackFail });
      }
      return;
    }

    // MODE 2: Advanced Tactics Check
    if (activeTab === 'tactic') {
      const step = currentTactic.steps[currentTacticStep];
      const isExpected =
        step.expectedMove &&
        step.expectedMove.from.r === from.r &&
        step.expectedMove.from.c === from.c &&
        step.expectedMove.to.r === to.r &&
        step.expectedMove.to.c === to.c;

      if (isExpected) {
        if (step.opponentResponse) {
          // Play opponent response after brief delay
          setStatusText(step.opponentResponse.commentary);
          setTimeout(() => {
            const oppFrom = step.opponentResponse!.from;
            const oppTo = step.opponentResponse!.to;
            const oppPiece = newBoard[oppFrom.r][oppFrom.c];
            if (oppPiece) {
              newBoard[oppTo.r][oppTo.c] = oppPiece;
              newBoard[oppFrom.r][oppFrom.c] = null;
              sound.playPlace();
              setBoard(cloneBoard(newBoard));
              setLastMove({
                from: oppFrom,
                to: oppTo,
                piece: oppPiece,
              });
            }
            setCurrentTacticStep((s) => s + 1);
            setTacticFeedback({
              success: true,
              msg: step.explanation,
            });
          }, 600);
        } else {
          // Final step completed
          sound.playSuccess();
          setTacticFeedback({ success: true, msg: step.explanation });
          if (!profile.clearedTactics.includes(currentTactic.id)) {
            setProfile((prev) => ({
              ...prev,
              acorns: prev.acorns + 30,
              clearedTactics: [...prev.clearedTactics, currentTactic.id],
            }));
          }
        }
      } else {
        setTacticFeedback({
          success: false,
          msg: '목표 수순이 아닙니다. 상단의 전략 해설을 읽고 다시 시도해보세요!',
        });
      }
      return;
    }

    // MODE 3: AI Match
    if (activeTab === 'aimatch') {
      const nextTurn: Side = turn === 'cho' ? 'han' : 'cho';
      setTurn(nextTurn);
      setTimerSeconds(30);
      setMatchHistory((prev) => [...prev, moveObj]);
      boardHistoryRef.current.push(cloneBoard(newBoard));

      updateCheckState(newBoard, nextTurn);

      // Trigger AI Turn
      if (nextTurn !== playerSide) {
        setIsThinking(true);
        setStatusText('AI가 다음 수를 계산하고 있습니다...');

        setTimeout(() => {
          const { move: aiMove } = getBestAIMove(newBoard, nextTurn, aiTier);
          setIsThinking(false);

          if (!aiMove) {
            // AI has no moves -> Player Wins!
            handleMatchEnd('win', '외통수');
            return;
          }

          const aiCaptured = newBoard[aiMove.to.r][aiMove.to.c];
          newBoard[aiMove.to.r][aiMove.to.c] = newBoard[aiMove.from.r][aiMove.from.c];
          newBoard[aiMove.from.r][aiMove.from.c] = null;

          if (aiCaptured) sound.playCapture();
          else sound.playPlace();

          const aiMoveObj: Move = {
            ...aiMove,
            notation: generateNotation(aiMove),
          };

          setBoard(cloneBoard(newBoard));
          setLastMove(aiMoveObj);
          setTurn(playerSide);
          setTimerSeconds(30);
          setMatchHistory((prev) => [...prev, aiMoveObj]);
          boardHistoryRef.current.push(cloneBoard(newBoard));

          updateCheckState(newBoard, playerSide);

          // Check if player has no legal moves remaining (Checkmate / 외통수)
          const playerLegalMoves = getAllLegalMoves(newBoard, playerSide);
          if (playerLegalMoves.length === 0) {
            handleMatchEnd('loss', '외통수');
          }
        }, 500);
      }
    }
  };

  // Helper to determine next AI Tier
  const getNextTier = (tier: AIRankTier): AIRankTier => {
    if (tier === '18k') return '14k';
    if (tier === '14k') return '9k';
    if (tier === '9k') return '4k';
    if (tier === '4k') return '1d';
    return '1d';
  };

  // Return to AI match lobby
  const handleReturnToLobby = () => {
    setIsPlayingAIMatch(false);
    setSelectedPos(null);
    setValidMoves([]);
    setCertModal((prev) => ({ ...prev, isOpen: false }));
    setMatchResultModal((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('aimatch');
    setStatusText('새로운 AI 급수 대국을 설정하세요.');
  };

  // Return to first screen / beginner quest lobby
  const handleGoHome = () => {
    setIsPlayingAIMatch(false);
    setSelectedPos(null);
    setValidMoves([]);
    setCertModal((prev) => ({ ...prev, isOpen: false }));
    setMatchResultModal((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('quest');
    handleSelectQuest(BEGINNER_QUESTS[0]);
    setStatusText('도토리 장기 배움터에 오신 것을 환영합니다!');
  };

  // Challenge next tier immediately after victory
  const handleNextTierChallenge = () => {
    setCertModal((prev) => ({ ...prev, isOpen: false }));
    setMatchResultModal((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('aimatch');

    const next = getNextTier(aiTier);
    setAiTier(next);

    const initialB = getInitialBoard(choFormation, hanFormation);
    setBoard(initialB);
    setTurn('cho');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setHintAdvice(null);
    setMatchHistory([]);
    boardHistoryRef.current = [cloneBoard(initialB)];
    setTimerSeconds(30);
    setIsPlayingAIMatch(true);
    setStatusText(
      playerSide === 'cho'
        ? `${AI_RANK_TIERS[next].shortGrade} AI와 승급 대국이 시작되었습니다! (30초 제한, 초 선수, 나의 차례)`
        : `${AI_RANK_TIERS[next].shortGrade} AI와 승급 대국이 시작되었습니다! (30초 제한, 초 선수 - AI 첫 수 착수 중)`
    );
    updateCheckState(initialB, 'cho');

    // If player is Han, AI moves first as Cho
    if (playerSide === 'han') {
      setIsThinking(true);
      setTimeout(() => {
        const { move: aiMove } = getBestAIMove(initialB, 'cho', next);
        setIsThinking(false);
        if (aiMove) {
          const newB = cloneBoard(initialB);
          const aiCaptured = newB[aiMove.to.r][aiMove.to.c];
          newB[aiMove.to.r][aiMove.to.c] = newB[aiMove.from.r][aiMove.from.c];
          newB[aiMove.from.r][aiMove.from.c] = null;
          if (aiCaptured) sound.playCapture();
          else sound.playPlace();

          const aiMoveObj: Move = {
            ...aiMove,
            notation: generateNotation(aiMove),
          };
          setBoard(newB);
          setLastMove(aiMoveObj);
          setTurn('han');
          setMatchHistory([aiMoveObj]);
          boardHistoryRef.current.push(cloneBoard(newB));
          updateCheckState(newB, 'han');
          setTimerSeconds(30);
          setStatusText('AI의 첫 수가 완료되었습니다. (나의 차례 - 30초)');
        }
      }, 600);
    }
  };

  // Rematch with current tier after defeat or resign
  const handleRematch = () => {
    setCertModal((prev) => ({ ...prev, isOpen: false }));
    setMatchResultModal((prev) => ({ ...prev, isOpen: false }));
    setActiveTab('aimatch');
    handleStartAIMatch();
  };

  // AI Match End (Win/Loss/Resign)
  const handleMatchEnd = (result: 'win' | 'loss' | 'draw', reason: string) => {
    setIsPlayingAIMatch(false);
    setSelectedPos(null);
    setValidMoves([]);

    let nextGrade = profile.ratingGrade;
    let earnedAcorns = 0;
    const opponentInfo = AI_RANK_TIERS[aiTier];

    if (result === 'win') {
      sound.playSuccess();
      earnedAcorns = 50;

      // Grade promotion logic based on beaten tier
      if (aiTier === '18k') nextGrade = '15급';
      else if (aiTier === '14k') nextGrade = '10급';
      else if (aiTier === '9k') nextGrade = '5급';
      else if (aiTier === '4k') nextGrade = '1급';
      else if (aiTier === '1d') nextGrade = '초단 (도토리 명인)';

      setCertModal({
        isOpen: true,
        grade: nextGrade,
        opponentTierName: opponentInfo.gradeName,
        turns: matchHistory.length,
        acornsEarned: earnedAcorns,
      });
    } else {
      sound.playDefeat();
      setMatchResultModal({
        isOpen: true,
        result,
        reason,
        opponentTierName: opponentInfo.gradeName,
        turns: matchHistory.length,
      });
    }

    setProfile((prev) => ({
      ...prev,
      ratingGrade: nextGrade,
      acorns: prev.acorns + earnedAcorns,
      matchHistory: [
        {
          id: `match-${Date.now()}`,
          date: new Date().toLocaleDateString('ko-KR'),
          opponentTier: aiTier,
          result,
          turns: matchHistory.length,
          scoreDiff: 0,
          awardedGrade: result === 'win' ? nextGrade : undefined,
        },
        ...prev.matchHistory,
      ],
    }));

    setStatusText(
      result === 'win'
        ? `축하합니다! ${reason}로 AI를 꺾고 승리하였습니다!`
        : `대국 종료: ${reason}로 패배하였습니다. 다음 기회에 재도전하세요!`
    );
  };

  // AI Undo 1 Full Round
  const handleUndoMove = () => {
    if (boardHistoryRef.current.length < 3) return;
    boardHistoryRef.current.pop(); // Remove AI move
    boardHistoryRef.current.pop(); // Remove Player move
    const prevBoard = cloneBoard(boardHistoryRef.current[boardHistoryRef.current.length - 1]);
    setBoard(prevBoard);
    setTurn(playerSide);
    setMatchHistory((prev) => prev.slice(0, prev.length - 2));
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setStatusText('한 수를 무르고 착수를 되돌렸습니다.');
    updateCheckState(prevBoard, playerSide);
  };

  // Voluntary or Timeout Turn Pass in AI Match (한 수 쉬기)
  const handlePassTurn = (isTimeout = false) => {
    if (activeTab !== 'aimatch' || !isPlayingAIMatch || isThinking || turn !== playerSide) return;

    if (!isTimeout && isInCheck) {
      setStatusText('⚠️ 장군(將軍) 상태에서는 한 수를 쉴 수 없습니다. 멍군을 해야 합니다!');
      return;
    }

    if (isTimeout) {
      sound.playTimeout();
      setStatusText('⏱️ 30초 시간 초과! 한 수를 쉬고 차례가 AI에게 넘어갔습니다.');
    } else {
      sound.playPlace();
      setStatusText('한 수를 쉬었습니다. 차례가 AI에게 넘어갔습니다.');
    }

    setSelectedPos(null);
    setValidMoves([]);
    const aiSide: Side = playerSide === 'cho' ? 'han' : 'cho';
    setTurn(aiSide);
    setTimerSeconds(30);

    // AI moves from current board state
    setIsThinking(true);
    setTimeout(() => {
      const { move: aiMove } = getBestAIMove(board, aiSide, aiTier);
      setIsThinking(false);

      if (!aiMove) {
        handleMatchEnd('win', '외통수');
        return;
      }

      const newBoard = cloneBoard(board);
      const aiCaptured = newBoard[aiMove.to.r][aiMove.to.c];
      newBoard[aiMove.to.r][aiMove.to.c] = newBoard[aiMove.from.r][aiMove.from.c];
      newBoard[aiMove.from.r][aiMove.from.c] = null;

      if (aiCaptured) sound.playCapture();
      else sound.playPlace();

      const aiMoveObj: Move = {
        ...aiMove,
        notation: generateNotation(aiMove),
      };

      setBoard(newBoard);
      setLastMove(aiMoveObj);
      setTurn(playerSide);
      setTimerSeconds(30);
      setMatchHistory((prev) => [...prev, aiMoveObj]);
      boardHistoryRef.current.push(cloneBoard(newBoard));

      updateCheckState(newBoard, playerSide);

      if (aiCaptured && aiCaptured.type === 'king') {
        handleMatchEnd('loss', '궁 포획');
        return;
      }

      const playerLegalMoves = getAllLegalMoves(newBoard, playerSide);
      if (playerLegalMoves.length === 0) {
        handleMatchEnd('loss', '외통수');
      }
    }, 500);
  };

  handlePassTurnRef.current = handlePassTurn;

  // Resign Match
  const handleResign = () => {
    if (window.confirm('현재 대국을 기권하시겠습니까?')) {
      handleMatchEnd('loss', '기권');
    }
  };

  // AI Coach Hint
  const handleAskHint = () => {
    const hint = getEducationalHint(board, playerSide);
    if (hint) {
      setHintMove(hint.move);
      setHintAdvice(hint.advice);
      setStatusText('도토리 AI 코치가 추천하는 최선의 수와 조언을 표시합니다.');
    }
  };

  // Tab switching handler
  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    if (tab === 'quest') {
      handleSelectQuest(currentQuest);
    } else if (tab === 'tactic') {
      handleSelectTactic(currentTactic);
    } else if (tab === 'aimatch') {
      if (!isPlayingAIMatch) {
        handleStartAIMatch();
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#090A10] text-gray-100 overflow-hidden select-none font-sans">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Official Dotori Unified Header */}
      <Header
        appVersion={APP_VERSION}
        isPhoneFrame={isPhoneFrame}
        setIsPhoneFrame={setIsPhoneFrame}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        statusText={statusText}
        isThinking={isThinking}
        onOpenTermsNotice={() => setShowTermsModal(true)}
        onResetProgress={handleResetProgress}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        onOpenPieceThemeModal={() => setIsPieceModalOpen(true)}
      />

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative z-10 p-2 sm:p-4 gap-3 lg:gap-4 max-w-[1600px] mx-auto w-full custom-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+2.5rem)]">
        {/* Left / Center Viewport (Interactive Janggi Board) - Hidden on mobile if in Profile or MiniGames mode */}
        {activeTab !== 'profile' && activeTab !== 'minigames' && (
          <section
            className={`w-full lg:flex-1 shrink-0 flex flex-col items-center justify-center relative transition-all duration-300 ${
              isPhoneFrame
                ? 'max-w-[420px] mx-auto my-auto p-2 sm:p-4 rounded-[40px] border-4 border-zinc-700 bg-black/90 shadow-2xl ring-8 ring-zinc-900/60'
                : 'max-w-[480px] lg:max-w-[540px] mx-auto'
            }`}
          >
            {/* Interactive Korean Wood Board */}
            <JanggiBoard
              board={board}
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={lastMove}
              turn={turn}
              playerSide={playerSide}
              isInCheck={isInCheck}
              onSelectPos={handleSelectPos}
              hintMove={hintMove}
              pieceTheme={pieceTheme}
              onChangePieceTheme={handleChangePieceTheme}
              lang={lang}
              timerSeconds={timerSeconds}
              isTimerActive={activeTab === 'aimatch' && isPlayingAIMatch}
              guideMove={
                activeTab === 'quest'
                  ? currentQuest.steps[currentQuestStep]?.expectedMove || null
                  : activeTab === 'tactic'
                  ? currentTactic.steps[currentTacticStep]?.expectedMove || null
                  : null
              }
            />
          </section>
        )}

        {/* Right Sidebar Control Workspace */}
        <aside className={`w-full flex flex-col bg-[#0e0f18]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl shrink-0 ${
          activeTab === 'minigames'
            ? 'max-w-[960px] mx-auto'
            : activeTab === 'profile'
            ? 'max-w-[640px] mx-auto'
            : 'lg:w-[440px] xl:w-[480px] max-w-[480px] lg:max-w-none mx-auto'
        }`}>
          {/* Mode Tabs Navigation (5 Tabs) */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 mb-4 shrink-0">
            <button
              onClick={() => handleTabChange('quest')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === 'quest'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="truncate">{t.tabQuest}</span>
            </button>

            <button
              onClick={() => handleTabChange('tactic')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === 'tactic'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="truncate">{t.tabTactic}</span>
            </button>

            <button
              onClick={() => handleTabChange('aimatch')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === 'aimatch'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span className="truncate">{t.tabRank}</span>
            </button>

            <button
              onClick={() => handleTabChange('minigames')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === 'minigames'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="truncate">{t.tabMiniGames}</span>
            </button>

            <button
              onClick={() => handleTabChange('profile')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="truncate">{t.tabProfile}</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {activeTab === 'quest' && (
              <QuestPanel
                t={t}
                quests={BEGINNER_QUESTS}
                currentQuest={currentQuest}
                clearedQuestIds={profile.clearedQuests}
                currentStepIndex={currentQuestStep}
                questFeedback={questFeedback}
                onSelectQuest={handleSelectQuest}
                onResetQuest={() => handleSelectQuest(currentQuest)}
                onNextQuest={() => {
                  const idx = BEGINNER_QUESTS.findIndex((q) => q.id === currentQuest.id);
                  if (idx < BEGINNER_QUESTS.length - 1) {
                    handleSelectQuest(BEGINNER_QUESTS[idx + 1]);
                  }
                }}
              />
            )}

            {activeTab === 'tactic' && (
              <TacticsPanel
                tactics={ADVANCED_TACTICS}
                currentTactic={currentTactic}
                clearedTacticIds={profile.clearedTactics}
                currentStepIndex={currentTacticStep}
                tacticFeedback={tacticFeedback}
                onSelectTactic={handleSelectTactic}
                onResetTactic={() => handleSelectTactic(currentTactic)}
                onNextTactic={() => {
                  const idx = ADVANCED_TACTICS.findIndex((t) => t.id === currentTactic.id);
                  if (idx < ADVANCED_TACTICS.length - 1) {
                    handleSelectTactic(ADVANCED_TACTICS[idx + 1]);
                  }
                }}
              />
            )}

            {activeTab === 'aimatch' && (
              <AIMatchPanel
                currentTier={aiTier}
                onChangeTier={setAiTier}
                playerSide={playerSide}
                onChangePlayerSide={setPlayerSide}
                choFormation={choFormation}
                onChangeChoFormation={setChoFormation}
                hanFormation={hanFormation}
                onChangeHanFormation={setHanFormation}
                isPlaying={isPlayingAIMatch}
                onStartMatch={handleStartAIMatch}
                onUndoMove={handleUndoMove}
                onResign={handleResign}
                onAskHint={handleAskHint}
                onPassTurn={() => handlePassTurn(false)}
                hintAdvice={hintAdvice}
                moveHistory={matchHistory}
                isThinking={isThinking}
                userRatingGrade={profile.ratingGrade}
                onGoHome={handleGoHome}
              />
            )}

            {activeTab === 'minigames' && (
              <MiniGamesPanel
                pieceTheme={pieceTheme}
                lang={lang}
                userAcorns={profile.acorns}
                onEarnAcorns={(amt) =>
                  setProfile((prev) => {
                    const updated = { ...prev, acorns: prev.acorns + amt };
                    try {
                      localStorage.setItem('djl_user_profile', JSON.stringify(updated));
                    } catch {}
                    return updated;
                  })
                }
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePanel
                profile={profile}
                totalQuests={BEGINNER_QUESTS.length}
                totalTactics={ADVANCED_TACTICS.length}
              />
            )}
          </div>
        </aside>
      </main>

      {/* Mandatory First-Launch Terms & Copyright Notice Modal */}
      <TermsNoticeModal
        isOpen={showTermsModal}
        isFirstLaunch={isFirstLaunch}
        onAgree={handleAgreeTerms}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Official Rank Promotion Certificate Modal (Win) */}
      <RankCertificateModal
        isOpen={certModal.isOpen}
        onClose={() => setCertModal((prev) => ({ ...prev, isOpen: false }))}
        grade={certModal.grade}
        opponentTierName={certModal.opponentTierName}
        turns={certModal.turns}
        acornsEarned={certModal.acornsEarned}
        onGoHome={handleReturnToLobby}
        onNextTier={handleNextTierChallenge}
        hasNextTier={aiTier !== '1d'}
      />

      {/* Match Result Modal (Loss / Resign / Over) */}
      <MatchResultModal
        isOpen={matchResultModal.isOpen}
        onClose={() => setMatchResultModal((prev) => ({ ...prev, isOpen: false }))}
        result={matchResultModal.result}
        reason={matchResultModal.reason}
        opponentTierName={matchResultModal.opponentTierName}
        turns={matchResultModal.turns}
        onGoHome={handleReturnToLobby}
        onRematch={handleRematch}
        hasNextTier={aiTier !== '1d'}
        onNextTier={handleNextTierChallenge}
      />

      {/* Piece Theme Selection Modal */}
      <PieceThemeModal
        isOpen={isPieceModalOpen}
        currentTheme={pieceTheme}
        onSelectTheme={handleChangePieceTheme}
        onClose={() => setIsPieceModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
