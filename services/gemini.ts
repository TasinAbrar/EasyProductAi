
import { GoogleGenAI } from "@google/genai";

export const renderProductAngle = async (
  base64Image: string, 
  anglePrompt: string, 
  bgColor: string, 
  isTransparent: boolean
): Promise<string> => {
  // Use gemini-2.5-flash-image as it is the standard model for image generation tasks
  // and has broader access permissions than preview models.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
            text: `Professional Studio Photography Rendering:
            
            Action: Re-render this product/subject from the following perspective: ${anglePrompt}.
            
            Background: ${bgInstruction}
            
            Strict Quality Requirements:
            1. IDENTITY: The subject must remain exactly the same as the original (color, shape, text, labels).
            2. LIGHTING: Use professional studio three-point lighting (softbox style).
            3. CLEANLINESS: Solid, clean background. No hands, no props, no clutter.
            4. QUALITY: Sharp focus, high resolution, realistic textures.
            
            Output: A high-end studio-quality image.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // The output response may contain both image and text parts.
    // We iterate to find the image part.
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("The rendering engine did not return an image. It might be due to safety filters or a temporary service issue.");
  } catch (error) {
    console.error("Rendering Error:", error);
    throw error;
  }
};
