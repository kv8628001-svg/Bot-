import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Monitor,
  Upload,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Scan,
  Maximize2,
  Radio,
  Clock,
} from 'lucide-react';
import { generatePoppoLiveDemoScene } from '../utils/goldenFlowerOdds';
import { FloatingRoundBot } from './FloatingRoundBot';
import { PredictionData } from '../types';

interface VisionScannerProps {
  onAnalyze: (base64Image: string) => Promise<void>;
  isLoading: boolean;
  prediction: PredictionData | null;
  lang: 'bn' | 'en';
}

export const VisionScanner: React.FC<VisionScannerProps> = ({
  onAnalyze,
  isLoading,
  prediction,
  lang,
}) => {
  const [activeMode, setActiveMode] = useState<'demo' | 'screen' | 'camera' | 'upload'>('demo');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(false);
  const [autoScanIntervalSec, setAutoScanIntervalSec] = useState<number>(12);
  const [countdown, setCountdown] = useState<number>(12);
  const [selectedDemo, setSelectedDemo] = useState<'betting_phase' | 'reveal_phase' | 'c_streak'>('betting_phase');
  const [showFloatingBot, setShowFloatingBot] = useState<boolean>(true);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoScanTimerRef = useRef<any>(null);

  // Load initial demo scene (exact betting phase from user screenshot)
  useEffect(() => {
    const demo = generatePoppoLiveDemoScene('betting_phase');
    setCurrentImage(demo);
  }, []);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Start Screen Capture (for phone mirror / desktop emulator)
  const startScreenCapture = async () => {
    try {
      stopStream();

      // Feature-detect getDisplayMedia (mobile browsers & restricted iframes do not support it)
      if (!navigator?.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
        alert(
          lang === 'bn'
            ? 'আপনার বর্তমান ব্রাউজার বা ডিভাইসে সরাসরি স্ক্রিন শেয়ার (getDisplayMedia) অপশনটি নেই। অনুগ্রহ করে "📷 ক্যামেরা" দিয়ে লাইভ ধরুন অথবা "🖼️ ছবি পেস্ট / তুলুন" দিয়ে স্ক্রিনশট দিন।'
            : 'Screen capture is not supported on this mobile device/browser. Please use Camera or Screenshot Upload instead.'
        );
        // Automatically switch to camera or upload mode
        setActiveMode('upload');
        fileInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamActive(true);
      setActiveMode('screen');

      stream.getVideoTracks()[0].onended = () => {
        stopStream();
      };
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        console.warn('Screen capture cancelled or unavailable:', err);
      }
    }
  };

  // One-click clipboard image paste
  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard && typeof navigator.clipboard.read === 'function') {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const file = new File([blob], 'poppo_screenshot.png', { type });
              handleFileUpload(file);
              return;
            }
          }
        }
      }
      // If clipboard read not permitted or empty, open file picker
      fileInputRef.current?.click();
    } catch {
      fileInputRef.current?.click();
    }
  };

  // Start Camera Feed
  const startCameraCapture = async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamActive(true);
      setActiveMode('camera');
    } catch (err) {
      console.warn('Camera stream unavailable, opening camera snapshot picker:', err);
      // Fallback to native device camera photo capture
      mobileCameraInputRef.current?.click();
    }
  };

  // Capture current video frame to base64
  const captureFrameFromVideo = (): string | null => {
    if (!videoRef.current || !streamActive) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCurrentImage(dataUrl);
    return dataUrl;
  };

  // Handle Demo Selection
  const handleSelectDemo = (type: 'betting_phase' | 'reveal_phase' | 'c_streak') => {
    stopStream();
    setSelectedDemo(type);
    setActiveMode('demo');
    const demo = generatePoppoLiveDemoScene(type);
    setCurrentImage(demo);
  };

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    stopStream();
    setActiveMode('upload');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCurrentImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Support (Ctrl+V anywhere on window)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileUpload(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Trigger Analysis
  const handleTriggerAnalyze = async () => {
    let imgToAnalyze = currentImage;
    if (streamActive) {
      const captured = captureFrameFromVideo();
      if (captured) imgToAnalyze = captured;
    }
    if (!imgToAnalyze) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে প্রথমে একটি স্ক্রিন বা ছবি নির্বাচন করুন।' : 'Please select a screen or image first.');
      return;
    }
    await onAnalyze(imgToAnalyze);
  };

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const triggerAnalyzeRef = useRef<() => void>(() => {});
  triggerAnalyzeRef.current = handleTriggerAnalyze;

  // Auto-scan timer (simulates Poppo Live round cadence cleanly without setState-in-render)
  useEffect(() => {
    if (!autoScanEnabled) {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
      return;
    }

    setCountdown(autoScanIntervalSec);
    autoScanTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Schedule trigger outside of React state update / render cycle
          setTimeout(() => {
            if (!isLoadingRef.current) {
              triggerAnalyzeRef.current();
            }
          }, 0);
          return autoScanIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
    };
  }, [autoScanEnabled, autoScanIntervalSec]);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl backdrop-blur-md">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              {lang === 'bn' ? 'পোপ্পো লাইভ গেম স্ক্রিন ও লাইভ সিন' : 'Poppo Live Golden Flower Screen'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'গেমের স্ক্রিনের উপরে এআই "ছোট গোল বট" সরাসরি সিগনাল দিবে'
              : 'Floating circular bot widget sits directly over game screen'}
          </p>
        </div>

        {/* Source Mode Buttons: Live First */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          <button
            onClick={startScreenCapture}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'screen' && streamActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'bn' ? '🔴 লাইভ স্ক্রিন শেয়ার' : '🔴 Screen Share'}</span>
          </button>

          <button
            onClick={startCameraCapture}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'camera' && streamActive
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 ring-1 ring-rose-400'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'bn' ? '📷 ক্যামেরা' : '📷 Camera'}</span>
          </button>

          <button
            onClick={handlePasteClipboard}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all text-slate-300 hover:text-white bg-slate-900/60"
            title="ক্লিপবোর্ড থেকে স্ক্রিনশট পেস্ট করুন"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? '📋 পেস্ট' : '📋 Paste'}</span>
          </button>

          <button
            onClick={() => {
              stopStream();
              setActiveMode('upload');
              fileInputRef.current?.click();
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'upload'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? '📁 ফাইল' : '📁 Upload'}</span>
          </button>

          <button
            onClick={() => handleSelectDemo(selectedDemo)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'demo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'স্যাম্পল' : 'Sample'}</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        }}
      />

      {/* Direct Mobile Camera Capture */}
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        }}
      />

      {/* Preset Scenes Toolbar matching user's Poppo Live screenshots */}
      {activeMode === 'demo' && (
        <div className="mb-3 p-2 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {lang === 'bn' ? 'পোপ্পো লাইভ সিন বেছে নিন:' : 'Poppo Live Real Scenes:'}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSelectDemo('betting_phase')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                selectedDemo === 'betting_phase'
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-bold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⏱️ {lang === 'bn' ? 'সিন ১: বেটিং পর্ব (04s / Pots)' : 'Scene 1: Betting Phase'}
            </button>
            <button
              onClick={() => handleSelectDemo('reveal_phase')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                selectedDemo === 'reveal_phase'
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 font-bold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🏆 {lang === 'bn' ? 'সিন ২: ফলাফল ও জয় (B Won)' : 'Scene 2: Result & Win'}
            </button>
            <button
              onClick={() => handleSelectDemo('c_streak')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                selectedDemo === 'c_streak'
                  ? 'bg-orange-950/60 border-orange-500/80 text-orange-200 font-bold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              📈 {lang === 'bn' ? 'সিন ৩: হাউজ C ট্রেন্ড' : 'Scene 3: House C Trend'}
            </button>
          </div>
        </div>
      )}

      {/* Main Game Screen Viewport with FLOATING ROUND BOT on top */}
      <div
        className={`relative aspect-[9/16] sm:aspect-[3/4] max-h-[580px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center ${
          dragOver
            ? 'border-amber-400 bg-amber-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Stream Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${streamActive ? 'block' : 'hidden'}`}
        />

        {/* Static Image / Demo preview */}
        {!streamActive && currentImage && (
          <img
            src={currentImage}
            alt="Poppo Live Game Scene"
            className="w-full h-full object-contain select-none"
          />
        )}

        {/* Empty state prompt */}
        {!streamActive && !currentImage && (
          <div className="text-center p-6 text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-600 animate-pulse" />
            <p className="text-sm font-medium">
              {lang === 'bn'
                ? 'এখানে স্ক্রিনশট পেস্ট করুন (Ctrl+V) অথবা ড্রপ করুন'
                : 'Paste screenshot (Ctrl+V) or drop image here'}
            </p>
          </div>
        )}

        {/* HUD Scanner Top Tag */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {streamActive
              ? lang === 'bn' ? 'লাইভ সিন সিঙ্ক' : 'LIVE SYNC'
              : lang === 'bn' ? 'POPPO LIVE SCENE' : 'POPPO LIVE SCENE'}
          </span>
        </div>

        {/* THE FLOATING ROUND BUBBLE BOT (ছোট গোল আকারে scene উপরে) */}
        {showFloatingBot && (
          <FloatingRoundBot
            prediction={prediction}
            isLoading={isLoading}
            roundCountdown={countdown}
            lang={lang}
            onForceScan={handleTriggerAnalyze}
          />
        )}

        {/* Scanning line animation when analyzing */}
        {isLoading && (
          <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400/80 animate-bounce z-20" />
        )}
      </div>

      {/* Control Buttons & Auto-Scan Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Auto-scan round toggle */}
        <div className="flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScanEnabled}
              onChange={(e) => setAutoScanEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
            />
            <span className="text-xs font-semibold text-slate-200">
              {lang === 'bn' ? 'প্রতি রাউন্ডে অটো সিগনাল' : 'Auto Round Signal'}
            </span>
          </label>

          {autoScanEnabled && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-xs text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-bold">{countdown}s</span>
            </div>
          )}
        </div>

        {/* Toggle Floating Bot Visibility */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFloatingBot(!showFloatingBot)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFloatingBot
                ? 'bg-purple-950/50 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showFloatingBot
              ? lang === 'bn' ? '● গোল বট অন' : '● Round Bot ON'
              : lang === 'bn' ? '○ গোল বট অফ' : '○ Round Bot OFF'}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={handleTriggerAnalyze}
            disabled={isLoading}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg select-none ${
              isLoading
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:via-rose-500 hover:to-purple-500 text-white shadow-rose-950/50 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === 'bn' ? 'বিশ্লেষণ হচ্ছে...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>{lang === 'bn' ? '⚡ এখনই সিগনাল নিন' : '⚡ Get Signal Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
