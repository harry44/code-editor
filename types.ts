
export type Language = 'web' | 'java' | 'python';
export type EditorMode = 'html' | 'css' | 'javascript' | 'java' | 'python';

export interface CodeState {
  html: string;
  css: string;
  javascript: string;
  java: string;
  python: string;
}

export interface AIResponse {
  html?: string;
  css?: string;
  js?: string;
  java?: string;
  python?: string;
  explanation?: string;
}

export interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'system';
  content: string;
  timestamp: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
