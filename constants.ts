
export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const INITIAL_FREE_GENERATIONS = 3;
export const PREMIUM_GENERATIONS_LIMIT = 100; // New
export const MAX_HISTORY_ITEMS = 20;

export const APP_NAME = "Cosplay Image Generator";

// Default prompt if user doesn't provide one (currently not asking user for prompt in MVP)
export const DEFAULT_GENERATION_PROMPT = "A high-quality, photorealistic image of a person wearing an elaborate and creative cosplay costume, striking a dynamic pose against a vibrant, abstract background.";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002";
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";

export const MIME_TYPE_JPEG = "image/jpeg";
export const MIME_TYPE_PNG = "image/png";

export const GENERATED_IMAGE_WIDTH = 1024;
export const GENERATED_IMAGE_HEIGHT = 1024;
