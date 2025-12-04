import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { EXAM_DATA } from "../constants";

let chatSession: Chat | null = null;

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (): string => {
  const dataContext = JSON.stringify(EXAM_DATA);
  
  return `
    Você é um assistente médico virtual útil, especializado em análise de exames laboratoriais.
    
    Aqui estão os dados reais dos exames do paciente (Comparativo de Setembro/2025 vs Dezembro/2025):
    ${dataContext}

    Instruções:
    1. Responda com base ESTRITAMENTE nesses dados.
    2. Seja claro, empático e objetivo.
    3. Se o usuário perguntar sobre o CPK, alerte sobre a elevação significativa e sugira atenção médica.
    4. Explique termos técnicos de forma simples.
    5. Nunca dê diagnósticos definitivos, sugira sempre consultar o médico responsável.
    6. Formate a resposta usando Markdown para melhor leitura (negrito para valores importantes).
    7. Responda em Português do Brasil.
  `;
};

export const initializeChat = (): void => {
  if (!process.env.API_KEY) {
    console.error("API Key not found in environment variables");
    return;
  }

  try {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      },
    });
  } catch (error) {
    console.error("Failed to initialize chat session", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
    if (!chatSession) return "Erro: Serviço de IA não disponível (Verifique API Key).";
  }

  try {
    const response: GenerateContentResponse = await chatSession!.sendMessage({ message });
    return response.text || "Não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.";
  }
};