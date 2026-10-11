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
  Eye,
  Camera,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PredictionData, HouseWinner } from '../types';
import { speakBangla, playAlertChime } from '../utils/goldenFlowerOdds';

interface FloatingRoundBotProps {
  prediction: PredictionData | null;
  isLoading: boolean;
  roundCountdown: number;
  lang: 'bn' | 'en';
  onForceScan: () => void;
  onResetSignal?: () => void;
}

export const FloatingRoundBot: React.FC<FloatingRoundBotProps> = ({
  prediction,
  isLoading,
  roundCountdown,
  lang,
  onForceScan,
  onResetSignal,
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

  // House theme based on genuine recommendation (or neutral ready theme if none)
  const hasSignal = Boolean(prediction);
  const rec = prediction?.recommendedHouse;

  const themeColor = !hasSignal
    ? {
        ring: 'ring-cyan-500/50',
        glow: 'shadow-cyan-500/30',
        bg: 'from-cyan-600/60 to-blue-700/60',
        text: 'text-cyan-400',
        badge: 'bg-cyan-500',
      }
    : rec === 'A'
    ? {
        ring: 'ring-blue-500',
        glow: 'shadow-blue-500/50',
        bg: 'from-blue-600 to-indigo-700',
        text: 'text-blue-400',
        badge: 'bg-blue-500',
      }
    : rec === 'B'
    ? {
        ring: 'ring-emerald-500',
        glow: 'shadow-emerald-500/50',
        bg: 'from-emerald-600 to-teal-700',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500',
      }
    : {
        ring: 'ring-orange-500',
        glow: 'shadow-orange-500/50',
        bg: 'from-orange-500 to-amber-700',
        text: 'text-orange-400',
        badge: 'bg-orange-500',
      };

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
            className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${themeColor.bg} opacity-75 blur-sm animate-pulse`}
          />

          {/* Circular Bot Body */}
          <div
            onClick={() => setIsExpanded(true)}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950/95 border-2 border-white/20 p-1 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl ${themeColor.glow} transition-transform active:scale-95`}
          >
            {/* Top tiny status pill */}
            <div className="absolute -top-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
              <span className={`w-1.5 h-1.5 rounded-full ${hasSignal ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
              <span>{hasSignal ? `${roundCountdown}s` : 'READY'}</span>
            </div>

            {/* Main Predicted House or Standby Icon */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-[9px] text-amber-300 font-bold mt-1">স্ক্যান...</span>
              </div>
            ) : hasSignal && rec ? (
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">
                  {lang === 'bn' ? 'ঘর' : 'HOUSE'}
                </span>
                <span className={`text-2xl sm:text-3xl font-black italic tracking-tight ${themeColor.text} drop-shadow-md`}>
                  {rec}
                </span>
                <span className="text-xs font-black text-white font-mono block -mt-0.5">
                  {prediction.confidencePercent}%
                </span>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <Eye className="w-5 h-5 text-cyan-400 mb-0.5 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-300 tracking-wider">
                  SCAN
                </span>
                <span className="text-[8px] text-slate-400 font-semibold leading-none">
                  রেডি
                </span>
              </div>
            )}

            {/* Bottom mini status badge */}
            <div className="absolute -bottom-2 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-bold shadow-md">
              {hasSignal && prediction ? (
                <>
                  <span className="text-blue-400">A:{prediction.probabilityA}%</span>
                  <span className="text-emerald-400">B:{prediction.probabilityB}%</span>
                  <span className="text-orange-400">C:{prediction.probabilityC}%</span>
                </>
              ) : (
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>জিরো-ফেক</span>
                </span>
              )}
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
                  <span>{lang === 'bn' ? 'গোল্ডেন ফ্লাওয়ার এআই বাবল' : 'Golden Flower AI Bubble'}</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ● {hasSignal ? (lang === 'bn' ? 'লাইভ সিগনাল সক্রিয়' : 'Live Signal Active') : (lang === 'bn' ? 'স্ট্যান্ডবাই — জিরো ফেক' : 'Standby Mode')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset button */}
              {hasSignal && onResetSignal && (
                <button
                  onClick={onResetSignal}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="সিগনাল ক্লিয়ার করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
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

          {/* Body */}
          {hasSignal && prediction && rec ? (
            <>
              {/* Hero Signal Badge */}
              <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    {lang === 'bn' ? 'সর্বোচ্চ সম্ভাব্য ঘর' : 'Strongest Signal House'}
                  </span>
                  <div className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
                    <span className={themeColor.text}>
                      {lang === 'bn' ? `ঘর ${rec}` : `House ${rec}`}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      x2.98
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    {lang === 'bn' ? 'সম্ভাবনা' : 'Odds'}
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {prediction.confidencePercent}%
                  </span>
                </div>
              </div>

              {/* Mini 3-Houses Progress Bars */}
              <div className="space-y-1.5 mb-3 text-xs">
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="text-blue-400">House A: {prediction.probabilityA}%</span>
                  <span className="text-emerald-400">House B: {prediction.probabilityB}%</span>
                  <span className="text-orange-400">House C: {prediction.probabilityC}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="h-full bg-blue-500" style={{ width: `${prediction.probabilityA}%` }} />
                  <div className="h-full bg-emerald-500" style={{ width: `${prediction.probabilityB}%` }} />
                  <div className="h-full bg-orange-500" style={{ width: `${prediction.probabilityC}%` }} />
                </div>
              </div>

              {/* Bangla Alert text */}
              <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed mb-3">
                {prediction.banglaVoiceAlert}
              </p>
            </>
          ) : (
            /* Standby State inside Bubble */
            <div className="my-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
              <Eye className="w-6 h-6 text-cyan-400 mb-2 animate-pulse" />
              <h5 className="text-xs font-bold text-white mb-1">
                {lang === 'bn' ? 'কোনো ভুয়া সিগনাল নেই — স্ট্যান্ডবাই' : 'Standby — Zero Fake Signals'}
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                {lang === 'bn'
                  ? 'সঠিক প্রেডিকশন পেতে ক্যামেরা বা স্ক্রিনশটের মাধ্যমে Poppo Live স্ক্রিনটি স্ক্যান করুন।'
                  : 'Scan the Poppo Live screen via camera or screenshot to get real-time predictions.'}
              </p>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onForceScan();
                playAlertChime('predict');
              }}
              disabled={isLoading}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isLoading ? (lang === 'bn' ? 'স্ক্যান হচ্ছে...' : 'Scanning...') : (lang === 'bn' ? 'এখনই স্ক্যান করুন' : 'Scan Live Screen')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
