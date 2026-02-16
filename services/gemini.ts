
import { GoogleGenAI } from "@google/genai";

export const renderProductAngle = async (
  base64Image: string, 
  anglePrompt: string, 
  bgColor: string, 
  isTransparent: boolean
): Promise<string> => {
  // Always create a new instance right before use to pick up the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Detect MIME type from base64 string
  const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  const data = base64Image.split(',')[1] || base64Image;

  const bgInstruction = isTransparent 
    ? "Place the product on a pure, solid, clean white background (hex #FFFFFF) with no shadows on the background itself, only soft contact shadows under the product." 
    : `Place the product on a solid background with hex color ${bgColor}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          },
          {
            text: `Professional E-commerce Photography Studio Task:
            
            Action: Re-render the product in this specific angle: ${anglePrompt}.
            
            Background: ${bgInstruction}
            
            Requirements:
            - MAINTAIN CONSISTENCY: The product's shape, colors, textures, labels, and overall identity must remain identical to the original image.
            - LIGHTING: Use professional studio three-point lighting (softbox style) to highlight the product features.
            - QUALITY: High-resolution, sharp focus, professional depth of field.
            - CLEANLINESS: Zero clutter. No other objects, hands, or props. Just the product.
            - ORIENTATION: Center the product perfectly in the frame.
            
            Output: Generate a high-quality studio-shot version of the product provided.`
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
    
    // Check for text-only response which might contain error descriptions
    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    if (textPart?.text) {
      console.error("Model returned text instead of image:", textPart.text);
    }
    
    throw new Error("No image data returned from studio engine. The model might be blocking the content or failing to render.");
  } catch (error) {
    console.error("Critical Generation Error:", error);
    throw error;
  }
};
