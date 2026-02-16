
import { GoogleGenAI } from "@google/genai";

export const renderProductAngle = async (
  base64Image: string, 
  anglePrompt: string, 
  bgColor: string, 
  isTransparent: boolean
): Promise<string> => {
  // Always create a new instance to pick up the latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const data = base64Image.split(',')[1] || base64Image;
  const bgInstruction = isTransparent 
    ? "Place the product on a pure solid white background for easy extraction." 
    : `Place the product on a solid background with hex color ${bgColor}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: 'image/png'
            }
          },
          {
            text: `Professional Studio Photography Task: ${anglePrompt} 
            ${bgInstruction}
            Guidelines:
            - Keep the product exactly as it is (colors, labels, shape).
            - Use professional studio soft lighting.
            - Ensure high-end sharp focus and professional shadows.
            - NO other objects in the frame.
            - Output should look like a clean e-commerce listing image.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data returned from studio engine");
  } catch (error) {
    // Re-throw the error so the UI can detect quota/auth issues
    throw error;
  }
};
