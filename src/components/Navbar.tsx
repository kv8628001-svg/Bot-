import React from 'react';
import { Sparkles, Volume2, VolumeX, Smartphone, Cpu, Download } from 'lucide-react';

interface NavbarProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  isInstallable: boolean;
  onInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  setSoundEnabled,
  voiceEnabled,
  setVoiceEnabled,
  lang,
  setLang,
  isInstallable,
  onInstall,
}) => {
  return (
    <header className="border-b border-purple-900/40 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-blue-600 p-[2px] shadow-lg shadow-emerald-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                {lang === 'bn' ? 'পোপ্পো অ্যান্ড্রয়েড এআই বট' : 'Poppo Android AI Bot'}
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold font-mono">
                🤖 ANDROID
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? 'গোল্ডেন ফ্লাওয়ার গেমের জন্য অ্যান্ড্রয়েড ভাসমান বাবল বট'
                : 'Android Floating Bubble Bot for Poppo Live'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct APK Download Button */}
          <a
            href="https://github.com/kv8628001-svg/Bot-/releases/latest/download/PoppoLive-GoldenFlower-AI-Bot.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all border border-emerald-400/30 animate-pulse"
            title="সরাসরি সর্বশেষ অফিসিয়াল অ্যান্ড্রয়েড APK ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'APK ডাউনলোড (নতুন)' : 'Download APK'}</span>
          </a>

          {/* Android PWA Install Button */}
          {isInstallable && (
            <button
              onClick={onInstall}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 flex items-center gap-1 border border-emerald-500/30 shadow-md transition-all"
              title="অ্যান্ড্রয়েড ফোনে অ্যাপটি ইনস্টল করুন"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
            </button>
          )}

          {/* Audio Chime Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all border ${
              soundEnabled
                ? 'bg-purple-900/30 border-purple-500/40 text-purple-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'সাউন্ড অন' : 'সাউন্ড অফ'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{lang === 'bn' ? 'সাউন্ড' : 'Sound'}</span>
          </button>

          {/* Bengali Voice Announcer Button */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              voiceEnabled
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-sm shadow-rose-900/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="বাংলা ভয়েস অ্যানাউন্সমেন্ট অন/অফ"
          >
            <Cpu className={`w-3.5 h-3.5 ${voiceEnabled ? 'text-rose-400 animate-spin' : ''}`} />
            <span>{lang === 'bn' ? (voiceEnabled ? 'বাংলা ভয়েস: চালু' : 'ভয়েস: বন্ধ') : (voiceEnabled ? 'Voice: ON' : 'Voice: OFF')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>
    </header>
  );
};
