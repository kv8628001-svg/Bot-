import React from 'react';
import { GameRound, HouseWinner } from '../types';
import {
  RotateCcw,
  Plus,
  Flame,
  Activity,
  History,
  TrendingUp,
} from 'lucide-react';

interface RoadmapBoardProps {
  history: GameRound[];
  onAddRound: (winner: HouseWinner) => void;
  onClearHistory: () => void;
  onLoadPreset: (type: 'balanced' | 'b_streak' | 'c_streak') => void;
  lang: 'bn' | 'en';
}

export const RoadmapBoard: React.FC<RoadmapBoardProps> = ({
  history,
  onAddRound,
  onClearHistory,
  onLoadPreset,
  lang,
}) => {
  const totalRounds = history.length;
  const aWins = history.filter((r) => r.winner === 'A').length;
  const bWins = history.filter((r) => r.winner === 'B').length;
  const cWins = history.filter((r) => r.winner === 'C').length;

  const aPct = totalRounds > 0 ? Math.round((aWins / totalRounds) * 100) : 33;
  const bPct = totalRounds > 0 ? Math.round((bWins / totalRounds) * 100) : 34;
  const cPct = totalRounds > 0 ? Math.round((cWins / totalRounds) * 100) : 33;

  // Streak counter
  let currentStreak = 0;
  let streakWinner: HouseWinner | null = null;
  if (history.length > 0) {
    const lastWinner = history[history.length - 1].winner;
    streakWinner = lastWinner;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].winner === lastWinner) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'bn' ? 'পোপ্পো লাইভ লুদান হিস্ট্রি (Roadmap Bar)' : 'Poppo Live Roadmap History Bar'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'নিচের গোল্ডেন ফ্লাওয়ার স্ক্রলবারের মতো বিগত রাউন্ডের A, B, C উইনার সিকোয়েন্স'
              : 'Sequential winner beads A, B, C matching Poppo Live table bottom bar'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLoadPreset('balanced')}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            {lang === 'bn' ? 'রিয়েল স্ক্রিন হিস্ট্রি' : 'Live Screen Preset'}
          </button>
          <button
            onClick={() => onLoadPreset('b_streak')}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 transition-colors"
          >
            {lang === 'bn' ? 'B ট্রেন্ড' : 'B Streak'}
          </button>
          <button
            onClick={() => onLoadPreset('c_streak')}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-orange-950/60 hover:bg-orange-900/60 border border-orange-800 text-orange-300 transition-colors"
          >
            {lang === 'bn' ? 'C ট্রেন্ড' : 'C Streak'}
          </button>
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="সাফ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 uppercase font-medium block">
            {lang === 'bn' ? 'মোট রাউন্ড' : 'Total Rounds'}
          </span>
          <span className="text-base font-bold text-slate-100 font-mono">{totalRounds}</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-blue-400 uppercase font-medium block">
            A (নীল ডিলার)
          </span>
          <span className="text-base font-bold text-blue-400 font-mono">
            {aWins} ({aPct}%)
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 uppercase font-medium block">
            B (সবুজ ডিলার)
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {bWins} ({bPct}%)
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-orange-400 uppercase font-medium block">
            C (কমলা ডিলার)
          </span>
          <span className="text-base font-bold text-orange-400 font-mono">
            {cWins} ({cPct}%)
          </span>
        </div>
      </div>

      {/* Active Streak Banner */}
      {currentStreak >= 2 && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {lang === 'bn'
                ? `🔥 ঘর ${streakWinner} এর স্ট্রিক চলছে (পরপর ${currentStreak} বার জয়)!`
                : `🔥 House ${streakWinner} Streak Active (${currentStreak} consecutive wins)!`}
            </span>
          </span>
          <span className="text-[11px] text-amber-300/80 font-mono hidden sm:inline">
            x2.98 Multiplier
          </span>
        </div>
      )}

      {/* Authentic Poppo Live Horizontal History Bar: [ < ] [ ? ] [ C ] [ B ] [ A ] ... */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/90 overflow-x-auto flex items-center gap-2">
        <span className="text-cyan-400 font-bold text-xs flex-shrink-0 px-2 py-1 rounded bg-slate-900 border border-slate-800">
          ◀ ?
        </span>

        <div className="flex items-center gap-1.5 flex-1 min-w-[320px]">
          {history.slice(-18).map((round, idx) => {
            const isWinnerA = round.winner === 'A';
            const isWinnerB = round.winner === 'B';
            return (
              <div
                key={round.id || idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif italic font-bold text-base shadow-sm transition-transform hover:scale-110 flex-shrink-0 ${
                  isWinnerA
                    ? 'bg-blue-950/70 border border-blue-500/60 text-cyan-300'
                    : isWinnerB
                    ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300'
                    : 'bg-orange-950/70 border border-orange-500/60 text-orange-300'
                }`}
                title={`Round #${round.roundNumber}: House ${round.winner}`}
              >
                {round.winner}
              </div>
            );
          })}
        </div>

        <span className="text-cyan-400 font-bold text-xs flex-shrink-0 px-2 py-1 rounded bg-slate-900 border border-slate-800">
          ▶
        </span>
      </div>

      {/* Manual Logger Toolbar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <span className="text-xs text-slate-400 font-medium">
          {lang === 'bn' ? 'ম্যানুয়ালি রাউন্ড যোগ করুন:' : 'Add Winner manually:'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddRound('A')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-blue-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ A (নীল)</span>
          </button>
          <button
            onClick={() => onAddRound('B')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-emerald-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ B (সবুজ)</span>
          </button>
          <button
            onClick={() => onAddRound('C')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-orange-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ C (কমলা)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
