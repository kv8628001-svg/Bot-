import React from 'react';
import { BookOpen, ShieldAlert, Zap, TrendingUp, DollarSign, Award } from 'lucide-react';
import { GOLDEN_FLOWER_ODDS } from '../utils/goldenFlowerOdds';

interface StrategyGuideProps {
  lang: 'bn' | 'en';
}

export const StrategyGuide: React.FC<StrategyGuideProps> = ({ lang }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-bold text-slate-100">
          {lang === 'bn'
            ? 'গোল্ডেন ফ্লাওয়ার গাণিতিক সম্ভাবনা ও সেরা কৌশল'
            : 'Golden Flower Odds & Tactical Guide'}
        </h3>
      </div>

      {/* Probability Table */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          {lang === 'bn' ? 'তাসের ৩-কার্ডের গাণিতিক সম্ভাব্যতা (Hand Probabilities):' : 'Theoretical 3-Card Odds:'}
        </h4>
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'হাতের ধরন' : 'Hand Rank'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'সম্ভাবনা' : 'Probability'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'অনুপাত' : 'Frequency'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'পে-আউট' : 'Multiplier'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {GOLDEN_FLOWER_ODDS.map((odd, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className={`py-2 px-3 font-semibold ${odd.color}`}>
                    {lang === 'bn' ? odd.nameBn : odd.nameEn}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-200">{odd.odds}</td>
                  <td className="py-2 px-3 text-slate-400">{odd.ratio}</td>
                  <td className="py-2 px-3 font-bold text-amber-400">{odd.multiplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tactical Tips Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5 text-blue-400 font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>{lang === 'bn' ? '১. লং ড্রাগন ট্রেন্ড অনুসরণ (Follow the Streak)' : '1. Follow Long Streaks'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'পোপ্পো লাইভে যখন কোনো ঘর (ড্রাগন বা ফিনিক্স) পরপর ৩ বার জিতে, তখন তাকে জোরপূর্বক ব্রেক করার চেষ্টা না করে ট্রেন্ডের সাথে চলা বেশি কার্যকর। তবে ৫ বার পার হলে বাজি ছোট করুন।'
              : 'When Dragon or Phoenix wins 3+ times in a row (Long Dragon), ride the momentum rather than fighting it. Scale down size after 5 streaks.'}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5 text-rose-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>{lang === 'bn' ? '২. অতিরিক্ত চিপের ট্র্যাপ (Chip Volume Trap)' : '2. Heavy Volume Trap'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'যদি দেখা যায় কোনো রাউন্ডে ড্রাগনে ৮০% কয়েন বাজি পড়েছে এবং ফিনিক্সে মাত্র ২০%, অনেক সময় অ্যালগরিদম কম বাজির ঘরকে জিতিয়ে দেয়। অতিরিক্ত একতরফা বাজি থাকলে সতর্ক থাকুন।'
              : 'If 80% of player coins pile onto Dragon, live systems often award the win to the lighter Phoenix side. Avoid heavily biased volume traps.'}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5 text-purple-400 font-bold text-xs">
            <Award className="w-4 h-4" />
            <span>{lang === 'bn' ? '৩. পেয়ার সাইড-বেট কৌশল (Pair 8+ Opportunity)' : '3. Pair Side-Bet Timing'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'গাণিতিকভাবে প্রতি ৫.৯ রাউন্ডে গড়ে ১ বার জোড়া (Pair) কার্ড আসে। যদি পরপর ৬-৭ রাউন্ড কোনো পেয়ার না আসে, তবে পরবর্তী ২ রাউন্ডে পেয়ার ঘরে ছোট বাজি ধরা লাভজনক হতে পারে।'
              : 'Statistically pairs occur 1 in every 5.9 hands. If 6+ rounds pass without any pair, catching a Pair 8+ side bet becomes statistically favorable.'}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-xs">
            <DollarSign className="w-4 h-4" />
            <span>{lang === 'bn' ? '৪. মূলধন ও স্টপ-লস নিয়ম (Bankroll & Stop Loss)' : '4. Bankroll Management'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'কখনোই আপনার মোট কয়েনের ৫% এর বেশি এক রাউন্ডে বাজি ধরবেন না। টানা ৩ রাউন্ড লস হলে কিছুক্ষণ বিরতি নিন (কুল-ডাউন)। কোনো প্রেডিকশনই ১০০% নিশ্চয়তা দেয় না।'
              : 'Never bet more than 5% of total bankroll in a single round. Take a cool-down after 3 consecutive losses. Probability guides decisions, not guarantees.'}
          </p>
        </div>
      </div>

      {/* Responsible Gaming Notice */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p>
          {lang === 'bn'
            ? 'সতর্কতা: এই এআই বটটি কম্পিউটার ভিশন ও গেম থিওরির গাণিতিক সম্ভাবনার ভিত্তিতে বিশ্লেষণ প্রদান করে। এটি বিনোদন ও বিশ্লেষণের উদ্দেশ্যে তৈরি। সর্বদা দায়িত্বশীলভাবে খেলুন।'
            : 'Disclaimer: This AI tool provides predictions based on visual analysis and mathematical probabilities for entertainment/analytical purposes. Always play responsibly.'}
        </p>
      </div>
    </div>
  );
};
