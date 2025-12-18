import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { EXAM_DATA } from "../constants";
import { AnalysisResult, Category, Trend } from "../types";

let chatSession: Chat | null = null;
const API_KEY = (import.meta as any).env.VITE_EXAME_KEY || process.env.exame_key;

// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    console.error("Error initializing GoogleGenAI", e);
  }
}

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
  if (!API_KEY || !ai) {
    console.error("API Key not found or Gemini not initialized");
    return;
  }

  try {
    chatSession = ai.chats.create({
      model: 'gemini-1.5-flash',
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
    // Re-check after attempt
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

export const analyzePdf = async (base64Data: string): Promise<AnalysisResult | null> => {
  if (!API_KEY || !ai) {
    console.error("API Key not found or Gemini not initialized");
    return null;
  }

  try {
    // Using generic generation for PDF analysis with schema enforcement via prompt

    // Using generic generation for PDF analysis with schema enforcement via prompt
    // Note: Using a standard model initialization here as the 'chats' abstraction 
    // might be stateful/conversational, and we want a one-off analysis.

    // Since the provided SDK wrapper syntax in the file seems slightly custom or specific version 
    // (importing from @google/genai which is the new SDK), let's stick to the pattern but use a fresh generate call.

    const prompt = `
          Analise este PDF de exame de sangue. Extraia os dados e gere um resumo.
          Retorne APENAS um JSON válido (sem markdown code blocks) com a seguinte estrutura:
          {
              "goodNews": ["string", "string"], // Pontos positivos/melhorias
              "attentionPoints": ["string", "string"], // Pontos de atenção/piora/fora do normal
              "examData": [
                  {
                      "id": "string (unique)",
                      "name": "Nome do Exame",
                      "unit": "unidade",
                      "reference": "valor de referência",
                      "date1": "Data anterior (se houver, formato DD/MM/AAAA)",
                      "value1": number | string | null,
                      "status1": "Normal" | "Alto" | "Baixo",
                      "date2": "Data atual do exame (formato DD/MM/AAAA)",
                      "value2": number | string | null,
                      "status2": "Normal" | "Alto" | "Baixo",
                      "observation": "Breve observação sobre a mudança ou estado",
                      "category": "${Object.values(Category).join('" | "')}", 
                      "trend": "${Object.values(Trend).join('" | "')}"
                  }
              ]
          }
          
          Regras para Categorias (tente encaixar nestas):
          Lipídios, Fígado, Metabolismo, Músculos, Inflamação, Rins, Eletrólitos, Sangue/Ferro, Urina.
      `;

    // The SDK used seems to be the Google GenAI SDK (Node/Web). 
    // Let's assume ai.models.generateContent is the way or similar.
    // Re-using the 'ai' instance strategy if possible, but 'ai' is a client.

    console.log("Iniciando análise de PDF com modelo: gemini-1.5-flash");
    const model = (ai as any).getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: 'application/pdf', data: base64Data } }
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanJson = text?.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!cleanJson) return null;

    try {
      return JSON.parse(cleanJson) as AnalysisResult;
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini:", parseError, text);
      return null;
    }

  } catch (error) {
    console.error("Error analyzing PDF:", error);
    return null;
  }
};
