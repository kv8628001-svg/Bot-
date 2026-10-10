import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiAdvisorChatProps {
  lang: 'bn' | 'en';
}

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text:
        lang === 'bn'
          ? 'স্বাগতম! আমি পোপ্পো লাইভ গোল্ডেন ফ্লাওয়ার এআই অ্যাডভাইজার। আপনি যেকোনো কৌশল, ট্রেন্ড চার্ট রিডিং, বা বাজি ধরার নিয়ম সম্পর্কে বাংলায় প্রশ্ন করতে পারেন।'
          : 'Welcome! I am your Poppo Live Golden Flower AI Advisor. Ask me anything about strategies, roadmap reading, or betting tips.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    lang === 'bn'
      ? 'ড্রাগন টানা ৩ বার জিতলে পরের রাউন্ডে কি করবো?'
      : 'What to do when Dragon wins 3 times in a row?',
    lang === 'bn'
      ? 'পেয়ার (Pair 8+) ধরার সঠিক সময় কোনটি?'
      : 'When is the best time to bet on Pair 8+?',
    lang === 'bn'
      ? 'লুদান বা ট্রেন্ড চার্ট কীভাবে পড়তে হয়?'
      : 'How to read the roadmap trend board?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          text: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text:
          lang === 'bn'
            ? 'দুঃখিত, উত্তর পেতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Sorry, failed to get a response. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl backdrop-blur-md flex flex-col h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-slate-100">
            {lang === 'bn' ? 'এআই বিশেষজ্ঞ চ্যাট (AI Advisor)' : 'AI Strategy Chat'}
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
          GEMINI 3.8
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-slate-300 transition-colors text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center flex-shrink-0 text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>{lang === 'bn' ? 'এআই উত্তর লিখছে...' : 'AI thinking...'}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800/80"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'bn'
              ? 'পোপ্পো লাইভ গেম সম্পর্কে যেকোনো প্রশ্ন লিখুন...'
              : 'Ask any question about Poppo Golden Flower...'
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
