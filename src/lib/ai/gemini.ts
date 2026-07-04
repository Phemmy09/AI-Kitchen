import { AIGenerationFailedError, AIProviderNotConfiguredError, type GeminiFailureDiagnostics } from "@/lib/ai/errors";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TEXT_MODEL = "gemini-2.5-flash";
// One retry for the "200 OK but no image part" case only - Gemini's image
// output is non-deterministic, so an identical immediate retry is a
// legitimate way to shake off a one-off text-only refusal. HTTP-level
// failures (auth/quota/5xx) still throw immediately, no retry.
const MAX_IMAGE_ATTEMPTS = 2;

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
    "Your primary goal is to replace both the worktop (countertop/island) slabs and the backsplash walls with the new stone material.",
    `By default, automatically detect all kitchen worktop (countertop) slabs, kitchen island slabs, and splashback/backsplash wall areas in the first image, and replace all of these areas with the exact stone material shown in the second reference image ("${params.stoneName}").`,
    "Ensure the stone pattern is naturally tiled and aligned across all replaced surfaces.",
    "Preserve the original kitchen photo's perspective, cabinets, floor, appliances, lighting, shadows, and reflections so the result looks photorealistic.",
    params.refinement?.trim()
      ? `Important customer instructions that override the default replacement behavior: ${params.refinement.trim()}`
      : "",
    "Return only the edited photo.",
  ]
    .filter(Boolean)
    .join(" ");

  const requestBody = JSON.stringify({
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
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  let lastDiagnostics: GeminiFailureDiagnostics | undefined;

  for (let attempt = 1; attempt <= MAX_IMAGE_ATTEMPTS; attempt++) {
    const response = await fetch(`${GEMINI_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    if (!response.ok) {
      throw new AIGenerationFailedError(`Gemini API error (${response.status}): ${await response.text()}`);
    }

    const json = await response.json();
    const candidate = json?.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (p: { inline_data?: unknown; inlineData?: unknown }) => p.inline_data || p.inlineData,
    ) as
      | { inline_data?: { data: string; mime_type: string }; inlineData?: { data: string; mimeType: string } }
      | undefined;

    if (imagePart) {
      const data = imagePart.inlineData?.data ?? imagePart.inline_data?.data;
      const mimeType = imagePart.inlineData?.mimeType ?? imagePart.inline_data?.mime_type;
      if (data && mimeType) {
        return { base64: data, mimeType };
      }
    }

    lastDiagnostics = {
      attempt,
      finishReason: candidate?.finishReason,
      safetyRatings: candidate?.safetyRatings,
      promptFeedback: json?.promptFeedback,
      refusalText: candidate?.content?.parts?.find((p: { text?: string }) => p.text)?.text,
    };
    console.error("generateStoneSwap: Gemini returned no image part", lastDiagnostics);
  }

  throw new AIGenerationFailedError(undefined, lastDiagnostics);
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
