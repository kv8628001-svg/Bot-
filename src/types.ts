export type HouseWinner = 'A' | 'B' | 'C';

export interface GameRound {
  id: string;
  roundNumber: number;
  winner: HouseWinner;
  handType?: string;
  timestamp: number;
  potA?: number;
  potB?: number;
  potC?: number;
}

export interface PredictionData {
  recommendedHouse: HouseWinner;
  probabilityA: number; // e.g. 25
  probabilityB: number; // e.g. 58
  probabilityC: number; // e.g. 17
  confidencePercent: number; // e.g. 58
  detectedSceneProof?: {
    detectedPhase: string;
    detectedPots: string;
    detectedRoadmap: string;
    detectedCards: string;
  };
  potAnalysis?: {
    potA: string;
    potB: string;
    potC: string;
    biasWarning: string;
  };
  likelyHandType: string; // e.g. 'হাই কার্ড (High Card)' বা 'জোড়া (Pair)'
  trendPatternDetected: string; // e.g. 'B এর বাউন্স ব্যাক ও C এর ড্রপ'
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  banglaAnalysis: string;
  banglaVoiceAlert: string; // e.g. 'নতুন রাউন্ড শুরু! B জেতার সম্ভাবনা ৫৮%, A ২৫%, C ১৭%। B ঘরে বাজি ধরুন!'
  keySignals: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
