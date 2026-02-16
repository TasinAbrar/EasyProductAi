
import { GoogleGenAI } from "@google/genai";

export const renderProductAngle = async (
  base64Image: string, 
  anglePrompt: string, 
  bgColor: string, 
  isTransparent: boolean
): Promise<string> => {
  // Obtain API key exclusively from the environment
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Studio configuration missing: API Key not found.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Extract clean base64 data
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const bgInstruction = isTransparent 
    ? "Place the subject on a pure solid white background (#FFFFFF) with no shadows on the background itself, only soft contact shadows underneath the subject." 
    : `Place the subject on a solid background with hex color ${bgColor}.`;

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
            text: `Professional Studio Rendering Task:
            
            Requested Angle: ${anglePrompt}.
            
            Background Style: ${bgInstruction}
            
            Requirements:
            - MAINTAIN EXACT IDENTITY: The primary subject must retain its exact shape, colors, textures, and details from the source image.
            - LIGHTING: Apply professional studio softbox lighting to emphasize form and texture.
            - QUALITY: Result must be high-resolution, sharp, and look like a professional DSLR shot.
            - SCENE: No extra objects, hands, or background clutter. Just the subject in the clean studio environment.
            
            Output: High-fidelity image rendering.`
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
    
    throw new Error("The digital studio engine failed to return image data. This may be due to content filtering.");
  } catch (error) {
    console.error("Studio Rendering Error:", error);
    throw error;
  }
};
