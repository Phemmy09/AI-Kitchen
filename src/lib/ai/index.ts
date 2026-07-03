// Provider abstraction - swap AI_IMAGE_PROVIDER in .env.local if we move off
// Gemini later. Every provider must implement this same shape.
import * as gemini from "@/lib/ai/gemini";

const provider = process.env.AI_IMAGE_PROVIDER ?? "gemini";

if (provider !== "gemini") {
  throw new Error(`Unknown AI_IMAGE_PROVIDER "${provider}" - only "gemini" is implemented.`);
}

export const generateStoneSwap = gemini.generateStoneSwap;
export const classifyIsKitchenPhoto = gemini.classifyIsKitchenPhoto;
export { AIProviderNotConfiguredError, AIGenerationFailedError, NotAKitchenPhotoError } from "@/lib/ai/errors";
