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
  ShieldCheck,
  Smartphone,
  PictureInPicture2,
  X,
  ExternalLink,
  CheckCircle2,
  Layers,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { generatePoppoLiveDemoScene } from '../utils/goldenFlowerOdds';
import { FloatingRoundBot } from './FloatingRoundBot';
import { PredictionData, ScanErrorState } from '../types';

interface VisionScannerProps {
  onAnalyze: (base64Image: string) => Promise<void>;
  isLoading: boolean;
  prediction: PredictionData | null;
  scanError?: ScanErrorState | null;
  onResetSignal?: () => void;
  lang: 'bn' | 'en';
}

export const VisionScanner: React.FC<VisionScannerProps> = ({
  onAnalyze,
  isLoading,
  prediction,
  scanError,
  onResetSignal,
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
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [isPiPActive, setIsPiPActive] = useState<boolean>(false);

  const [permissionCheckState, setPermissionCheckState] = useState<{
    camera: 'idle' | 'checking' | 'granted' | 'denied';
    screen: 'idle' | 'supported' | 'unsupported';
    pip: 'idle' | 'supported' | 'unsupported';
  }>({
    camera: 'idle',
    screen: 'idle',
    pip: 'idle',
  });

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeMessage) return;
    const timer = setTimeout(() => {
      setNoticeMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [noticeMessage]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const autoScanTimerRef = useRef<any>(null);

  // Load initial demo scene (exact betting phase from user screenshot)
  useEffect(() => {
    const demo = generatePoppoLiveDemoScene('betting_phase');
    setCurrentImage(demo);
  }, []);

  // Listen for Picture-in-Picture state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPiP = () => setIsPiPActive(true);
    const onLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
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

  // Start Screen Capture (for phone mirror / desktop emulator / Android MediaProjection)
  const startScreenCapture = async () => {
    try {
      stopStream();

      if (!navigator?.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
        setNoticeMessage(
          lang === 'bn'
            ? 'আপনার বর্তমান ব্রাউজার বা ডিভাইসে সরাসরি ডিসপ্লে শেয়ার অপশনটি সক্রিয় নেই। অনুগ্রহ করে "📷 ক্যামেরা" দিয়ে লাইভ ধরুন অথবা "📁 স্ক্রিনশট" বা "📋 পেস্ট" ব্যবহার করুন।'
            : 'Screen capture is not supported on this mobile device/browser. Please use Camera or Screenshot Upload.'
        );
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

  // Start Camera Feed with mobile rear-camera preference
  const startCameraCapture = async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamActive(true);
      setActiveMode('camera');
      setPermissionCheckState((prev) => ({ ...prev, camera: 'granted' }));
    } catch (err) {
      console.warn('Camera stream unavailable, opening camera snapshot picker:', err);
      setPermissionCheckState((prev) => ({ ...prev, camera: 'denied' }));
      mobileCameraInputRef.current?.click();
    }
  };

  // Picture-in-Picture (PiP) toggle - allows the video and bot to float directly over Poppo Live
  const togglePictureInPicture = async () => {
    try {
      if (typeof document !== 'undefined' && document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {});
        setIsPiPActive(false);
        return;
      }

      const isPiPSupported =
        typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document &&
        Boolean(document.pictureInPictureEnabled) &&
        videoRef.current !== null &&
        typeof videoRef.current.requestPictureInPicture === 'function';

      if (!isPiPSupported) {
        // Fallback directly to the interactive on-screen Floating Round Bot without crashing
        setShowFloatingBot(true);
        setNoticeMessage(
          lang === 'bn'
            ? 'পিকচার-ইন-পিকচার এই পরিবেশে সরাসরি সাপোর্ট করে না — অন-স্ক্রিন ভাসমান গোল বাবল বট সক্রিয় করা হয়েছে!'
            : 'Picture-in-Picture is not supported in this frame. Floating Round Bubble Bot activated on screen!'
        );
        return;
      }

      if (!streamActive || !videoRef.current) {
        setShowFloatingBot(true);
        setNoticeMessage(
          lang === 'bn'
            ? 'পিকচার-ইন-পিকচার চালু করতে প্রথমে 📷 ক্যামেরা বা 🔴 স্ক্রিন শেয়ার চালু করুন। অন-স্ক্রিন বাবল বট সক্রিয় আছে।'
            : 'Please start Camera or Screen Share first for video PiP. Floating bot is active on screen.'
        );
        return;
      }

      try {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      } catch (pipErr) {
        console.warn('PiP request rejected:', pipErr);
        setShowFloatingBot(true);
        setIsPiPActive(false);
        setNoticeMessage(
          lang === 'bn'
            ? 'পিকচার-ইন-পিকচার অনুমোদন পায়নি। অন-স্ক্রিন ভাসমান বাবল বট চালু রাখা হয়েছে।'
            : 'Picture-in-Picture was unavailable or denied. Floating bot is active on screen.'
        );
      }
    } catch (err) {
      console.warn('PiP error handled:', err);
      setShowFloatingBot(true);
      setIsPiPActive(false);
      setNoticeMessage(
        lang === 'bn'
          ? 'পিকচার-ইন-পিকচার সক্রিয় করা যায়নি। অন-স্ক্রিন ভাসমান গোল বাবল বট চালু আছে।'
          : 'Could not activate PiP. On-screen floating bubble bot is active.'
      );
    }
  };

  // Test and Request mobile permissions inside modal
  const handleTestMobilePermissions = async () => {
    setPermissionCheckState((prev) => ({ ...prev, camera: 'checking' }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionCheckState((prev) => ({ ...prev, camera: 'granted' }));
    } catch {
      setPermissionCheckState((prev) => ({ ...prev, camera: 'denied' }));
    }

    const screenSupported = typeof navigator?.mediaDevices?.getDisplayMedia === 'function';
    setPermissionCheckState((prev) => ({
      ...prev,
      screen: screenSupported ? 'supported' : 'unsupported',
    }));

    const pipSupported = 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;
    setPermissionCheckState((prev) => ({
      ...prev,
      pip: pipSupported ? 'supported' : 'unsupported',
    }));
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
      fileInputRef.current?.click();
    } catch {
      fileInputRef.current?.click();
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
      setNoticeMessage(lang === 'bn' ? 'অনুগ্রহ করে প্রথমে একটি স্ক্রিন বা ছবি নির্বাচন করুন।' : 'Please select a screen or image first.');
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
              ? 'Poppo Live মোবাইল অ্যাপসের পারমিশন নিয়ে গেম সিন সরাসরি স্ক্যান ও বাবল প্রেডিকশন'
              : 'Direct mobile app permissions to capture & scan Poppo Live scene with floating AI HUD'}
          </p>
        </div>

        {/* Source Mode Buttons: Live First */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          {/* Mobile Permissions Modal Trigger */}
          <button
            onClick={() => setShowPermissionModal(true)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-600 animate-pulse"
            title="মোবাইল পারমিশন ও Poppo Live সরাসরি স্ক্যান গাইড"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span>{lang === 'bn' ? '📱 মোবাইল পারমিশন' : '📱 App Permissions'}</span>
          </button>

          <button
            onClick={startScreenCapture}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'screen' && streamActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'bn' ? '🔴 স্ক্রিন শেয়ার' : '🔴 Screen Share'}</span>
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

          {/* Picture-in-Picture Toggle */}
          <button
            onClick={togglePictureInPicture}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              isPiPActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-300'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
            title="পিকচার-ইন-পিকচার: Poppo Live অ্যাপসের উপর ভাসমান উইন্ডো"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? '🪟 ভাসমান PiP' : '🪟 Floating PiP'}</span>
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
      {/* In-app Notice Banner */}
      {noticeMessage && (
        <div className="mb-3 px-3 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2 transition-all shadow-md backdrop-blur-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-amber-400/80 hover:text-amber-200 p-0.5 rounded text-xs transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

        {/* Floating PiP Indicator Badge */}
        {isPiPActive && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-900/90 border border-indigo-400/60 text-[11px] text-indigo-200 shadow-md">
            <PictureInPicture2 className="w-3 h-3 text-indigo-300" />
            <span>{lang === 'bn' ? 'ভাসমান PiP মোড চালু' : 'Floating PiP Active'}</span>
          </div>
        )}

        {/* THE FLOATING ROUND BUBBLE BOT (ছোট গোল আকারে scene উপরে) */}
        {showFloatingBot && (
          <FloatingRoundBot
            prediction={prediction}
            isLoading={isLoading}
            roundCountdown={countdown}
            lang={lang}
            onForceScan={handleTriggerAnalyze}
            onResetSignal={onResetSignal}
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
          {onResetSignal && (
            <button
              onClick={onResetSignal}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1"
              title="বর্তমান সিগনাল ক্লিয়ার করুন"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>{lang === 'bn' ? 'ক্লিয়ার' : 'Clear'}</span>
            </button>
          )}

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
            id="primary-scan-trigger-btn"
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

      {/* POPPO LIVE MOBILE PERMISSION & SCENE SCANNER MODAL */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-950 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowPermissionModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                  {lang === 'bn'
                    ? 'মোবাইল পারমিশন ও Poppo Live সরাসরি স্ক্যানার'
                    : 'Mobile App Permissions & Poppo Live Scene Scanner'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'Poppo Live অ্যাপস স্ক্রিন সরাসরি দেখতে যা যা অনুমতি প্রয়োজন'
                    : 'Permissions required to capture Poppo Live screen in real-time'}
                </p>
              </div>
            </div>

            {/* Permission Checklist Cards */}
            <div className="space-y-3 mb-5">
              {/* 1. Overlay / Display over other apps */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'bn' ? '১. অন্যান্য অ্যাপের উপরে প্রদর্শন (Overlay)' : '1. Display Over Other Apps'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      SYSTEM_ALERT_WINDOW
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'Poppo Live অ্যাপ চলাকালীন বটের ছোট গোল বাবল স্ক্রিনের কোণায় ভেসে থাকবে যাতে আপনি এক ক্লিকেই সিগনাল দেখতে পান।'
                      : 'Allows the round bot widget to float over Poppo Live app during gameplay.'}
                  </p>
                </div>
              </div>

              {/* 2. Media Projection & Screen Capture */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 mt-0.5">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'bn' ? '২. সরাসরি স্ক্রিন ক্যাপচার ও রেকর্ড' : '2. Direct Screen Capture (MediaProjection)'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      MEDIA_PROJECTION
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'মোবাইলের "Start recording or casting with Poppo Live Bot" ডায়লগে "Start Now" দিলে সরাসরি Poppo Live এর টেবিল সিন স্ক্যান হয়।'
                      : 'Captures the active Poppo Live Golden Flower round for instant OCR & AI analysis.'}
                  </p>
                </div>
              </div>

              {/* 3. Picture-in-Picture (PiP) */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 mt-0.5">
                  <PictureInPicture2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'bn' ? '৩. পিকচার-ইন-পিকচার (PiP ভাসমান উইন্ডো)' : '3. Picture-in-Picture (PiP Mode)'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      PiP ENABLED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'PiP চালু করলে বটের লাইভ মনিটর ছোট হয়ে ফোনের স্ক্রিনের উপরে ভেসে থাকে, আপনি নিচে Poppo Live এ কয়েন ধরবেন।'
                      : 'Floats the live bot view over the Poppo Live app window so you can bet without switching apps.'}
                  </p>
                </div>
              </div>

              {/* 4. Camera Permission */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'bn' ? '৪. ক্যামেরা দিয়ে অন্য ডিভাইস স্ক্যান' : '4. Camera Permission'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      CAMERA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'আপনি যদি অন্য একটি ফোনে Poppo Live খেলেন, এই ফোনটির ক্যামেরা দিয়ে সরাসরি লাইভ টেবিল ধরলে স্বয়ংক্রিয় স্ক্যান হবে।'
                      : 'Scan another phone playing Poppo Live using direct rear camera feed.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Permissions Action Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-500/40 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-200">
                  {lang === 'bn' ? 'অনুমতি যাচাই ও টেস্ট করুন:' : 'Check & Trigger Permissions:'}
                </span>
                <button
                  onClick={handleTestMobilePermissions}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'অনুমতি টেস্ট' : 'Test Permissions'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">ক্যামেরা</span>
                  <span
                    className={`font-bold ${
                      permissionCheckState.camera === 'granted'
                        ? 'text-emerald-400'
                        : permissionCheckState.camera === 'denied'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {permissionCheckState.camera === 'granted'
                      ? '✓ সচল'
                      : permissionCheckState.camera === 'denied'
                      ? '✗ বন্ধ'
                      : 'অপেক্ষমাণ'}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">স্ক্রিন ক্যাপচার</span>
                  <span
                    className={`font-bold ${
                      permissionCheckState.screen === 'supported' ? 'text-emerald-400' : 'text-blue-400'
                    }`}
                  >
                    {permissionCheckState.screen === 'supported' ? '✓ প্রস্তুত' : 'উপলব্ধ'}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">ভাসমান PiP</span>
                  <span
                    className={`font-bold ${
                      permissionCheckState.pip === 'supported' ? 'text-emerald-400' : 'text-indigo-400'
                    }`}
                  >
                    {permissionCheckState.pip === 'supported' ? '✓ সক্ষম' : 'প্রস্তুত'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Launch Buttons for Poppo Live */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  startScreenCapture();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950 transition-all"
              >
                <Monitor className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সরাসরি স্ক্রিন ক্যাপচার' : 'Start Screen Capture'}</span>
              </button>

              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  startCameraCapture();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ক্যামেরা স্ক্যান শুরু' : 'Start Camera Scan'}</span>
              </button>
            </div>

            {/* APK Download Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                অফিসিয়াল অ্যান্ড্রয়েড APK প্যাকেজ: <strong className="text-emerald-400">সর্বশেষ সংস্করণ</strong>
              </span>
              <a
                href="https://github.com/kv8628001-svg/Bot-/releases/latest/download/PoppoLive-GoldenFlower-AI-Bot.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>APK ডাউনলোড করুন</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
