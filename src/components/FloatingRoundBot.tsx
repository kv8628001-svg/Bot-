import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Maximize2,
  Minimize2,
  Move,
  Flame,
  Zap,
  CheckCircle,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { PredictionData, HouseWinner } from '../types';
import { speakBangla, playAlertChime } from '../utils/goldenFlowerOdds';

interface FloatingRoundBotProps {
  prediction: PredictionData | null;
  isLoading: boolean;
  roundCountdown: number;
  lang: 'bn' | 'en';
  onForceScan: () => void;
}

export const FloatingRoundBot: React.FC<FloatingRoundBotProps> = ({
  prediction,
  isLoading,
  roundCountdown,
  lang,
  onForceScan,
}) => {
  // Draggable state (relative position within parent container)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const botRef = useRef<HTMLDivElement | null>(null);

  // Mouse / Touch Drag handlers with pointer capture for Android touchscreens
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.drag-handle')) return;

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = botRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !botRef.current) return;
      const parent = botRef.current.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();

      let newX = e.clientX - parentRect.left - dragOffset.x;
      let newY = e.clientY - parentRect.top - dragOffset.y;

      const maxX = parentRect.width - (botRef.current.offsetWidth || 100);
      const maxY = parentRect.height - (botRef.current.offsetHeight || 100);

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (isDragging && botRef.current) {
        setIsDragging(false);
        // Android Chat-Head Edge Snapping (snaps to closest left or right side)
        const parent = botRef.current.parentElement;
        if (parent) {
          const parentWidth = parent.clientWidth;
          setPosition((prev) => {
            const isCloserToRight = prev.x > (parentWidth - 100) / 2;
            return {
              x: isCloserToRight ? parentWidth - 95 : 15,
              y: prev.y,
            };
          });
        }
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  // House theme based on top recommendation
  const rec = prediction?.recommendedHouse || 'B';
  const recColor =
    rec === 'A'
      ? { ring: 'ring-blue-500', glow: 'shadow-blue-500/50', bg: 'from-blue-600 to-indigo-700', text: 'text-blue-400', badge: 'bg-blue-500' }
      : rec === 'B'
      ? { ring: 'ring-emerald-500', glow: 'shadow-emerald-500/50', bg: 'from-emerald-600 to-teal-700', text: 'text-emerald-400', badge: 'bg-emerald-500' }
      : { ring: 'ring-orange-500', glow: 'shadow-orange-500/50', bg: 'from-orange-500 to-amber-700', text: 'text-orange-400', badge: 'bg-orange-500' };

  return (
    <div
      ref={botRef}
      onPointerDown={handlePointerDown}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={`absolute z-30 select-none transition-shadow duration-300 ${
        isDragging ? 'cursor-grabbing opacity-95 scale-102' : 'cursor-grab'
      }`}
    >
      {/* 1. COLLAPSED MINI ROUND FLOATING BUBBLE (ছোট গোল বট) */}
      {!isExpanded ? (
        <div className="relative group">
          {/* Animated pulse ring around the round bot */}
          <div
            className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${recColor.bg} opacity-75 blur-sm animate-pulse`}
          />

          {/* Circular Bot Body */}
          <div
            onClick={() => setIsExpanded(true)}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950/95 border-2 border-white/20 p-1 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl ${recColor.glow} transition-transform active:scale-95`}
          >
            {/* Top tiny round countdown & live dot */}
            <div className="absolute -top-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{roundCountdown}s</span>
            </div>

            {/* Main Predicted House Big Badge */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-[9px] text-amber-300 font-bold mt-1">স্ক্যান...</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">
                  {lang === 'bn' ? 'ঘর' : 'BOX'}
                </span>
                <span className={`text-2xl sm:text-3xl font-black italic tracking-tight ${recColor.text} drop-shadow-md`}>
                  {rec}
                </span>
                <span className="text-xs font-black text-white font-mono block -mt-0.5">
                  {prediction ? `${prediction.confidencePercent}%` : '58%'}
                </span>
              </div>
            )}

            {/* Bottom mini percentages preview: A | B | C */}
            <div className="absolute -bottom-2 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[9px] font-bold shadow-md">
              <span className="text-blue-400">A:{prediction?.probabilityA || 25}%</span>
              <span className="text-emerald-400">B:{prediction?.probabilityB || 58}%</span>
              <span className="text-orange-400">C:{prediction?.probabilityC || 17}%</span>
            </div>

            {/* Expand hover prompt */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* 2. EXPANDED ROUND HUD RADAR (বট রাডার ও সিগনাল প্যানেল) */
        <div className="w-72 sm:w-80 bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl ring-2 ring-purple-500/30">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center">
                <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{lang === 'bn' ? 'গোল্ডেন ফ্লাওয়ার এআই সিগনাল' : 'Golden Flower AI Radar'}</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ● {lang === 'bn' ? 'লাইভ রাউন্ড সিঙ্ক' : 'Live Round Sync'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice button */}
              {prediction?.banglaVoiceAlert && (
                <button
                  onClick={() => speakBangla(prediction.banglaVoiceAlert)}
                  className="p-1 rounded-md text-amber-400 hover:bg-slate-800 transition-colors"
                  title="ভয়েস শুনুন"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {/* Collapse button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="ছোট গোল মোডে রাখুন"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Signal Badge */}
          <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                {lang === 'bn' ? 'সর্বোচ্চ সম্ভাব্য ঘর' : 'Strongest Signal House'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-2xl font-black italic ${recColor.text}`}>
                  {lang === 'bn' ? `ঘর ${rec}` : `HOUSE ${rec}`}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  x2.98
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">
                {lang === 'bn' ? 'জেতার সম্ভাবনা' : 'Win Prob.'}
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {prediction ? `${prediction.confidencePercent}%` : '58%'}
              </span>
            </div>
          </div>

          {/* 3 Houses Probability Bars: A, B, C */}
          <div className="space-y-2 mb-3">
            {/* House A */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                <span className="text-blue-400">A (House A - Blue)</span>
                <span className="text-blue-300 font-mono">{prediction?.probabilityA || 25}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${prediction?.probabilityA || 25}%` }}
                />
              </div>
            </div>

            {/* House B */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                <span className="text-emerald-400">B (House B - Green)</span>
                <span className="text-emerald-300 font-mono">{prediction?.probabilityB || 58}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${prediction?.probabilityB || 58}%` }}
                />
              </div>
            </div>

            {/* House C */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                <span className="text-orange-400">C (House C - Orange)</span>
                <span className="text-orange-300 font-mono">{prediction?.probabilityC || 17}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${prediction?.probabilityC || 17}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bengali Voice announcement text preview */}
          {prediction?.banglaVoiceAlert && (
            <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-amber-200/90 leading-tight mb-3">
              🗣️ "{prediction.banglaVoiceAlert}"
            </div>
          )}

          {/* Trigger Scan Button & Drag hint */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Move className="w-3 h-3 text-slate-400" />
              <span>{lang === 'bn' ? 'যেকোনো জায়গায় টেনে নিন' : 'Drag anywhere'}</span>
            </span>

            <button
              onClick={onForceScan}
              disabled={isLoading}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isLoading ? (lang === 'bn' ? 'স্ক্যান...' : 'Scanning...') : (lang === 'bn' ? 'নতুন স্ক্যান' : 'Rescan')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
