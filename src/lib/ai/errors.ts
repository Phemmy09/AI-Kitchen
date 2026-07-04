export class AIProviderNotConfiguredError extends Error {
  constructor() {
    super("The AI image provider is not configured yet.");
    this.name = "AIProviderNotConfiguredError";
  }
}

export interface GeminiFailureDiagnostics {
  attempt?: number;
  finishReason?: string;
  safetyRatings?: unknown;
  promptFeedback?: unknown;
  refusalText?: string;
}

export class AIGenerationFailedError extends Error {
  readonly diagnostics?: GeminiFailureDiagnostics;

  constructor(
    message = "The AI provider could not generate a render for this image.",
    diagnostics?: GeminiFailureDiagnostics,
  ) {
    super(message);
    this.name = "AIGenerationFailedError";
    this.diagnostics = diagnostics;
  }
}

export class NotAKitchenPhotoError extends Error {
  constructor() {
    super("This doesn't look like a kitchen photo. Please upload a clear photo of a kitchen.");
    this.name = "NotAKitchenPhotoError";
  }
}
