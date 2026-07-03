import { AIGenerationFailedError, AIProviderNotConfiguredError } from "@/lib/ai/errors";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TEXT_MODEL = "gemini-2.5-flash";

type InlineImage = { base64: string; mimeType: string };

function requireApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AIProviderNotConfiguredError();
  return key;
}

// Surface swap via Gemini's multimodal image-editing endpoint. Detection of
// which regions count as "worktop" / "splashback" / "island" is handled by
// the model from the prompt - no manual masking required from the user.
export async function generateStoneSwap(params: {
  sourceImage: InlineImage;
  stoneTextureImage: InlineImage;
  stoneName: string;
  refinement?: string;
}): Promise<InlineImage> {
  const apiKey = requireApiKey();

  const prompt = [
    "You are editing a real photo of a kitchen for a stone worktop retailer.",
    "Automatically detect the kitchen worktop (countertop) surfaces, the splashback/backsplash wall, and any kitchen island surface in the first image.",
    `Replace those surfaces only with the exact stone material shown in the second reference image ("${params.stoneName}"), tiling/aligning the stone pattern naturally across each surface.`,
    "Preserve the original photo's perspective, lighting, shadows and reflections so the result looks photorealistic - do not alter cabinets, walls, appliances, floor, or anything that is not a worktop/splashback/island surface.",
    params.refinement?.trim() ? `Additional instruction from the customer: ${params.refinement.trim()}` : "",
    "Return only the edited photo.",
  ]
    .filter(Boolean)
    .join(" ");

  const response = await fetch(`${GEMINI_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: params.sourceImage.mimeType, data: params.sourceImage.base64 } },
            {
              inline_data: {
                mime_type: params.stoneTextureImage.mimeType,
                data: params.stoneTextureImage.base64,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new AIGenerationFailedError(`Gemini API error (${response.status}): ${await response.text()}`);
  }

  const json = await response.json();
  const imagePart = json?.candidates?.[0]?.content?.parts?.find((p: { inline_data?: unknown }) => p.inline_data) as
    | { inline_data: { data: string; mime_type: string } }
    | undefined;

  if (!imagePart) throw new AIGenerationFailedError();

  return { base64: imagePart.inline_data.data, mimeType: imagePart.inline_data.mime_type };
}

// Cheap pre-check so a credit isn't spent generating a render for a photo
// that clearly isn't a kitchen.
export async function classifyIsKitchenPhoto(image: InlineImage): Promise<boolean> {
  const apiKey = requireApiKey();

  const response = await fetch(`${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Does this photo show the interior of a kitchen (with visible worktops, cabinets, or a splashback)? Reply with exactly one word: YES or NO.",
            },
            { inline_data: { mime_type: image.mimeType, data: image.base64 } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) return true; // fail open - don't block uploads on a moderation outage

  const json = await response.json();
  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "YES";
  return text.trim().toUpperCase().startsWith("Y");
}
