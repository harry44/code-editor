
import React, { useState } from 'react';
import { Sparkles, Loader2, Send, Wand2, X } from 'lucide-react';
import { generateCodeWithGemini } from '../services/gemini';
import { CodeState, AIResponse, Language } from '../types';

interface AIWidgetProps {
  onApply: (res: AIResponse) => void;
  onClose: () => void;
  currentState: CodeState;
  language: Language;
}

const AIWidget: React.FC<AIWidgetProps> = ({ onApply, onClose, currentState, language }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Fixed: generateCodeWithGemini now correctly receives the language parameter.
      const res = await generateCodeWithGemini(prompt, currentState, language);
      setLastResponse(res);
      setPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-l border-slate-700 w-80 shadow-2xl overflow-hidden relative">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-sky-400" />
          <h2 className="font-semibold text-slate-200">Gemini AI</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto no-scrollbar space-y-4">
        {!lastResponse && !loading && (
          <div className="text-center py-12 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-800 text-sky-400 shadow-inner">
              <Wand2 size={24} />
            </div>
            <p className="text-sm text-slate-400 px-4">
              Ask Gemini to refactor your code or add new features.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
            <Loader2 className="animate-spin text-sky-400" size={32} />
            <span className="text-xs">Forging code...</span>
          </div>
        )}

        {lastResponse && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xs font-bold uppercase text-sky-400 mb-2">Suggestion</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {lastResponse.explanation || "Here is a code improvement for your project."}
            </p>
            <button
              onClick={() => {
                onApply(lastResponse);
                setLastResponse(null);
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-sky-900/20"
            >
              Apply Changes
            </button>
            <button
              onClick={() => setLastResponse(null)}
              className="w-full mt-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a request..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="absolute right-2 bottom-2.5 p-1.5 bg-sky-600 rounded-md text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-sky-500 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIWidget;
