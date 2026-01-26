
import { GoogleGenAI } from "@google/genai";

export async function editTourImage(base64ImageData: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData.split(',')[1], // Remove the data:image/jpeg;base64, prefix
              mimeType: mimeType,
            },
          },
          {
            text: `Por favor, edite esta foto de passeio de barco de acordo com o seguinte pedido: "${prompt}". Mantenha um visual profissional e natural de fotografia de turismo em Florianópolis.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
}
