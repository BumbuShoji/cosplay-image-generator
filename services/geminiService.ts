
import { GoogleGenAI, GenerateImagesResponse, GenerateContentResponse, Part } from "@google/genai";
import { DEFAULT_GENERATION_PROMPT, GEMINI_IMAGE_MODEL, GEMINI_TEXT_MODEL, MIME_TYPE_JPEG } from '../constants';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("CRITICAL: Gemini API Key (process.env.API_KEY) is not set. Image generation will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

interface GenerateCosplayImageOptions {
  personImageFile?: File;
  characterImageFile?: File;
  overridePrompt?: string;
}

async function fileToGenerativePart(file: File, mimeType: string): Promise<Part> {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        reject(new Error("File reading resulted in null."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType,
    },
  };
}

export const generateCosplayImage = async (
  options: GenerateCosplayImageOptions
): Promise<{ base64ImageData: string; finalPrompt: string }> => {
  const { personImageFile, characterImageFile, overridePrompt } = options;
  let finalPromptForImagen: string;

  try {
    if (overridePrompt) {
      finalPromptForImagen = overridePrompt;
    } else if (personImageFile && characterImageFile) {
      // Stage 1: Generate prompt using multimodal model
      const personImagePart = await fileToGenerativePart(personImageFile, personImageFile.type);
      const characterImagePart = await fileToGenerativePart(characterImageFile, characterImageFile.type);

      const instructionForPromptGen = `You are a creative assistant for a cosplay image generator.
Based on the first image (a person) and the second image (a character or style reference),
generate a detailed and imaginative text prompt that can be used by an image generation AI (like Imagen)
to create a new, high-quality photorealistic image.
Describe the costume, the hair style, hair color, the eye color and any other features of the character, and the facial feature and the pose of person.
Focus on creating a vivid and actionable prompt for an image generation model.
Output ONLY the generated prompt text, without any other conversational text or preambles.

# Prompt style
Generate image the person of the first image wearing a cosplay costume inspired by the second image.
The new image should depict a person, same to the person in the first image.
first_image_description:
  type: photograph
  gender: 
  subject:
    face_features:
      brows:
        shape: 
        thickness: 
        color: 
      eyes:
        shape: 
        color: 
        expression: 
      nose:
        bridge: 
        tip: 
        width: 
      mouth:
        lips: 
        expression: 
        corners: 
      face_shape: 
      skin_tone: 
    vibe: 
second_image_description:
  type: illustration
  gender: 
  costume:
    clothes:
      category: 
      color: 
      feature:
    accessories:
      category:
      feature:
  hair_style:
    bangs:
      style: 
      length: 
      movement: 
    side_hair:
      style: 
      length: 
      movement: 
    back_hair:
      style: 
      length: 
      movement: 
    overall_style: 
  hair_color:
    - color: 
    - palette_description: 
  eye_color:
    - color: 
    - palette_description: 
`;

      const textGenResponse: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: {
          parts: [
            { text: instructionForPromptGen },
            personImagePart,
            characterImagePart,
          ],
        },
        config: {
          // temperature: 0.7 // Optionally adjust for prompt creativity
        }
      });
      
      let generatedPromptText = textGenResponse.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = generatedPromptText.match(fenceRegex);
      if (match && match[2]) {
        generatedPromptText = match[2].trim();
      }

      if (!generatedPromptText) {
        console.warn("Multimodal model did not return a valid prompt. Falling back to a simpler prompt.");
        finalPromptForImagen = characterImageFile?.name
            ? `A high-quality, photorealistic image of a person in an elaborate cosplay costume. The costume style is inspired by a character (theme: ${characterImageFile.name.split('.')[0]}). The person is striking a dynamic pose against a vibrant, abstract background.`
            : DEFAULT_GENERATION_PROMPT;
      } else {
        finalPromptForImagen = generatedPromptText;
      }
    } else {
      console.warn("generateCosplayImage called without sufficient inputs (images or overridePrompt). Using default prompt.");
      finalPromptForImagen = DEFAULT_GENERATION_PROMPT;
    }

    // Stage 2: Generate image using Imagen
    const imageGenResponse: GenerateImagesResponse = await ai.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: finalPromptForImagen,
      config: {
        numberOfImages: 1,
        outputMimeType: MIME_TYPE_JPEG,
      },
    });

    if (imageGenResponse.generatedImages && imageGenResponse.generatedImages.length > 0 && imageGenResponse.generatedImages[0].image?.imageBytes) {
      return {
        base64ImageData: imageGenResponse.generatedImages[0].image.imageBytes,
        finalPrompt: finalPromptForImagen,
      };
    } else {
      console.error("Gemini API (Imagen) response error: No image generated or unexpected structure.", imageGenResponse);
      throw new Error("No image generated by Imagen or unexpected API response was received.");
    }

  } catch (error: any) {
    console.error("Error in generateCosplayImage:", error);
    let errorMessage = "Image generation process failed due to an unknown error.";
    if (error.message) { // Check if error.message exists
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    throw new Error(`Cosplay image creation failed: ${errorMessage}`);
  }
};