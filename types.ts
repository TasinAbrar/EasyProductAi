
export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface ProductStudioState {
  sourceImage: string | null;
  backImage: string | null;
  isProcessing: boolean;
  generatedImages: GeneratedProductImage[];
  bgColor: string;
  isTransparent: boolean;
}

export interface GeneratedProductImage {
  id: string;
  url: string;
  angle: string;
  description: string;
}

export interface TranslationStrings {
  appTitle: string;
  heroTitle: string;
  heroSub: string;
  uploadFront: string;
  uploadBack: string;
  uploadOptional: string;
  uploadSub: string;
  generateBtn: string;
  processingMsg: string;
  angleFront: string;
  anglePerspective: string;
  angleSide: string;
  angleBack: string;
  angleBackPerspective: string;
  angleTop: string;
  downloadBtn: string;
  resetBtn: string;
  bgLabel: string;
  transparentLabel: string;
}
