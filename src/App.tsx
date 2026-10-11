/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VisionScanner } from './components/VisionScanner';
import { PredictionResult } from './components/PredictionResult';
import { RoadmapBoard } from './components/RoadmapBoard';
import { StrategyGuide } from './components/StrategyGuide';
import { AiAdvisorChat } from './components/AiAdvisorChat';
import { PredictionData, GameRound, HouseWinner, ScanErrorState } from './types';
import { playAlertChime, speakBangla, triggerAndroidVibration } from './utils/goldenFlowerOdds';
import { useAndroidInstall } from './hooks/useAndroidInstall';
import {
  Sparkles,
  Radio,
  Download,
  Smartphone,
  Flame,
  Layers,
  History,
  BookOpen,
  MessageSquare,
  Zap,
} from 'lucide-react';

const STORAGE_KEY = 'poppo_golden_flower_history_v2';

// Seed initial history matching user's exact uploaded screenshot: [ C, B, A, C, A, C, B, A, C, B ]
const INITIAL_ROUNDS: GameRound[] = [
  { id: '1', roundNumber: 849190, winner: 'C', timestamp: Date.now() - 360000 },
  { id: '2', roundNumber: 849191, winner: 'B', timestamp: Date.now() - 320000 },
  { id: '3', roundNumber: 849192, winner: 'A', timestamp: Date.now() - 280000 },
  { id: '4', roundNumber: 849193, winner: 'C', timestamp: Date.now() - 240000 },
  { id: '5', roundNumber: 849194, winner: 'A', timestamp: Date.now() - 200000 },
  { id: '6', roundNumber: 849195, winner: 'C', timestamp: Date.now() - 160000 },
  { id: '7', roundNumber: 849196, winner: 'B', timestamp: Date.now() - 120000 },
  { id: '8', roundNumber: 849197, winner: 'A', timestamp: Date.now() - 80000 },
  { id: '9', roundNumber: 849198, winner: 'C', timestamp: Date.now() - 40000 },
  { id: '10', roundNumber: 849199, winner: 'B', timestamp: Date.now() - 10000 },
];

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [scanError, setScanError] = useState<ScanErrorState | null>(null);

  // Android Mobile Active Tab: 'signals' | 'roadmap' | 'strategy' | 'chat'
  const [mobileTab, setMobileTab] = useState<'signals' | 'roadmap' | 'strategy' | 'chat'>('signals');

  const { isInstallable, installOnAndroid, isAndroid } = useAndroidInstall();

  // History rounds
  const [history, setHistory] = useState<GameRound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROUNDS;
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Reset current signal for next round
  const handleResetSignal = () => {
    setPrediction(null);
    setScanError(null);
  };

  // Main visual scene analysis trigger - strictly authentic, zero fake signals
  const handleAnalyzeScene = async (imageBase64: string) => {
    setIsLoading(true);
    setScanError(null);
    try {
      const res = await fetch('/api/analyze-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          pastRounds: history.slice(-10).map((r) => r.winner),
        }),
      });

      const json = await res.json();

      if (json?.success && json?.data) {
        setPrediction(json.data);
        setScanError(null);

        // Android Haptic Vibration
        if (vibrationEnabled) {
          triggerAndroidVibration([100, 50, 100]);
        }

        if (soundEnabled) playAlertChime('predict');
        if (voiceEnabled && json.data.banglaVoiceAlert) speakBangla(json.data.banglaVoiceAlert);
      } else {
        // Validation failed or scene unrecognized: NO FAKE SIGNAL!
        setPrediction(null);
        const errorMsg = json?.error || (lang === 'bn'
          ? 'Poppo Live গেম টেবিল স্পষ্টভাবে সনাক্ত করা যায়নি। কোনো ভুয়া সিগনাল প্রতিরোধ করা হয়েছে।'
          : 'Poppo Live game table could not be identified clearly. Fake signals prevented.');
        
        setScanError({
          hasError: true,
          title: lang === 'bn' ? '⚠️ ভুয়া সিগনাল প্রতিরোধ করা হয়েছে' : '⚠️ Fake Signal Prevented',
          message: errorMsg,
        });

        if (soundEnabled) playAlertChime('high_risk');
        if (voiceEnabled) {
          speakBangla(lang === 'bn' ? 'সঠিক গেম সিন সনাক্ত হয়নি। ভুয়া সিগনাল দেওয়া বন্ধ রয়েছে।' : 'Valid scene not detected. Fake signal blocked.');
        }
      }
    } catch (err: any) {
      // Network or parsing error: NEVER fabricate fake numbers!
      setPrediction(null);
      setScanError({
        hasError: true,
        title: lang === 'bn' ? '⚠️ কানেকশন এরর — সিগনাল স্থগিত' : '⚠️ Connection Error',
        message: lang === 'bn'
          ? 'সার্ভারের সাথে সংযোগ ব্যাহত হয়েছে। কোনো কাল্পনিক বা ভুয়া প্রেডিকশন না দিয়ে অপেক্ষা করা হচ্ছে।'
          : 'Failed to communicate with server. Zero fake signals generated.',
      });
      if (soundEnabled) playAlertChime('high_risk');
    } finally {
      setIsLoading(false);
    }
  };

  // Add round to history
  const handleAddRound = (winner: HouseWinner, handType?: string) => {
    const nextRoundNumber = history.length > 0 ? history[history.length - 1].roundNumber + 1 : 849200;
    const newRound: GameRound = {
      id: String(Date.now()),
      roundNumber: nextRoundNumber,
      winner,
      handType,
      timestamp: Date.now(),
    };
    setHistory((prev) => [...prev, newRound]);
  };

  const handleClearHistory = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি হিস্ট্রি মুছে ফেলতে চান?' : 'Clear all round history?')) {
      setHistory([]);
    }
  };

  const handleLoadPreset = (type: 'balanced' | 'b_streak' | 'c_streak') => {
    const baseNum = 849200;
    let winners: HouseWinner[] = [];
    if (type === 'balanced') {
      winners = ['C', 'B', 'A', 'C', 'A', 'C', 'B', 'A', 'C', 'B'];
    } else if (type === 'b_streak') {
      winners = ['A', 'C', 'B', 'B', 'B', 'B', 'A', 'B', 'B', 'B'];
    } else {
      winners = ['A', 'B', 'C', 'C', 'C', 'C', 'B', 'C', 'C', 'A'];
    }

    const seeded: GameRound[] = winners.map((w, idx) => ({
      id: String(idx + 1),
      roundNumber: baseNum + idx,
      winner: w,
      timestamp: Date.now() - (10 - idx) * 30000,
    }));
    setHistory(seeded);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16 md:pb-6">
      {/* Top Navbar */}
      <Navbar
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        lang={lang}
        setLang={setLang}
        isInstallable={isInstallable}
        onInstall={installOnAndroid}
      />

      {/* Android Mobile Install Banner if eligible */}
      {isInstallable && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">
              {lang === 'bn'
                ? '📲 আপনার অ্যান্ড্রয়েড ফোনে অ্যাপটি ইনস্টল করুন'
                : 'Install Android App on your home screen'}
            </span>
          </div>
          <button
            onClick={installOnAndroid}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ইনস্টল' : 'Install'}</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        {/* Android Quick Mode Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">
              {lang === 'bn' ? 'অ্যান্ড্রয়েড গেমিং বাবল অ্যাসিস্ট্যান্ট' : 'Android Gaming Bubble Assistant'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold">
              POPPO LIVE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {/* Vibration Toggle */}
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                vibrationEnabled
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="অ্যান্ড্রয়েড ফোন ভাইব্রেশন"
            >
              📳 {vibrationEnabled ? (lang === 'bn' ? 'ভাইব্রেশন: অন' : 'Vibrate: ON') : (lang === 'bn' ? 'ভাইব্রেশন: অফ' : 'Vibrate: OFF')}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (visible on mobile / small devices) */}
        <div className="flex lg:hidden items-center justify-between p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setMobileTab('signals')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'signals'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সিগনাল ও বট' : 'Signals'}</span>
          </button>

          <button
            onClick={() => setMobileTab('roadmap')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'roadmap'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লুদান হিস্ট্রি' : 'Roadmap'}</span>
          </button>

          <button
            onClick={() => setMobileTab('strategy')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'strategy'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কৌশল' : 'Guide'}</span>
          </button>

          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'chat'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'এআই চ্যাট' : 'Chat'}</span>
          </button>
        </div>

        {/* Primary Content Grid */}
        <div className="space-y-6">
          {/* Section 1: Scanner + Prediction Result (Desktop: Side by Side, Mobile: Tab Driven) */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-5 items-start ${
              mobileTab !== 'signals' ? 'hidden lg:grid' : ''
            }`}
          >
            {/* Left: Video Scanner with Android Floating Round Bot (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <VisionScanner
                onAnalyze={handleAnalyzeScene}
                isLoading={isLoading}
                prediction={prediction}
                scanError={scanError}
                onResetSignal={handleResetSignal}
                lang={lang}
              />
            </div>

            {/* Right: AI Signal Breakdown Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <PredictionResult
                prediction={prediction}
                scanError={scanError}
                isLoading={isLoading}
                onRecordResult={handleAddRound}
                onResetSignal={handleResetSignal}
                lang={lang}
              />
            </div>
          </div>

          {/* Section 2: Historical Roadmap Bead Bar */}
          <div className={mobileTab !== 'roadmap' ? 'hidden lg:block' : ''}>
            <RoadmapBoard
              history={history}
              onAddRound={handleAddRound}
              onClearHistory={handleClearHistory}
              onLoadPreset={handleLoadPreset}
              lang={lang}
            />
          </div>

          {/* Section 3: Strategy Guide & AI Advisor Chat */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-5 items-start ${
              mobileTab !== 'strategy' && mobileTab !== 'chat' ? 'hidden lg:grid' : ''
            }`}
          >
            <div className={`lg:col-span-7 ${mobileTab === 'chat' ? 'hidden lg:block' : ''}`}>
              <StrategyGuide lang={lang} />
            </div>
            <div className={`lg:col-span-5 ${mobileTab === 'strategy' ? 'hidden lg:block' : ''}`}>
              <AiAdvisorChat lang={lang} />
            </div>
          </div>
        </div>
      </main>

      {/* Android Mobile Bottom Sticky App Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 flex lg:hidden items-center justify-around text-[10px]">
        <button
          onClick={() => setMobileTab('signals')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'signals' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4 mb-0.5" />
          <span>{lang === 'bn' ? 'সিগনাল' : 'Signals'}</span>
        </button>

        <button
          onClick={() => setMobileTab('roadmap')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'roadmap' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span>{lang === 'bn' ? 'লুদান' : 'Roadmap'}</span>
        </button>

        <button
          onClick={() => setMobileTab('strategy')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'strategy' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>{lang === 'bn' ? 'কৌশল' : 'Guide'}</span>
        </button>

        <button
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'chat' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>{lang === 'bn' ? 'চ্যাট' : 'Chat'}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500 hidden md:block">
        <p>
          {lang === 'bn'
            ? 'পোপ্পো লাইভ অ্যান্ড্রয়েড গোল্ডেন ফ্লাওয়ার (A, B, C • x2.98) এআই বট • গুগল জেমিনাই ভিশন ৩.১ দ্বারা চালিত'
            : 'Poppo Live Android Golden Flower AI Bot • Powered by Google Gemini 3.1 Vision'}
        </p>
      </footer>
    </div>
  );
}
