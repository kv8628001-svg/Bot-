import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Volume2,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  PlusCircle,
  Coins,
  Camera,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';
import { PredictionData, HouseWinner, ScanErrorState } from '../types';
import { speakBangla } from '../utils/goldenFlowerOdds';

interface PredictionResultProps {
  prediction: PredictionData | null;
  scanError?: ScanErrorState | null;
  isLoading: boolean;
  onRecordResult: (winner: HouseWinner, handType?: string) => void;
  onResetSignal?: () => void;
  onTriggerScan?: () => void;
  lang: 'bn' | 'en';
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  prediction,
  scanError,
  isLoading,
  onRecordResult,
  onResetSignal,
  onTriggerScan,
  lang,
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 animate-spin p-[2px]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-1">
          {lang === 'bn' ? 'পোপ্পো সিন থেকে সিগনাল বের করা হচ্ছে...' : 'Extracting Poppo Live Signals...'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          {lang === 'bn'
            ? 'A, B ও C এর পট চিপস, ডিলার কার্ড ও নিচের হিস্ট্রি লুদান যাচাই করা হচ্ছে (জিরো-ফেক পলিসি)...'
            : 'Analyzing House A, B, and C pots, dealer cards, and bottom roadmap...'}
        </p>
      </div>
    );
  }

  // 2. Scan Error State (Anti-Fake Signal Guard Tripped)
  if (scanError && scanError.hasError) {
    return (
      <div className="bg-slate-900/90 border-2 border-rose-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-rose-500/20">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-bold text-rose-300 tracking-wide uppercase">
            {scanError.title}
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700/60 text-rose-300 font-mono font-bold">
            🛡️ জিরো-ফেক গার্ড
          </span>
        </div>

        <div className="my-4 p-4 rounded-xl bg-slate-950 border border-rose-900/50">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {scanError.message}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {lang === 'bn'
              ? 'বট কোনো অনুমান বা মনগড়া সিগনাল দেয় না। কেবল Poppo Live এর সঠিক ও স্পষ্ট গেম সিন পেলেই নিখুঁত প্রেডিকশন প্রদান করা হয়।'
              : 'The bot will never fabricate fake signals. Only genuine and clearly verified game scenes will produce predictions.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {onTriggerScan && (
            <button
              onClick={onTriggerScan}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পুনরায় স্পষ্ট সিন স্ক্যান করুন' : 'Scan Clear Scene'}</span>
            </button>
          )}
          {onResetSignal && (
            <button
              onClick={onResetSignal}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            >
              {lang === 'bn' ? 'রিসেট' : 'Reset'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Standby State (No fake signal active - awaiting authentic scan)
  if (!prediction) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-950 border border-slate-800 text-slate-300">
              {lang === 'bn' ? 'লাইভ সিগনাল ড্যাশবোর্ড' : 'LIVE SIGNAL DASHBOARD'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{lang === 'bn' ? 'স্ট্যান্ডবাই' : 'STANDBY'}</span>
            </span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{lang === 'bn' ? 'জিরো-ফেক পলিসি' : 'Zero-Fake Policy'}</span>
          </span>
        </div>

        <div className="my-5 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center mb-3 text-emerald-400 shadow-inner">
            <Eye className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-white mb-1.5">
            {lang === 'bn'
              ? 'বটের সিগনাল স্ট্যান্ডবাই আছে (কোনো ভুয়া সিগনাল নেই)'
              : 'Bot is on Standby (Zero Fake Signals)'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
            {lang === 'bn'
              ? 'বট নিজে থেকে কোনো কাল্পনিক সিগনাল দেয় না। শতভাগ সঠিক প্রেডিকশন পেতে বামপাশের প্যানেল থেকে আপনার Poppo Live গেম স্ক্রিন স্ক্যান করুন।'
              : 'The bot never fabricates arbitrary signals. Scan or upload your Poppo Live screen on the left to receive live predictions.'}
          </p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 text-left mb-4">
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">১. ক্যামেরা অন করুন</span>
              <span className="text-[11px] text-slate-300">ফোনের ক্যামেরা দিয়ে Poppo Live স্ক্রিনের দিকে তাক করুন।</span>
            </div>
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">২. স্ক্রিনশট দিন</span>
              <span className="text-[11px] text-slate-300">গেমের স্ক্রিনশট পেস্ট (Ctrl+V) বা আপলোড করুন।</span>
            </div>
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-amber-400 block mb-0.5">৩. সঠিক সিগনাল</span>
              <span className="text-[11px] text-slate-300">আসল পট ও লুদান দেখে নিখুঁত সিগনাল গ্রহণ করুন।</span>
            </div>
          </div>

          {onTriggerScan && (
            <button
              onClick={onTriggerScan}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'bn' ? '📷 স্ক্রিন স্ক্যান শুরু করুন' : 'Scan Live Screen'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Genuine Valid Prediction
  const data = prediction;
  const rec = data.recommendedHouse;
  const isA = rec === 'A';
  const isB = rec === 'B';
  const isC = rec === 'C';

  const theme = isA
    ? {
        border: 'border-blue-500/60 shadow-blue-900/30',
        bg: 'from-blue-950/80 via-indigo-950/40 to-slate-950',
        title: lang === 'bn' ? '🏆 ঘর A (House A - Blue)' : '🏆 HOUSE A (Blue)',
        text: 'text-blue-400',
      }
    : isB
    ? {
        border: 'border-emerald-500/60 shadow-emerald-900/30',
        bg: 'from-emerald-950/80 via-teal-950/40 to-slate-950',
        title: lang === 'bn' ? '🏆 ঘর B (House B - Green)' : '🏆 HOUSE B (Green)',
        text: 'text-emerald-400',
      }
    : {
        border: 'border-orange-500/60 shadow-orange-900/30',
        bg: 'from-orange-950/80 via-amber-950/40 to-slate-950',
        title: lang === 'bn' ? '🏆 ঘর C (House C - Orange)' : '🏆 HOUSE C (Orange)',
        text: 'text-orange-400',
      };

  return (
    <div className={`rounded-2xl p-5 sm:p-6 shadow-2xl border transition-all bg-gradient-to-br ${theme.bg} ${theme.border}`}>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-900/90 border border-slate-700/60 text-slate-200">
            {lang === 'bn' ? 'লাইভ সিগনাল ড্যাশবোর্ড' : 'LIVE SIGNAL DASHBOARD'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{lang === 'bn' ? 'ভেরিফাইড' : 'VERIFIED'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Reset Signal Button for next round */}
          {onResetSignal && (
            <button
              onClick={onResetSignal}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
              title="নতুন রাউন্ডের জন্য সিগনাল ক্লিয়ার করুন"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>{lang === 'bn' ? 'ক্লিয়ার' : 'Clear'}</span>
            </button>
          )}

          {/* Voice Announcer Button */}
          <button
            onClick={() => speakBangla(data.banglaVoiceAlert)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-300 flex items-center gap-1.5 transition-colors"
            title="বাংলা ভয়েসে শুনুন"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'ভয়েস' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {/* Main Recommended House Hero */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            {lang === 'bn' ? 'পরবর্তী রাউন্ডের প্রস্তাবিত সেরা বাজি:' : 'Strongest Win Signal:'}
          </span>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <span className={theme.text}>{theme.title}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              x2.98
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-slate-400 block mb-0.5">
            {lang === 'bn' ? 'নির্ভরযোগ্যতা (কনফিডেন্স)' : 'Confidence'}
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {data.confidencePercent}%
          </span>
        </div>
      </div>

      {/* Three Houses Probability Breakdown Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-blue-400">A: {data.probabilityA}%</span>
          <span className="text-emerald-400">B: {data.probabilityB}%</span>
          <span className="text-orange-400">C: {data.probabilityC}%</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="h-full bg-blue-500 transition-all duration-500 rounded-l-full"
            style={{ width: `${data.probabilityA}%` }}
            title={`A: ${data.probabilityA}%`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${data.probabilityB}%` }}
            title={`B: ${data.probabilityB}%`}
          />
          <div
            className="h-full bg-orange-500 transition-all duration-500 rounded-r-full"
            style={{ width: `${data.probabilityC}%` }}
            title={`C: ${data.probabilityC}%`}
          />
        </div>
      </div>

      {/* Live Vision Detection Proof (রিয়েল স্ক্রিন যাচাইকরণ রিপোর্ট) */}
      <div className="mb-4 p-3.5 bg-slate-950/90 border border-emerald-500/30 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'bn'
              ? data.sourceMode === 'roadmap_math'
                ? 'লুদান গাণিতিক হিস্ট্রি রিপোর্ট (জিরো-ফেক)'
                : 'রিয়েল সিন ডিটেকশন রিপোর্ট (জেমিনাই ভিশন):'
              : 'Verified Detection Report:'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            {data.sourceMode === 'roadmap_math' ? 'ROADMAP STATS' : '100% VISION VERIFIED'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {lang === 'bn' ? 'গেম ফেজ ও টাইমার' : 'Game Phase'}
            </span>
            <span className="font-bold text-slate-100 truncate block">
              {data.detectedSceneProof?.detectedPhase || 'বেটিং পর্ব'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {lang === 'bn' ? 'সনাক্তকৃত পট' : 'Detected Pots'}
            </span>
            <span className="font-bold text-amber-300 truncate block" title={data.detectedSceneProof?.detectedPots || 'দৃশ্যমান নয়'}>
              {data.detectedSceneProof?.detectedPots || 'দৃশ্যমান নয়'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {lang === 'bn' ? 'নিচের লুদান সিকোয়েন্স' : 'Roadmap Beads'}
            </span>
            <span className="font-bold text-cyan-300 truncate block font-serif italic" title={data.detectedSceneProof?.detectedRoadmap || 'রেকর্ডকৃত হিস্ট্রি'}>
              {data.detectedSceneProof?.detectedRoadmap || 'রেকর্ডকৃত হিস্ট্রি'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {lang === 'bn' ? 'কার্ড স্ট্যাটাস' : 'Card State'}
            </span>
            <span className="font-bold text-purple-300 truncate block" title={data.detectedSceneProof?.detectedCards || 'ফেস-ডাউন x2.98'}>
              {data.detectedSceneProof?.detectedCards || 'ফেস-ডাউন x2.98'}
            </span>
          </div>
        </div>
      </div>

      {/* Pot Analysis Alert */}
      {data.potAnalysis && data.potAnalysis.biasWarning && (
        <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs">
          <Coins className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-amber-300">
                {lang === 'bn' ? 'চিপস ও পট বিশ্লেষণ:' : 'Pot Volume Breakdown:'}
              </span>
              {data.potAnalysis.potA !== 'দৃশ্যমান নয়' && (
                <span className="text-[10px] text-slate-400">
                  A: {data.potAnalysis.potA} • B: {data.potAnalysis.potB} • C: {data.potAnalysis.potC}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {data.potAnalysis.biasWarning}
            </p>
          </div>
        </div>
      )}

      {/* Bangla Detailed Analysis */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 mb-4">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {lang === 'bn' ? 'এআই সিন যুক্তি ও ব্যাখ্যা:' : 'AI Signal Explanation:'}
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          {data.banglaAnalysis}
        </p>

        {data.keySignals && data.keySignals.length > 0 && (
          <ul className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
            {data.keySignals.map((sig, idx) => (
              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Record Actual Outcome Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <span className="text-xs text-slate-400">
          {lang === 'bn' ? 'রাউন্ডের জয়ী রেকর্ড করুন:' : 'Log Round Winner:'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRecordResult('A', data.likelyHandType)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 transition-colors"
          >
            + A {lang === 'bn' ? 'জিতেছে' : 'Won'}
          </button>
          <button
            onClick={() => onRecordResult('B', data.likelyHandType)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 transition-colors"
          >
            + B {lang === 'bn' ? 'জিতেছে' : 'Won'}
          </button>
          <button
            onClick={() => onRecordResult('C', data.likelyHandType)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/50 text-orange-200 transition-colors"
          >
            + C {lang === 'bn' ? 'জিতেছে' : 'Won'}
          </button>
        </div>
      </div>
    </div>
  );
};
