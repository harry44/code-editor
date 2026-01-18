
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, CodeState, ExecutionResult, Language } from "../types";

// Fixed: Correctly initialize GoogleGenAI with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCodeWithGemini(prompt: string, currentState: CodeState, lang: Language): Promise<AIResponse> {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are an expert developer assistant. 
  The user is working in a ${lang === 'web' ? 'Web (HTML/CSS/JS)' : lang} environment.
  Provide code snippets based on the user's request.
  Return a JSON object.
  Current context:
  ${lang === 'web' ? `HTML: ${currentState.html}\nCSS: ${currentState.css}\nJS: ${currentState.javascript}` : `${lang}: ${currentState[lang]}`}`;

  // Use ai.models.generateContent to query GenAI with model name and prompt.
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING },
          css: { type: Type.STRING },
          js: { type: Type.STRING },
          java: { type: Type.STRING },
          python: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
      },
    },
  });

  try {
    // Correctly extract text output using the .text property.
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { explanation: "Error parsing AI response." };
  }
}

export async function simulateExecution(code: string, lang: Language): Promise<ExecutionResult> {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a virtual ${lang} execution engine.
  The user provides code. You must simulate its execution and return ONLY the stdout and stderr as if it ran on a real machine.
  Include line breaks and proper formatting.
  If there are compilation errors, provide them in stderr.
  Return a JSON object.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Execute this ${lang} code:\n\n${code}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stdout: { type: Type.STRING, description: 'The standard output of the program' },
          stderr: { type: Type.STRING, description: 'Errors or stack traces' },
          exitCode: { type: Type.INTEGER, description: '0 for success, non-zero for error' },
        },
        required: ['stdout', 'stderr', 'exitCode']
      },
    },
  });

  try {
    // Correctly extract text output using the .text property.
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { stdout: "", stderr: "Virtual Execution Failed", exitCode: 1 };
  }
}
