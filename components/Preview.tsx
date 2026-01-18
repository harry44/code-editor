
import React, { useMemo, useEffect } from 'react';
import { CodeState, ConsoleLog } from '../types';

interface PreviewProps {
  code: CodeState;
  onLog: (log: ConsoleLog) => void;
  runKey: number; // Used to force reload
}

const Preview: React.FC<PreviewProps> = ({ code, onLog, runKey }) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONSOLE_LOG') {
        onLog({
          type: event.data.level,
          content: event.data.content,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLog]);

  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #1e293b; 
              background: #ffffff; 
            }
            ${code.css}
          </style>
          <script>
            // Hijack console
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn
            };

            const sendToParent = (level, args) => {
              window.parent.postMessage({
                type: 'CONSOLE_LOG',
                level: level,
                content: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')
              }, '*');
            };

            console.log = (...args) => {
              originalConsole.log(...args);
              sendToParent('log', args);
            };
            console.error = (...args) => {
              originalConsole.error(...args);
              sendToParent('error', args);
            };
            console.warn = (...args) => {
              originalConsole.warn(...args);
              sendToParent('warn', args);
            };

            window.onerror = (msg) => {
              console.error(msg);
              return false;
            };
          </script>
        </head>
        <body>
          ${code.html}
          <script>
            try {
              ${code.javascript}
            } catch (err) {
              console.error(err.message);
            }
          </script>
        </body>
      </html>
    `;
  }, [code.html, code.css, code.javascript, runKey]);

  return (
    <div className="h-full relative bg-white">
      <iframe
        key={runKey}
        srcDoc={srcDoc}
        title="Code Runner Output"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals"
      />
    </div>
  );
};

export default Preview;
