import React, { useRef, useState, useEffect, useCallback } from 'react';
import { sound } from '../utils/soundEffects';
import {
  RotateCcw,
  Trophy,
  Swords,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Target,
  Flame,
} from 'lucide-react';

interface Stone {
  id: string;
  side: 'cho' | 'han';
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  alive: boolean;
  isFalling: boolean;
  scale: number;
  opacity: number;
}

interface AlkagiMiniGameProps {
  onEarnAcorns?: (amount: number) => void;
}

const BOARD_W = 440;
const BOARD_H = 500;
const PADDING = 20; // Board edge boundary
const MAX_DRAG = 75;

export const AlkagiMiniGame: React.FC<AlkagiMiniGameProps> = ({ onEarnAcorns }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stones, setStones] = useState<Stone[]>([]);
  const [turn, setTurn] = useState<'cho' | 'han'>('cho');
  const [isSimulating, setIsSimulating] = useState(false);
  const [draggedStoneId, setDraggedStoneId] = useState<string | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [gameMode, setGameMode] = useState<'regular' | 'soldiers'>('regular');
  const [winner, setWinner] = useState<'cho' | 'han' | null>(null);
  const [aiAiming, setAiAiming] = useState(false);
  const [statusText, setStatusText] = useState('내 말을 터치하고 뒤로 당겼다 놓아 상대 말을 장외로 밀어내세요!');

  const stonesRef = useRef<Stone[]>([]);
  stonesRef.current = stones;

  // Initialize board with stones
  const initGame = useCallback((mode: 'regular' | 'soldiers') => {
    const list: Stone[] = [];

    if (mode === 'regular') {
      // 5 vs 5 Major pieces
      // Han (Top, AI, Red)
      list.push(
        { id: 'han-king', side: 'han', label: '漢', x: BOARD_W / 2, y: 80, vx: 0, vy: 0, radius: 21, mass: 1.8, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'han-cha1', side: 'han', label: '車', x: 80, y: 70, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'han-cha2', side: 'han', label: '車', x: BOARD_W - 80, y: 70, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'han-po1', side: 'han', label: '包', x: 150, y: 130, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'han-po2', side: 'han', label: '包', x: BOARD_W - 150, y: 130, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 }
      );

      // Cho (Bottom, Player, Blue)
      list.push(
        { id: 'cho-king', side: 'cho', label: '楚', x: BOARD_W / 2, y: BOARD_H - 80, vx: 0, vy: 0, radius: 21, mass: 1.8, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'cho-cha1', side: 'cho', label: '車', x: 80, y: BOARD_H - 70, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'cho-cha2', side: 'cho', label: '車', x: BOARD_W - 80, y: BOARD_H - 70, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'cho-po1', side: 'cho', label: '包', x: 150, y: BOARD_H - 130, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 },
        { id: 'cho-po2', side: 'cho', label: '包', x: BOARD_W - 150, y: BOARD_H - 130, vx: 0, vy: 0, radius: 18, mass: 1.2, alive: true, isFalling: false, scale: 1, opacity: 1 }
      );
    } else {
      // 5 vs 5 Soldiers Battle
      // Han (Top)
      [60, 140, 220, 300, 380].forEach((xPos, idx) => {
        list.push({
          id: `han-sol-${idx}`,
          side: 'han',
          label: '兵',
          x: xPos,
          y: 110,
          vx: 0,
          vy: 0,
          radius: 17,
          mass: 1.0,
          alive: true,
          isFalling: false,
          scale: 1,
          opacity: 1,
        });
      });

      // Cho (Bottom)
      [60, 140, 220, 300, 380].forEach((xPos, idx) => {
        list.push({
          id: `cho-sol-${idx}`,
          side: 'cho',
          label: '卒',
          x: xPos,
          y: BOARD_H - 110,
          vx: 0,
          vy: 0,
          radius: 17,
          mass: 1.0,
          alive: true,
          isFalling: false,
          scale: 1,
          opacity: 1,
        });
      });
    }

    setStones(list);
    setTurn('cho');
    setIsSimulating(false);
    setDraggedStoneId(null);
    setDragCurrent(null);
    setWinner(null);
    setAiAiming(false);
    setStatusText('내 차례! 원하는 내 말을 뒤로 당겨서 당구처럼 튕겨보세요.');
  }, []);

  useEffect(() => {
    initGame(gameMode);
  }, [initGame, gameMode]);

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const currentList = stonesRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. UPDATE PHYSICS
      let anyMoving = false;

      for (let i = 0; i < currentList.length; i++) {
        const s = currentList[i];
        if (!s.alive) continue;

        // Falling animation
        if (s.isFalling) {
          s.scale *= 0.92;
          s.opacity *= 0.88;
          if (s.scale < 0.1 || s.opacity < 0.05) {
            s.alive = false;
          }
          anyMoving = true;
          continue;
        }

        // Movement
        if (Math.abs(s.vx) > 0.05 || Math.abs(s.vy) > 0.05) {
          anyMoving = true;
          s.x += s.vx;
          s.y += s.vy;
          // Friction damping
          s.vx *= 0.982;
          s.vy *= 0.982;

          // Out-of-bounds check (Fall off board edge)
          if (
            s.x - s.radius < PADDING ||
            s.x + s.radius > BOARD_W - PADDING ||
            s.y - s.radius < PADDING ||
            s.y + s.radius > BOARD_H - PADDING
          ) {
            s.isFalling = true;
            sound.playCapture(); // Fall impact
          }
        } else {
          s.vx = 0;
          s.vy = 0;
        }
      }

      // 2. STONE-TO-STONE 2D ELASTIC COLLISION
      for (let i = 0; i < currentList.length; i++) {
        const s1 = currentList[i];
        if (!s1.alive || s1.isFalling) continue;

        for (let j = i + 1; j < currentList.length; j++) {
          const s2 = currentList[j];
          if (!s2.alive || s2.isFalling) continue;

          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0) {
            // Overlap resolution
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            s1.x -= nx * (overlap / 2);
            s1.y -= ny * (overlap / 2);
            s2.x += nx * (overlap / 2);
            s2.y += ny * (overlap / 2);

            // Relative velocity
            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = 2 * (nx * kx + ny * ky) / (s1.mass + s2.mass);

            // Elastic bounce
            s1.vx -= p * s2.mass * nx * 0.95;
            s1.vy -= p * s2.mass * ny * 0.95;
            s2.vx += p * s1.mass * nx * 0.95;
            s2.vy += p * s1.mass * ny * 0.95;

            // Collision sound
            const hitPower = Math.hypot(kx, ky);
            if (hitPower > 1.2) {
              sound.playPlace();
            }
          }
        }
      }

      // Check if simulation just finished
      if (isSimulating && !anyMoving) {
        setIsSimulating(false);
        checkGameStatus();
      }

      // 3. DRAW BOARD GRAPHICS
      ctx.clearRect(0, 0, BOARD_W, BOARD_H);

      // Bright Wood Board Background (연하고 화사한 비자목)
      const woodGrad = ctx.createLinearGradient(0, 0, BOARD_W, BOARD_H);
      woodGrad.addColorStop(0, '#faebd7');
      woodGrad.addColorStop(0.5, '#f5deb8');
      woodGrad.addColorStop(1, '#eccfa5');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      // Board Out of bounds warning area
      ctx.strokeStyle = '#5a3413';
      ctx.lineWidth = 3;
      ctx.strokeRect(PADDING, PADDING, BOARD_W - PADDING * 2, BOARD_H - PADDING * 2);

      // Grid Lines
      ctx.strokeStyle = 'rgba(90, 52, 19, 0.45)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 10; r++) {
        const y = PADDING + (r * (BOARD_H - PADDING * 2)) / 9;
        ctx.beginPath();
        ctx.moveTo(PADDING, y);
        ctx.lineTo(BOARD_W - PADDING, y);
        ctx.stroke();
      }
      for (let c = 0; c < 9; c++) {
        const x = PADDING + (c * (BOARD_W - PADDING * 2)) / 8;
        ctx.beginPath();
        ctx.moveTo(x, PADDING);
        ctx.lineTo(x, BOARD_H - PADDING);
        ctx.stroke();
      }

      // 4. DRAW STONES
      currentList.forEach((s) => {
        if (!s.alive) return;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(s.scale, s.scale);
        ctx.globalAlpha = s.opacity;

        // Soft Drop Shadow
        ctx.beginPath();
        ctx.arc(0, 2, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // Round Piece Body
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);

        if (s.side === 'cho') {
          // Cho Piece (Blue / Emerald radial gradient)
          const grad = ctx.createRadialGradient(-s.radius * 0.3, -s.radius * 0.3, 1, 0, 0, s.radius);
          grad.addColorStop(0, '#f7dfba');
          grad.addColorStop(0.5, '#deb078');
          grad.addColorStop(1, '#a67232');
          ctx.fillStyle = grad;
        } else {
          // Han Piece (Red radial gradient)
          const grad = ctx.createRadialGradient(-s.radius * 0.3, -s.radius * 0.3, 1, 0, 0, s.radius);
          grad.addColorStop(0, '#f7dfba');
          grad.addColorStop(0.5, '#deb078');
          grad.addColorStop(1, '#a67232');
          ctx.fillStyle = grad;
        }
        ctx.fill();

        // Text Hanja Character
        ctx.fillStyle = s.side === 'cho' ? '#0b4528' : '#8b1313';
        ctx.font = `bold ${Math.round(s.radius * 1.05)}px 'Noto Serif KR', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.label, 0, 1);

        ctx.restore();
      });

      // 5. DRAW DRAGGING SLINGSHOT AIMING LINE
      if (draggedStoneId && dragCurrent) {
        const s = currentList.find((item) => item.id === draggedStoneId);
        if (s) {
          const dx = dragCurrent.x - s.x;
          const dy = dragCurrent.y - s.y;
          const pullDist = Math.min(MAX_DRAG, Math.hypot(dx, dy));
          const angle = Math.atan2(dy, dx);

          // Aiming arrow in the opposite direction
          const aimAngle = angle + Math.PI;
          const aimLen = pullDist * 2.2;
          const aimX = s.x + Math.cos(aimAngle) * aimLen;
          const aimY = s.y + Math.sin(aimAngle) * aimLen;

          // Pullback line (Rubber band)
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(dragCurrent.x, dragCurrent.y);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Pullback handle ring
          ctx.beginPath();
          ctx.arc(dragCurrent.x, dragCurrent.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ec4899';
          ctx.fill();

          // Dotted Aiming Line in shooting direction
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(aimX, aimY);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.setLineDash([]);

          // Aim Target Arrow head
          ctx.beginPath();
          ctx.arc(aimX, aimY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, draggedStoneId, dragCurrent]);

  // Check Game Win/Loss Status after stones stop
  const checkGameStatus = () => {
    const list = stonesRef.current;
    const choAlive = list.filter((s) => s.side === 'cho' && s.alive && !s.isFalling).length;
    const hanAlive = list.filter((s) => s.side === 'han' && s.alive && !s.isFalling).length;

    if (hanAlive === 0 && choAlive > 0) {
      setWinner('cho');
      sound.playSuccess();
      onEarnAcorns?.(50);
      setStatusText('🎉 대승리! 상대 말을 모두 장외로 떨어뜨렸습니다! (+50 도토리)');
      return;
    }

    if (choAlive === 0 && hanAlive > 0) {
      setWinner('han');
      sound.playDefeat();
      setStatusText('아쉽습니다! 내 말이 모두 장외로 떨어져 패배했습니다.');
      return;
    }

    // Switch turn
    setTurn((prev) => {
      const next = prev === 'cho' ? 'han' : 'cho';
      if (next === 'han') {
        setStatusText('AI가 조준하고 있습니다...');
        triggerAITurn();
      } else {
        setStatusText('나의 차례! 내 말을 잡고 뒤로 당겼다 놓으세요.');
      }
      return next;
    });
  };

  // Smart AI Turn: aim at closest player stone and flick!
  const triggerAITurn = () => {
    setAiAiming(true);

    setTimeout(() => {
      const list = stonesRef.current;
      const hanStones = list.filter((s) => s.side === 'han' && s.alive && !s.isFalling);
      const choStones = list.filter((s) => s.side === 'cho' && s.alive && !s.isFalling);

      if (hanStones.length === 0 || choStones.length === 0) {
        setAiAiming(false);
        return;
      }

      // Pick an AI stone and find target player stone
      let bestAi = hanStones[0];
      let bestTarget = choStones[0];
      let bestDist = 999999;

      hanStones.forEach((ai) => {
        choStones.forEach((target) => {
          const d = Math.hypot(target.x - ai.x, target.y - ai.y);
          if (d < bestDist) {
            bestDist = d;
            bestAi = ai;
            bestTarget = target;
          }
        });
      });

      // Calculate vector towards player stone with slight human-like jitter
      const angle = Math.atan2(bestTarget.y - bestAi.y, bestTarget.x - bestAi.x);
      const jitter = (Math.random() - 0.5) * 0.12; // ±3.5 degrees error
      const finalAngle = angle + jitter;
      const power = Math.min(14, 8 + Math.random() * 5);

      bestAi.vx = Math.cos(finalAngle) * power;
      bestAi.vy = Math.sin(finalAngle) * power;

      sound.playPlace();
      setAiAiming(false);
      setIsSimulating(true);
      setStatusText('AI의 강력한 알까기 샷!');
    }, 1000);
  };

  // Mouse & Touch Input Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSimulating || turn !== 'cho' || winner || aiAiming) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_W / rect.width;
    const scaleY = BOARD_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    // Find clicked player stone
    const clicked = stonesRef.current.find(
      (s) => s.side === 'cho' && s.alive && !s.isFalling && Math.hypot(px - s.x, py - s.y) <= s.radius * 1.4
    );

    if (clicked) {
      setDraggedStoneId(clicked.id);
      setDragCurrent({ x: px, y: py });
      sound.playPlace();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggedStoneId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_W / rect.width;
    const scaleY = BOARD_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    setDragCurrent({ x: px, y: py });
  };

  const handlePointerUp = () => {
    if (!draggedStoneId || !dragCurrent) {
      setDraggedStoneId(null);
      setDragCurrent(null);
      return;
    }

    const s = stonesRef.current.find((item) => item.id === draggedStoneId);
    if (s) {
      const dx = dragCurrent.x - s.x;
      const dy = dragCurrent.y - s.y;
      const pullDist = Math.hypot(dx, dy);

      if (pullDist > 10) {
        const clampedDist = Math.min(MAX_DRAG, pullDist);
        const powerRatio = clampedDist / MAX_DRAG;
        const maxVelocity = 15;
        const speed = powerRatio * maxVelocity;
        const angle = Math.atan2(dy, dx) + Math.PI; // Shoot forward

        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed;

        sound.playPlace();
        setIsSimulating(true);
        setStatusText('나의 샷! 튕겨나가는 중...');
      }
    }

    setDraggedStoneId(null);
    setDragCurrent(null);
  };

  const choAliveCount = stones.filter((s) => s.side === 'cho' && s.alive && !s.isFalling).length;
  const hanAliveCount = stones.filter((s) => s.side === 'han' && s.alive && !s.isFalling).length;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-center justify-center">
      {/* Game Canvas Container */}
      <div className="flex flex-col items-center">
        {/* Status Scoreboard */}
        <div className="w-full max-w-[440px] flex items-center justify-between px-4 py-2.5 mb-2 rounded-2xl bg-black/50 border border-white/10 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="font-bold text-gray-200">초(나): {choAliveCount}알</span>
          </div>

          <div className="text-[11px] font-mono font-black text-pink-400 px-2 py-0.5 rounded bg-pink-500/15 border border-pink-500/30">
            {turn === 'cho' ? '🔵 내 턴' : '🔴 AI 턴'}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-200">한(AI): {hanAliveCount}알</span>
            <span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
          </div>
        </div>

        {/* Alkagi 2D Board Canvas */}
        <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-950/80 touch-none">
          <canvas
            ref={canvasRef}
            width={BOARD_W}
            height={BOARD_H}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full max-w-[440px] aspect-[9/10] cursor-crosshair select-none block"
          />

          {/* Winner Overlay Banner */}
          {winner && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
              <Trophy className="w-14 h-14 text-amber-400 mb-3 animate-bounce" />
              <h2 className="text-2xl font-black text-white mb-1">
                {winner === 'cho' ? '🏆 초나라(플레이어) 대승리!' : '💀 한나라(AI) 승리!'}
              </h2>
              <p className="text-xs text-gray-300 mb-5">
                {winner === 'cho'
                  ? '상대 말을 시원하게 모두 장외로 날려버렸습니다! (+50 도토리)'
                  : '내 말이 모두 장외로 떨어졌습니다. 다시 도전해보세요!'}
              </p>
              <button
                type="button"
                onClick={() => initGame(gameMode)}
                className="py-3 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-95 transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>한 판 더 대결하기</span>
              </button>
            </div>
          )}
        </div>

        {/* Subtitle / Tip */}
        <div className="w-full max-w-[440px] text-center text-[11px] text-gray-400 mt-2">
          {statusText}
        </div>
      </div>

      {/* Control Side Panel */}
      <div className="w-full lg:w-[320px] flex flex-col space-y-3 shrink-0">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white">알까기 모드 설정</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
              물리 엔진 On
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              대결 기물 구성
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGameMode('regular')}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  gameMode === 'regular'
                    ? 'bg-gradient-to-r from-emerald-600/30 to-sky-600/30 border-emerald-400 text-white font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">정규 5알전</div>
                <div className="text-[9px] text-gray-400 mt-0.5">왕, 차, 포 등</div>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('soldiers')}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  gameMode === 'soldiers'
                    ? 'bg-gradient-to-r from-pink-600/30 to-indigo-600/30 border-pink-400 text-white font-bold shadow-md shadow-pink-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">졸·병 대난투</div>
                <div className="text-[9px] text-gray-400 mt-0.5">졸 5 vs 병 5</div>
              </button>
            </div>
          </div>

          {/* How to Play Rules */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs text-gray-300 leading-relaxed">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>알까기 승리 비결</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400">
              <li>
                <strong className="text-gray-200">당구 슬링샷</strong>: 말을 뒤로 많이 당길수록 강하게 튕겨나갑니다.
              </li>
              <li>
                <strong className="text-gray-200">궁(王)의 무게감</strong>: 왕알은 질량이 커서 잘 안 밀려나고 상대 알을 강하게 쳐냅니다!
              </li>
              <li>
                <strong className="text-gray-200">쿠션 활용</strong>: 상대 말의 모서리를 살짝 빗겨 쳐서 장외로 밀어내보세요.
              </li>
            </ul>
          </div>

          {/* Restart Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => initGame(gameMode)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-pink-400" />
              <span>판 리셋 (새 게임)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

