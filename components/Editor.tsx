
import React from 'react';
import { EditorMode, Language } from '../types';
import { FileCode, Hash, Terminal, Coffee, Binary } from 'lucide-react';

interface EditorProps {
  mode: EditorMode;
  language: Language;
  value: string;
  onChange: (val: string) => void;
  onModeChange: (mode: EditorMode) => void;
}

const Editor: React.FC<EditorProps> = ({ mode, language, value, onChange, onModeChange }) => {
  const webTabs: { id: EditorMode; label: string; icon: any; color: string }[] = [
    { id: 'html', label: 'HTML', icon: FileCode, color: 'text-orange-400' },
    { id: 'css', label: 'CSS', icon: Hash, color: 'text-blue-400' },
    { id: 'javascript', label: 'JS', icon: Terminal, color: 'text-yellow-400' },
  ];

  const singleTabs: Record<string, { id: EditorMode; label: string; icon: any; color: string }> = {
    java: { id: 'java', label: 'Main.java', icon: Coffee, color: 'text-red-400' },
    python: { id: 'python', label: 'main.py', icon: Binary, color: 'text-sky-400' },
  };

  const currentTabs = language === 'web' ? webTabs : [singleTabs[language]];

  return (
    <div className="flex flex-col h-full bg-[#1e293b] border-r border-slate-700">
      <div className="flex bg-[#0f172a] border-b border-slate-700 overflow-x-auto no-scrollbar">
        {currentTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 shrink-0 ${
              mode === tab.id
                ? 'bg-[#1e293b] text-white border-sky-500'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon size={16} className={tab.color} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative flex-grow group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-6 bg-transparent text-slate-300 code-font text-sm leading-relaxed outline-none resize-none focus:ring-0 placeholder-slate-600"
          placeholder={`Write your ${language.toUpperCase()} code here...`}
        />
      </div>
    </div>
  );
};

export default Editor;
