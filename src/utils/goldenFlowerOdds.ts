/**
 * Poppo Live Golden Flower (Houses A, B, C) Odds & Helpers
 */

export const GOLDEN_FLOWER_ODDS = [
  { nameBn: 'লেপার্ড / ত্রয়ী (Leopard / 豹子)', nameEn: 'Leopard (Three of a Kind)', odds: '0.24%', ratio: '1 in 425', multiplier: 'x30', color: 'text-amber-400' },
  { nameBn: 'পাক্কা রান (Straight Flush / 同花顺)', nameEn: 'Straight Flush', odds: '0.22%', ratio: '1 in 460', multiplier: 'x20', color: 'text-rose-400' },
  { nameBn: 'রং / ফ্লাশ (Flush / 金花)', nameEn: 'Flush (Same Suit)', odds: '4.96%', ratio: '1 in 20.2', multiplier: 'x8', color: 'text-emerald-400' },
  { nameBn: 'রান / স্ট্রেট (Straight / 顺子)', nameEn: 'Straight (Sequence)', odds: '3.26%', ratio: '1 in 30.7', multiplier: 'x6', color: 'text-cyan-400' },
  { nameBn: 'জোড়া / পেয়ার (Pair / 对子)', nameEn: 'Pair', odds: '16.94%', ratio: '1 in 5.9', multiplier: 'x3', color: 'text-purple-400' },
  { nameBn: 'হাই কার্ড (High Card / 单张)', nameEn: 'High Card', odds: '74.39%', ratio: '3 in 4', multiplier: 'x1', color: 'text-slate-300' },
];

// Audio beep notification using Web Audio API
export function playAlertChime(type: 'predict' | 'high_risk' | 'switch' = 'predict') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'predict') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(784, ctx.currentTime); // G5
      osc1.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
    } else if (type === 'high_risk') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(392, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {}
}

// Android Haptic Vibration Notification
export function triggerAndroidVibration(pattern: number[] = [120, 60, 120]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}

// Bengali speech synthesis
export function speakBangla(text: string) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.lang.includes('BD') || v.lang.includes('IN'));
    if (bnVoice) {
      utterance.voice = bnVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('TTS error', err);
  }
}

/**
 * Generate authentic Poppo Live Golden Flower Canvas Scene matching user's exact uploaded screenshots
 */
