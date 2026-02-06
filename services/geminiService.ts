
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export type MessageType = 'welcome' | 'expiring' | 'expired';
export type MessageTone = 'friendly' | 'professional' | 'urgent';

// Dados de Pagamento Fixos
const PIX_KEY = "13996566872";
const PIX_NAME = "Francisco de Assis da Silva";

export const generateIptvMessage = async (
  clientName: string, 
  expirationDate: string, 
  type: MessageType,
  tone: MessageTone = 'friendly'
): Promise<string> => {
  let contextPrompt = '';

  switch (type) {
    case 'welcome':
      contextPrompt = `Este é um novo cliente. Boas-vindas calorosas, informe que o acesso foi liberado. Peça para ele testar e se precisar de ajuda chamar o suporte.`;
      break;
    case 'expiring':
      contextPrompt = `O plano vence em ${expirationDate}. Lembre-o gentilmente para evitar a interrupção do sinal. Mencione que a renovação é rápida.`;
      break;
    case 'expired':
      contextPrompt = `O plano venceu em ${expirationDate}. Informe que o sinal foi interrompido e que para voltar a assistir basta realizar o pagamento da renovação.`;
      break;
  }

  const prompt = `Atue como um gestor de IPTV profissional. Escreva uma mensagem de WhatsApp para o cliente ${clientName}.
  
  CONTEXTO DA MENSAGEM: ${contextPrompt}
  
  DADOS DE PAGAMENTO (Sempre inclua de forma clara nas mensagens de renovação/vencimento):
  Chave PIX: ${PIX_KEY}
  Nome: ${PIX_NAME}

  REGRAS:
  - O tom deve ser ${tone === 'friendly' ? 'amigável e prestativo' : tone === 'professional' ? 'profissional e direto' : 'urgente, destacando a iminência da perda do sinal'}.
  - Use emojis apropriados para IPTV (📺, 🍿, ⚽, ⚡).
  - Inclua um Call to Action (Chamada para ação) incentivando o envio do comprovante.
  - Formate o texto para leitura fácil no WhatsApp (use negritos em pontos chave).
  - Não use placeholders como [Link], crie um texto natural.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text || "Erro ao gerar mensagem automática.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, não consegui gerar a mensagem agora. Verifique sua conexão.";
  }
};
