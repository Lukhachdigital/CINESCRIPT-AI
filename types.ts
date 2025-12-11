export enum FilmStyle {
  CINEMATIC = 'Điện ảnh (Cinematic)',
  ANIMATION = 'Hoạt hình (Animation)'
}

export enum CostumeMode {
  ORIGINAL = 'Trang phục gốc',
  AUTO = 'Auto trang phục',
  SEXY = 'Gợi cảm'
}

export interface ScriptRequest {
  idea: string;
  duration: number; // in minutes
  style: FilmStyle;
  imageData?: string; // Base64 string without prefix
  imageMimeType?: string;
  optionalImageData?: string; // Second optional image
  optionalImageMimeType?: string;
  costumeMode: CostumeMode;
}

export interface PromptItem {
  vi: string;
  en: string;
}

export interface GeneratedContent {
  title: PromptItem;
  context: PromptItem[];
  generated_costume_prompt?: PromptItem; // New field for the Auto/Sexy costume concept
  characters: PromptItem[];
  script: PromptItem[];
}