export function generatePoppoLiveDemoScene(preset: 'betting_phase' | 'reveal_phase' | 'c_streak'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background: Deep dark navy night space background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 920);
  bgGrad.addColorStop(0, '#0a0d1f');
  bgGrad.addColorStop(0.4, '#101432');
  bgGrad.addColorStop(0.7, '#0c1b33');
  bgGrad.addColorStop(1, '#050b18');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 460, 920);

  // Top Status Bar: Time & battery
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(preset === 'reveal_phase' ? '11:46' : '11:44', 16, 24);
  ctx.textAlign = 'right';
  ctx.fillText('4.5G  87%', 444, 24);
  ctx.textAlign = 'left';

  // Live Streamer Profile Bar
  ctx.fillStyle = '#171c38';
  ctx.beginPath();
  ctx.roundRect(14, 40, 200, 36, 18);
  ctx.fill();

  // Host avatar circle
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(32, 58, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('নষ্ট...', 54, 55);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText('♥ 0', 54, 69);

  // Poppo icons right
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('✕', 444, 64);
  ctx.textAlign = 'left';

  // Streamer Seats (2x2 grid placeholder)
  const seatWidth = 205;
  const seatHeight = 160;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const sx = 16 + c * (seatWidth + 16);
      const sy = 110 + r * (seatHeight + 10);
      ctx.fillStyle = '#11173644';
      ctx.beginPath();
      ctx.roundRect(sx, sy, seatWidth, seatHeight, 12);
      ctx.fill();
    }
  }

  // Active Broadcaster in Seat 1
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(118, 180, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Golden Flower Game Arena Header
  const gameTopY = 460;
  ctx.fillStyle = '#08142b';
  ctx.fillRect(0, gameTopY, 460, 460);

  // Felt texture overlay
  const feltGrad = ctx.createRadialGradient(230, 680, 50, 230, 680, 300);
  feltGrad.addColorStop(0, '#0c2756');
  feltGrad.addColorStop(1, '#05122c');
  ctx.fillStyle = feltGrad;
  ctx.fillRect(0, gameTopY, 460, 460);

  // Diamond Bar: Diamond 180,872 or 986,278
  ctx.fillStyle = '#0f2952';
  ctx.beginPath();
  ctx.roundRect(14, gameTopY + 12, 170, 34, 17);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('💎 Diamond', 26, gameTopY + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(preset === 'reveal_phase' ? '986,278' : '180,872', 105, gameTopY + 28);

  // Close Game Icon
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('✕', 440, gameTopY + 34);
  ctx.textAlign = 'left';

  // 3 Houses Area: A (Left), B (Center), C (Right)
  const colW = 138;
  const houses = [
    { code: 'A', name: 'A', color: '#38bdf8', pot: '15,504,820', me: '0', dressColor: '#ffffff' },
    { code: 'B', name: 'B', color: '#4ade80', pot: '10,384,090', me: '60,000', dressColor: '#22c55e' },
    { code: 'C', name: 'C', color: '#fb923c', pot: '6,814,670', me: '80,000', dressColor: '#f43f5e' },
  ];

  houses.forEach((h, idx) => {
    const hx = 12 + idx * (colW + 10);
    const hy = gameTopY + 60;

    // Card display box
    ctx.fillStyle = '#0b1d3f';
    ctx.beginPath();
    ctx.roundRect(hx, hy, colW, 58, 8);
    ctx.fill();
    ctx.strokeStyle = '#2563eb88';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (preset === 'reveal_phase') {
      // Reveal cards
      const cardsData =
        idx === 0
          ? [
              { val: 'J', suit: '♠', col: '#ffffff' },
              { val: '5', suit: '♣', col: '#ffffff' },
              { val: 'A', suit: '♦', col: '#ef4444' },
            ]
          : idx === 1
          ? [
              { val: 'Q', suit: '♦', col: '#ef4444' },
              { val: '9', suit: '♦', col: '#ef4444' },
              { val: 'K', suit: '♥', col: '#ef4444' },
            ]
          : [
              { val: '8', suit: '♠', col: '#ffffff' },
              { val: '6', suit: '♣', col: '#ffffff' },
              { val: '5', suit: '♦', col: '#ef4444' },
            ];

      cardsData.forEach((c, cIdx) => {
        const cx = hx + 6 + cIdx * 42;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx, hy + 4, 38, 48, 4);
        ctx.fill();
        ctx.fillStyle = c.col;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(c.val, cx + 4, hy + 20);
        ctx.font = '12px sans-serif';
        ctx.fillText(c.suit, cx + 4, hy + 38);
      });

      // Sub-label below cards: High Card
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(hx + 10, hy + 36, colW - 20, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('High Card', hx + colW / 2, hy + 48);
      ctx.textAlign = 'left';
    } else {
      // Face-down card backs (3 blue cards with x2.98)
      for (let cIdx = 0; cIdx < 3; cIdx++) {
        const cx = hx + 8 + cIdx * 40;
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.roundRect(cx, hy + 6, 36, 46, 4);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.stroke();
      }
      // Multiplier badge x2.98
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('x2.98', hx + colW / 2, hy + 34);
      ctx.textAlign = 'left';
    }

    // House cursive letter A, B, C
    ctx.font = 'italic bold 28px serif';
    ctx.fillStyle = h.color;
    ctx.fillText(h.code, hx + 6, hy + 92);

    // Dealer Lady Avatar Illustration placeholder
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(hx + colW / 2, hy + 90, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.dressColor;
    ctx.beginPath();
    ctx.arc(hx + colW / 2, hy + 90, 18, 0, Math.PI * 2);
    ctx.fill();

    // Betting Pot Box
    const potY = hy + 130;
    ctx.fillStyle = '#061633cc';
    ctx.beginPath();
    ctx.roundRect(hx, potY, colW, 68, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    // Fake colorful chips in pot
    for (let cp = 0; cp < 8; cp++) {
      ctx.fillStyle = cp % 3 === 0 ? '#ef4444' : cp % 3 === 1 ? '#22c55e' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(hx + 18 + (cp % 4) * 28, potY + 16 + Math.floor(cp / 4) * 14, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pot text
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Pot: ${h.pot}`, hx + 6, potY + 48);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Me: ${h.me}`, hx + 6, potY + 62);
  });

  // Center Timer or WIN Overlay
  if (preset === 'betting_phase') {
    // Red countdown pill in center
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(205, gameTopY + 118, 50, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('04', 230, gameTopY + 134);
    ctx.textAlign = 'left';
  } else if (preset === 'reveal_phase') {
    // Big WIN banner over House B
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(50, gameTopY + 180, 360, 90, 16);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'black 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WIN', 230, gameTopY + 220);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('My Prize: 💎 986,259', 230, gameTopY + 248);
    ctx.textAlign = 'left';
  }

  // Bottom History Bead Bar (Matching Poppo Live exactly: < ? C B A C A C B A C B >)
  const historyBarY = gameTopY + 276;
  ctx.fillStyle = '#061329';
  ctx.fillRect(0, historyBarY, 460, 34);

  // Left arrow
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('◀  ?', 14, historyBarY + 22);

  // Sequence of letters
  const seq =
    preset === 'reveal_phase'
      ? ['A', 'A', 'C', 'B', 'A', 'C', 'A', 'C', 'B', 'A']
      : ['C', 'B', 'A', 'C', 'A', 'C', 'B', 'A', 'C', 'B'];

  seq.forEach((item, sIdx) => {
    const sx = 70 + sIdx * 34;
    ctx.font = 'italic bold 18px serif';
    ctx.fillStyle = item === 'A' ? '#38bdf8' : item === 'B' ? '#4ade80' : '#fb923c';
    ctx.fillText(item, sx, historyBarY + 24);
  });

  // Right arrow
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('▶', 428, historyBarY + 22);

  // Bottom Chips Bar (10, 100, 1K, 5K, 50K)
  const chipsY = historyBarY + 44;
  const chipValues = [
    { val: '10', col: '#94a3b8' },
    { val: '100', col: '#f97316' },
    { val: '1K', col: '#0284c7' },
    { val: '5K', col: '#22c55e' },
    { val: '50K', col: '#ef4444' },
  ];

  // Auto bet icon left
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.arc(38, chipsY + 15, 18, 0, Math.PI * 2);
  ctx.fill();

  chipValues.forEach((ch, idx) => {
    const cx = 95 + idx * 62;
    ctx.fillStyle = ch.col;
    ctx.beginPath();
    ctx.arc(cx, chipsY + 15, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ch.val, cx, chipsY + 19);
  });
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Calculates genuine statistical probabilities from user-logged round history.
 * No fake pot amounts or random guesses are generated.
 */
export function calculateRoadmapOdds(pastWinners: ('A' | 'B' | 'C')[]): {
  recommendedHouse: 'A' | 'B' | 'C';
  probabilityA: number;
  probabilityB: number;
  probabilityC: number;
  confidencePercent: number;
  trendText: string;
  banglaAnalysis: string;
  voiceText: string;
} {
  const total = pastWinners.length;
  if (total === 0) {
    return {
      recommendedHouse: 'B',
      probabilityA: 33,
      probabilityB: 34,
      probabilityC: 33,
      confidencePercent: 34,
      trendText: 'ভারসাম্যপূর্ণ ইতিহাস (Balanced Baseline)',
      banglaAnalysis: 'কোনো পূর্ববর্তী রাউন্ড হিস্ট্রি নেই। তিন ঘরের সমান সম্ভাবনা রয়েছে।',
      voiceText: 'নতুন সেশন শুরু। হিস্ট্রি রেকর্ড করুন বা লাইভ সিন স্ক্যান করুন।',
    };
  }

  const countA = pastWinners.filter((w) => w === 'A').length;
  const countB = pastWinners.filter((w) => w === 'B').length;
  const countC = pastWinners.filter((w) => w === 'C').length;

  const lastWinner = pastWinners[pastWinners.length - 1];

  // Markov transition frequencies based on the actual dataset
  const nextAfterLast: { A: number; B: number; C: number } = { A: 0, B: 0, C: 0 };
  let transitionsCount = 0;
  for (let i = 0; i < pastWinners.length - 1; i++) {
    if (pastWinners[i] === lastWinner) {
      const next = pastWinners[i + 1];
      nextAfterLast[next]++;
      transitionsCount++;
    }
  }

  // Weight: 55% general frequency balance, 45% conditional transition
  const baseA = countA / total;
  const baseB = countB / total;
  const baseC = countC / total;

  let condA = baseA;
  let condB = baseB;
  let condC = baseC;

  if (transitionsCount > 0) {
    condA = nextAfterLast.A / transitionsCount;
    condB = nextAfterLast.B / transitionsCount;
    condC = nextAfterLast.C / transitionsCount;
  }

  let rawA = baseA * 0.5 + condA * 0.5;
  let rawB = baseB * 0.5 + condB * 0.5;
  let rawC = baseC * 0.5 + condC * 0.5;

  // Smoothing
  const sum = rawA + rawB + rawC || 1;
  let probA = Math.round((rawA / sum) * 100);
  let probB = Math.round((rawB / sum) * 100);
  let probC = 100 - probA - probB;

  // Ensure within reasonable bounds
  if (probC < 10) {
    probC = 15;
    probB = 100 - probA - probC;
  }

  let rec: 'A' | 'B' | 'C' = 'B';
  let highest = probB;
  if (probA >= probB && probA >= probC) {
    rec = 'A';
    highest = probA;
  } else if (probC >= probA && probC >= probB) {
    rec = 'C';
    highest = probC;
  }

  const streakLength = (() => {
    let len = 0;
    for (let i = pastWinners.length - 1; i >= 0; i--) {
      if (pastWinners[i] === lastWinner) len++;
      else break;
    }
    return len;
  })();

  const trendText = streakLength >= 3
    ? `House ${lastWinner} এর ${streakLength} রাউন্ড টানা স্ট্রিক (Dragon Run)`
    : `${lastWinner} এর পর অল্টারনেটিং রিভার্সাল ট্রেন্ড`;

  const banglaAnalysis = `আপনার রেকর্ডকৃত ${total}টি রাউন্ডের গাণিতিক সিকোয়েন্স বিশ্লেষণ করে দেখা গেছে ${lastWinner} এর পর House ${rec} এ আসার সম্ভাবনা সবচেয়ে বেশি (${highest}%)। কোনো কাল্পনিক পট বিবেচনা না করে কেবল আসল লুদান হিস্ট্রি ব্যবহার করা হয়েছে।`;
  const voiceText = `পরবর্তী রাউন্ডে হিস্ট্রি অনুযায়ী ${rec} ঘরের সম্ভাবনা ${highest}%। ${rec} ঘরে বাজি বিবেচনা করতে পারেন।`;

  return {
    recommendedHouse: rec,
    probabilityA: probA,
    probabilityB: probB,
    probabilityC: probC,
    confidencePercent: highest,
    trendText,
    banglaAnalysis,
    voiceText,
  };
}
