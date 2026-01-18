
import React, { useState, useCallback } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import AIWidget from './components/AIWidget';
import { EditorMode, CodeState, AIResponse, ConsoleLog, Language } from './types';
import { simulateExecution } from './services/gemini';
import { 
  Layout, 
  Play, 
  Trash2, 
  Github, 
  Terminal as TerminalIcon, 
  XCircle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Coffee,
  Binary,
  Globe,
  Loader2
} from 'lucide-react';

const INITIAL_STATE: CodeState = {
  html: '<div class="container">\n  <h1>Web Project</h1>\n  <p id="status">Ready to build</p>\n</div>',
  css: '.container {\n  text-align: center;\n  padding: 2rem;\n  font-family: sans-serif;\n}',
  javascript: 'console.log("Web loaded");',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Virtual JVM!");\n        for(int i=0; i<5; i++) {\n            System.out.println("Counting: " + i);\n        }\n    }\n}',
  python: 'print("Hello from Virtual Python!")\n\nimport math\nprint(f"PI is approximately {math.pi}")\n\ndef greet(name):\n    return f"Welcome, {name}!"\n\nprint(greet("Developer"))'
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('web');
  const [code, setCode] = useState<CodeState>(INITIAL_STATE);
  const [mode, setMode] = useState<EditorMode>('html');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [showAi, setShowAi] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLog = useCallback((log: ConsoleLog) => {
    setLogs(prev => [...prev.slice(-49), log]);
  }, []);

  const clearLogs = () => setLogs([]);
  
  const handleRun = async () => {
    clearLogs();
    if (lang === 'web') {
      setRunKey(prev => prev + 1);
    } else {
      setIsExecuting(true);
      handleLog({ 
        type: 'system', 
        content: `Initializing virtual ${lang} environment...`, 
        timestamp: new Date().toLocaleTimeString() 
      });
      
      const result = await simulateExecution(code[lang], lang);
      
      if (result.stdout) {
        handleLog({ type: 'log', content: result.stdout, timestamp: new Date().toLocaleTimeString() });
      }
      if (result.stderr) {
        handleLog({ type: 'error', content: result.stderr, timestamp: new Date().toLocaleTimeString() });
      }
      
      handleLog({ 
        type: 'system', 
        content: `Program exited with code ${result.exitCode}`, 
        timestamp: new Date().toLocaleTimeString() 
      });
      setIsExecuting(false);
      setIsConsoleOpen(true);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setMode(newLang === 'web' ? 'html' : newLang as EditorMode);
    clearLogs();
  };

  const handleReset = () => {
    if (confirm("Reset current language code?")) {
      setCode(prev => ({ ...prev, [lang]: INITIAL_STATE[lang] }));
      if (lang === 'web') {
        setCode(prev => ({ 
          ...prev, 
          html: INITIAL_STATE.html, 
          css: INITIAL_STATE.css, 
          javascript: INITIAL_STATE.javascript 
        }));
      }
    }
  };

  const updateCode = useCallback((val: string) => {
    setCode(prev => ({ ...prev, [mode]: val }));
  }, [mode]);

  const handleApplyAI = useCallback((res: AIResponse) => {
    setCode(prev => ({
      ...prev,
      html: res.html || prev.html,
      css: res.css || prev.css,
      javascript: res.js || prev.javascript,
      java: res.java || prev.java,
      python: res.python || prev.python
    }));
    handleRun();
  }, [lang]);

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      <header className="h-14 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <Layout className="text-sky-500" size={20} />
            <span className="font-bold text-lg tracking-tight hidden sm:inline">CodeForge</span>
          </div>
          
          {/* Language Selector */}
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            {[
              { id: 'web', icon: Globe, label: 'Web' },
              { id: 'java', icon: Coffee, label: 'Java' },
              { id: 'python', icon: Binary, label: 'Python' }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => handleLanguageChange(l.id as Language)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === l.id ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <l.icon size={14} />
                {l.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
          >
            {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Run
          </button>
        </div>

        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowAi(!showAi)}
            className={`p-2 rounded-md transition-all ${showAi ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Sparkles size={18} />
          </button>
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 size={18} />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-1"></div>
          <a href="https://github.com" target="_blank" className="p-2 text-slate-400 hover:text-white transition-colors">
            <Github size={18} />
          </a>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden relative">
        <div className={`${showAi ? 'w-5/12' : 'w-1/2'} flex flex-col border-r border-slate-800 transition-all duration-300`}>
          <Editor 
            mode={mode} 
            language={lang}
            value={code[mode]} 
            onChange={updateCode} 
            onModeChange={setMode} 
          />
        </div>

        <div className="flex-grow flex relative overflow-hidden bg-[#0f172a]">
          <div className="flex-grow flex flex-col min-w-0">
            <div className="flex-grow overflow-hidden bg-white relative">
              {lang === 'web' ? (
                <Preview code={code} onLog={handleLog} runKey={runKey} />
              ) : (
                <div className="h-full w-full bg-[#0a0a0a] flex flex-col p-8 font-mono overflow-auto">
                   <div className="flex items-center gap-2 text-slate-500 mb-6 text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
                     <TerminalIcon size={14} />
                     Virtual {lang} Environment v1.0.4
                   </div>
                   {!isExecuting && logs.length === 0 && (
                     <div className="text-slate-600 animate-pulse">
                       System ready. Click "Run" to execute program...
                     </div>
                   )}
                   {isExecuting && (
                     <div className="flex items-center gap-3 text-sky-400">
                       <Loader2 size={18} className="animate-spin" />
                       Running...
                     </div>
                   )}
                   <div className="space-y-2">
                     {logs.filter(l => l.type !== 'system' || isConsoleOpen).map((log, i) => (
                       <div key={i} className={`whitespace-pre-wrap ${
                         log.type === 'error' ? 'text-red-400' : 
                         log.type === 'system' ? 'text-slate-500 italic' : 
                         'text-emerald-400'
                       }`}>
                         {log.type === 'system' ? `[sys] ${log.content}` : log.content}
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Consolidate Web Console */}
            {lang === 'web' && (
              <div className={`transition-all duration-300 border-t border-slate-800 bg-[#0f172a] flex flex-col ${isConsoleOpen ? 'h-48' : 'h-9'}`}>
                <div className="h-9 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50" onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <TerminalIcon size={12} /> Console
                  </div>
                  {isConsoleOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
                {isConsoleOpen && (
                  <div className="flex-grow overflow-y-auto p-2 font-mono text-[11px] space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className={log.type === 'error' ? 'text-red-400' : 'text-slate-400'}>
                        <span className="opacity-40 mr-2">{log.timestamp}</span> {log.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={`transition-all duration-300 shrink-0 ${showAi ? 'w-80 border-l border-slate-700' : 'w-0 overflow-hidden'}`}>
            {/* Fixed: Pass the current language to AIWidget */}
            <AIWidget onApply={handleApplyAI} onClose={() => setShowAi(false)} currentState={code} language={lang} />
          </div>
        </div>
      </main>

      <footer className="h-6 bg-[#0f172a] border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex items-center gap-4 uppercase font-bold tracking-tighter">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> {lang.toUpperCase()} RUNTIME</span>
        </div>
        <div>Gemini AI Engine Powered</div>
      </footer>
    </div>
  );
};

export default App;
