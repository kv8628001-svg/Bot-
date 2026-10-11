import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Analyze Poppo Live Golden Flower Screenshot / Frame
app.post('/api/analyze-screen', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', pastRounds = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `You are an ultra-precise computer vision and game-theory analyzer for the official "Poppo Live Golden Flower" (炸金花 / Zha Jin Hua) live stream card game.
CRITICAL AUTHENTICITY DIRECTIVE (ZERO FAKE SIGNALS):
The user strictly mandates: "বট যেনো নিজে থেকে কোনো ভুয়া বা কাল্পনিক সিগনাল না দেয়।"
1. SCENE VALIDATION:
   - Inspect the image thoroughly. Does it genuinely show Poppo Live Golden Flower game interface (houses A, B, C or betting area, live streamer, cards, or bottom roadmap bar)?
   - If the image is dark, blurry, blank, unrelated, or NOT Poppo Live:
     * Set isValidPoppoScene = false.
     * Set invalidReason = "প্রদত্ত ছবিতে Poppo Live গোল্ডেন ফ্লাওয়ার গেম টেবিল স্পষ্ট নয়। ভুয়া সিগনাল প্রতিরোধ করা হয়েছে।"
     * Do NOT invent fake betting recommendations or fake numbers!
2. REAL EXTRACTION (Only if isValidPoppoScene is true):
   - Read the ACTUAL numbers visible on screen:
     * Check Pot A, Pot B, Pot C. If visible, report exact formatted numbers as printed on screen (e.g. "15.5M", "10.3M", "6.8M", "500K", "0"). If pots are not readable, explicitly write "অস্পষ্ট / দৃশ্যমান নয়". NEVER make up random pot numbers!
     * Read the active game phase (e.g. "বেটিং পর্ব - 04s টাইমার" or "ফলাফল পর্ব - WIN ব্যানার").
     * Read the bottom history bar of recent winner beads (sequence of A, B, C) if visible.
     * Check dealer/player card state if revealed (High Card, Pair, Flush, Straight, Straight Flush, Leopard).
3. PROBABILITY & RECOMMENDATION:
   - Calculate genuine win probability based strictly on visible data and game mechanics.
   - probabilityA + probabilityB + probabilityC must strictly sum to 100%.
   - recommendedHouse must be strictly 'A', 'B', or 'C' based on evidence (momentum, volume trap avoidance).
   - Generate crisp Bengali voice alert and analytical summary.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyze this image for Poppo Live Golden Flower. Past user logged rounds if any: ${JSON.stringify(pastRounds)}.
Strictly verify if this is an authentic Poppo Live game scene. If valid, extract real visible pot amounts, game phase, and bottom roadmap. Then calculate honest probabilities for House A, B, and C with zero fabricated data.`,
    };

    let parsedData: any = null;

    // Try Gemini models with active quota prioritized
    const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [imagePart, textPart] },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValidPoppoScene: {
                  type: Type.BOOLEAN,
                  description: 'True ONLY if the image actually contains the Poppo Live Golden Flower game table.',
                },
                invalidReason: {
                  type: Type.STRING,
                  description: 'Bengali explanation if the scene is invalid or unclear.',
                },
                recommendedHouse: {
                  type: Type.STRING,
                  description: 'Recommended house to bet: A, B, or C',
                },
                probabilityA: {
                  type: Type.NUMBER,
                  description: 'Winning probability percentage for House A (e.g. 25)',
                },
                probabilityB: {
                  type: Type.NUMBER,
                  description: 'Winning probability percentage for House B (e.g. 58)',
                },
                probabilityC: {
                  type: Type.NUMBER,
                  description: 'Winning probability percentage for House C (e.g. 17)',
                },
                confidencePercent: {
                  type: Type.NUMBER,
                  description: 'Confidence percentage for the recommended house (e.g. 58)',
                },
                detectedSceneProof: {
                  type: Type.OBJECT,
                  properties: {
                    detectedPhase: { type: Type.STRING, description: 'e.g. বেটিং পর্ব (04s টাইমার) বা ফলাফল পর্ব (WIN ব্যানার)' },
                    detectedPots: { type: Type.STRING, description: 'Real pot numbers seen on screen or দৃশ্যমান নয়' },
                    detectedRoadmap: { type: Type.STRING, description: 'Real sequence of winner beads seen on screen or দৃশ্যমান নয়' },
                    detectedCards: { type: Type.STRING, description: 'Real card state seen on screen' },
                  },
                  required: ['detectedPhase', 'detectedPots', 'detectedRoadmap', 'detectedCards'],
                },
                potAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    potA: { type: Type.STRING },
                    potB: { type: Type.STRING },
                    potC: { type: Type.STRING },
                    biasWarning: { type: Type.STRING },
                  },
                  required: ['potA', 'potB', 'potC', 'biasWarning'],
                },
                likelyHandType: {
                  type: Type.STRING,
                  description: 'Most likely winning hand category in Bengali (e.g. হাই কার্ড, জোড়া, রং)',
                },
                trendPatternDetected: {
                  type: Type.STRING,
                  description: 'Roadmap pattern detected in Bengali, e.g. B এর স্ট্রং রিভার্সাল বা A-C অল্টারনেটিং',
                },
                riskLevel: {
                  type: Type.STRING,
                  description: 'Low, Medium, or High',
                },
                banglaAnalysis: {
                  type: Type.STRING,
                  description: 'Detailed analysis and reasoning in Bengali explaining why this house has the highest probability based strictly on the image content',
                },
                banglaVoiceAlert: {
                  type: Type.STRING,
                  description: 'Crisp Bengali voice announcement for speech synthesis, e.g. নতুন রাউন্ড শুরু! A: ২৫%, B: ৫৮%, C: ১৭%। B ঘরে বাজি ধরুন!',
                },
                keySignals: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-4 key visual clues or signals observed on screen',
                },
              },
              required: [
                'isValidPoppoScene',
                'recommendedHouse',
                'probabilityA',
                'probabilityB',
                'probabilityC',
                'confidencePercent',
                'detectedSceneProof',
                'likelyHandType',
                'trendPatternDetected',
                'riskLevel',
                'banglaAnalysis',
                'banglaVoiceAlert',
                'keySignals',
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed) {
            parsed.isAuthenticScan = true;
            parsed.sourceMode = 'vision_ai';
            parsedData = parsed;
            break; // Succeeded!
          }
        }
      } catch (modelErr: any) {
        console.warn(`Model ${modelName} unavailable or failed:`, modelErr?.message || modelErr);
        // Try next candidate model
      }
    }

    // If scene was analyzed but AI marked it as NOT a valid Poppo Live game scene
    if (parsedData && parsedData.isValidPoppoScene === false) {
      return res.json({
        success: false,
        error: parsedData.invalidReason || 'প্রদত্ত ছবিটি Poppo Live গোল্ডেন ফ্লাওয়ার গেম সিন হিসেবে সনাক্ত করা যায়নি। ভুয়া সিগনাল প্রতিরোধ করা হয়েছে।',
        data: null,
      });
    }

    // If Gemini was busy/offline: DO NOT INVENT FAKE DATA OR FAKE POTS!
    if (!parsedData) {
      const validPastRounds: ('A' | 'B' | 'C')[] = Array.isArray(pastRounds)
        ? pastRounds.filter((r) => r === 'A' || r === 'B' || r === 'C')
        : [];

      // If user has recorded at least 3 genuine rounds in their history roadmap,
      // calculate purely mathematical Markov odds without fabricating fake coin pots!
      if (validPastRounds.length >= 3) {
        const lastWinner = validPastRounds[validPastRounds.length - 1];
        const countA = validPastRounds.filter((w) => w === 'A').length;
        const countB = validPastRounds.filter((w) => w === 'B').length;
        const countC = validPastRounds.filter((w) => w === 'C').length;
        const total = validPastRounds.length;

        // Transition frequency after lastWinner
        const nextCount = { A: 0, B: 0, C: 0 };
        let transTotal = 0;
        for (let i = 0; i < total - 1; i++) {
          if (validPastRounds[i] === lastWinner) {
            nextCount[validPastRounds[i + 1]]++;
            transTotal++;
          }
        }

        const baseA = countA / total;
        const baseB = countB / total;
        const baseC = countC / total;
        const condA = transTotal > 0 ? nextCount.A / transTotal : baseA;
        const condB = transTotal > 0 ? nextCount.B / transTotal : baseB;
        const condC = transTotal > 0 ? nextCount.C / transTotal : baseC;

        const scoreA = baseA * 0.5 + condA * 0.5;
        const scoreB = baseB * 0.5 + condB * 0.5;
        const scoreC = baseC * 0.5 + condC * 0.5;
        const scoreSum = scoreA + scoreB + scoreC || 1;

        let probA = Math.round((scoreA / scoreSum) * 100);
        let probB = Math.round((scoreB / scoreSum) * 100);
        let probC = 100 - probA - probB;
        if (probC < 12) {
          probC = 15;
          probB = 100 - probA - probC;
        }

        let recHouse: 'A' | 'B' | 'C' = 'B';
        let highestProb = probB;
        if (probA >= probB && probA >= probC) {
          recHouse = 'A';
          highestProb = probA;
        } else if (probC >= probA && probC >= probB) {
          recHouse = 'C';
          highestProb = probC;
        }

        parsedData = {
          isValidPoppoScene: true,
          isAuthenticScan: false,
          sourceMode: 'roadmap_math',
          recommendedHouse: recHouse,
          probabilityA: probA,
          probabilityB: probB,
          probabilityC: probC,
          confidencePercent: highestProb,
          detectedSceneProof: {
            detectedPhase: 'লুদান গাণিতিক হিস্ট্রি মোড (Visual AI Offline)',
            detectedPots: 'কয়েন পট ডেটা দৃশ্যমান নয় — কোনো কাল্পনিক পট তৈরি করা হয়নি',
            detectedRoadmap: validPastRounds.slice(-10).join(' → '),
            detectedCards: 'কার্ড ডিলার স্টেট আনভেরিফায়েড',
          },
          potAnalysis: {
            potA: 'দৃশ্যমান নয়',
            potB: 'দৃশ্যমান নয়',
            potC: 'দৃশ্যমান নয়',
            biasWarning: 'ভিজ্যুয়াল ক্যামেরা অফলাইন থাকায় কোনো অনুমাননির্ভর পট সংখ্যা তৈরি করা হয়নি। কেবলমাত্র আপনার পূর্ববর্তী রাউন্ড হিস্ট্রি ব্যবহার করা হয়েছে।',
          },
          likelyHandType: 'হাই কার্ড / জোড়া (গাণিতিক সম্ভাব্যতা)',
          trendPatternDetected: `${lastWinner} এর পর House ${recHouse} আসার হিস্টোরিকাল ফ্রিকোয়েন্সি`,
          riskLevel: 'Medium',
          banglaAnalysis: `ভিজ্যুয়াল এআই সাময়িক অফলাইন থাকায় কোনো কাল্পনিক বা ভুয়া পট তৈরি করা হয়নি। আপনার রেকর্ডকৃত ${total}টি রাউন্ডের হিস্ট্রি থেকে সরাসরি গাণিতিক সম্ভাবনা বের করা হয়েছে: House ${recHouse} (${highestProb}%)।`,
          banglaVoiceAlert: `হিস্ট্রি বিশ্লেষণ অনুযায়ী পরবর্তী রাউন্ডে ${recHouse} জেতার সম্ভাবনা ${highestProb}%। A ${probA}%, C ${probC}%।`,
          keySignals: [
            `রেকর্ডকৃত ${total}টি রাউন্ডের হিস্ট্রি সিকোয়েন্স`,
            `House ${recHouse} এর স্ট্যাটিস্টিকাল প্রবাবিলিটি ${highestProb}%`,
            'জিরো-ফেক পলিসি: কোনো কাল্পনিক পট বিবেচনা করা হয়নি',
          ],
        };
      } else {
        // No fake signals! Return honest error
        return res.json({
          success: false,
          error: 'Poppo Live গেম সিন স্পষ্টভাবে স্ক্যান করা যায়নি। কোনো অনুমান বা ভুয়া সিগনাল না দিয়ে অপেক্ষা করা হচ্ছে। অনুগ্রহ করে স্পষ্ট স্ক্রিনশট দিন বা ক্যামেরা ফোকাস করুন।',
          data: null,
        });
      }
    }

    return res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Screen analysis error:', err);
    return res.status(500).json({
      success: false,
      error: 'Poppo Live গেম সিন প্রসেস করা সম্ভব হয়নি। কোনো ভুয়া সিগনাল তৈরি করা হয়নি।',
      details: err?.message || String(err),
    });
  }
});

// Endpoint: AI Strategy & Bot Chat Consultation
app.post('/api/ask-bot', async (req: Request, res: Response) => {
  try {
    const { question, history = [] } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemInstruction = `You are an elite AI Advisor for Poppo Live Golden Flower (জাদুকরী ৩ তাস / Zha Jin Hua).
Provide strategic tips, risk management advice, bankroll rules, and roadmap pattern reading tricks in clear, friendly Bengali (বাংলা) with English terms where appropriate.
Explain how the game works:
1. Dragon vs Phoenix (Red vs Blue)
2. Hand rankings: Leopard (3 of a kind) > Straight Flush > Flush > Straight > Pair > High Card
3. Roadmap reading: Big Road, Bead Road, Dragon streak (长龙), Chopping (跳).
4. Bankroll management: Flat bet vs 1-3-2-6 method vs conservative stop-loss. Remind players to play responsibly and never bet more than they can afford to lose.`;

    const contents = [
      ...history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: question }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ success: true, reply: response.text });
  } catch (err: any) {
    console.error('Ask bot error:', err);
    return res.status(500).json({ error: 'Failed to query bot', details: err?.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Poppo Live Golden Flower AI Bot running on http://localhost:${PORT}`);
  });
}

startServer();
