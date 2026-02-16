
import { TranslationStrings } from './types';

export const TRANSLATIONS: Record<'en' | 'bn', TranslationStrings> = {
  en: {
    appTitle: "easySocial",
    heroTitle: "Professional Studio Photos in Seconds",
    heroSub: "Upload your raw photos. Get 4 clean, studio-quality images from different angles instantly.",
    uploadFront: "Front View (Required)",
    uploadBack: "Back View (Optional)",
    uploadOptional: "Optional",
    uploadSub: "PNG, JPG supported",
    generateBtn: "Generate Studio Shots",
    processingMsg: "Generating professional studio shots...",
    angleFront: "Front Hero Shot",
    anglePerspective: "Perspective Angle",
    angleSide: "Side Profile",
    angleBack: "Rear View",
    angleBackPerspective: "Rear Perspective",
    angleTop: "Top View",
    downloadBtn: "Download PNG",
    resetBtn: "Start Over",
    bgLabel: "Background Color",
    transparentLabel: "Transparent / Pure White"
  },
  bn: {
    appTitle: "easySocial",
    heroTitle: "সেকেন্ডে প্রফেশনাল স্টুডিও ফটো",
    heroSub: "আপনার ছবি আপলোড করুন। ৪টি পরিষ্কার, স্টুডিও-কোয়ালিটি ছবি তৈরি হবে মুহূর্তেই।",
    uploadFront: "সামনের দৃশ্য (আবশ্যক)",
    uploadBack: "পেছনের দৃশ্য (ঐচ্ছিক)",
    uploadOptional: "ঐচ্ছিক",
    uploadSub: "PNG, JPG সাপোর্ট করে",
    generateBtn: "স্টুডিও শট তৈরি করুন",
    processingMsg: "প্রফেশনাল স্টুডিও শট তৈরি হচ্ছে...",
    angleFront: "সামনের হিরো শট",
    anglePerspective: "পার্সপেক্টিভ অ্যাঙ্গেল",
    angleSide: "সাইড প্রোফাইল",
    angleBack: "পেছনের দৃশ্য",
    angleBackPerspective: "পেছনের পার্সপেক্টিভ",
    angleTop: "টপ ভিউ",
    downloadBtn: "ডাউনলোড করুন",
    resetBtn: "আবার শুরু করুন",
    bgLabel: "ব্যাকগ্রাউন্ড কালার",
    transparentLabel: "ট্রান্সপারেন্ট / সাদা"
  }
};

export const STUDIO_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Gray', value: '#F3F4F6' },
  { name: 'Soft Blue', value: '#EBF5FF' },
  { name: 'Soft Pink', value: '#FFF5F5' },
  { name: 'Studio Black', value: '#1A1A1A' }
];

export const SINGLE_IMAGE_ANGLES = [
  { id: 'front', labelKey: 'angleFront' as const, prompt: "Straight front hero shot." },
  { id: 'perspective', labelKey: 'anglePerspective' as const, prompt: "45-degree perspective shot showing depth." },
  { id: 'side', labelKey: 'angleSide' as const, prompt: "90-degree side profile shot." },
  { id: 'top', labelKey: 'angleTop' as const, prompt: "Slightly elevated top-down perspective shot." }
];

export const DUAL_IMAGE_ANGLES = [
  { id: 'front', labelKey: 'angleFront' as const, useBack: false, prompt: "Straight front hero shot using the provided front image." },
  { id: 'front_p', labelKey: 'anglePerspective' as const, useBack: false, prompt: "Perspective angle using the provided front image." },
  { id: 'back', labelKey: 'angleBack' as const, useBack: true, prompt: "Straight rear hero shot using the provided back image." },
  { id: 'back_p', labelKey: 'angleBackPerspective' as const, useBack: true, prompt: "Rear perspective angle using the provided back image." }
];
