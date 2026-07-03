export class AIProviderNotConfiguredError extends Error {
  constructor() {
    super("The AI image provider is not configured yet.");
    this.name = "AIProviderNotConfiguredError";
  }
}

export class AIGenerationFailedError extends Error {
  constructor(message = "The AI provider could not generate a render for this image.") {
    super(message);
    this.name = "AIGenerationFailedError";
  }
}

export class NotAKitchenPhotoError extends Error {
  constructor() {
    super("This doesn't look like a kitchen photo. Please upload a clear photo of a kitchen.");
    this.name = "NotAKitchenPhotoError";
  }
}
