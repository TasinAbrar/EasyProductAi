
import React, { useState } from 'react';
import { 
  Upload, Image as ImageIcon, Download, 
  Maximize2, X, Zap, Loader2, CheckCircle, ArrowRight, Palette, Info,
  RefreshCw, AlertTriangle, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, GeneratedProductImage } from './types';
import { TRANSLATIONS, STUDIO_COLORS, SINGLE_IMAGE_ANGLES, DUAL_IMAGE_ANGLES } from './constants';
import { renderProductAngle } from './services/gemini';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedProductImage | null>(null);
  
  // Error States
  const [errorType, setErrorType] = useState<'quota' | 'generic' | 'auth' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Studio Settings
  const [selectedBg, setSelectedBg] = useState(STUDIO_COLORS[0].value);
  const [isTransparent, setIsTransparent] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') setSourceImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShots = async () => {
    if (!sourceImage) return;
    
    setIsProcessing(true);
    setGeneratedImages([]);
    setErrorType(null);
    setErrorMessage('');

    try {
      const anglesToRender = backImage ? DUAL_IMAGE_ANGLES : SINGLE_IMAGE_ANGLES;
      
      const promises = anglesToRender.map(async (angle) => {
        // @ts-ignore
        const imgToUse = angle.useBack ? backImage : sourceImage;
        const url = await renderProductAngle(imgToUse!, angle.prompt, selectedBg, isTransparent);
        return {
          id: angle.id,
          url,
          angle: t[angle.labelKey],
          description: angle.prompt
        };
      });

      const results = await Promise.all(promises);
      setGeneratedImages(results);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      console.error("Render Error:", err);
      const message = (err.message || "").toLowerCase();
      const errString = JSON.stringify(err).toLowerCase();

      if (errString.includes("429") || errString.includes("quota") || message.includes("quota")) {
        setErrorType('quota');
      } else if (errString.includes("403") || message.includes("permission") || message.includes("not authorized")) {
        setErrorType('auth');
        setErrorMessage("Permission Denied: Your API Key might not have billing enabled or doesn't have access to the Gemini Image model. Please check your Google AI Studio settings.");
      } else if (errString.includes("401") || message.includes("key")) {
        setErrorType('auth');
        setErrorMessage("Invalid API Key: The provided key is not valid.");
      } else {
        setErrorType('generic');
        setErrorMessage(err.message || "An unexpected error occurred during rendering.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSourceImage(null);
    setBackImage(null);
    setGeneratedImages([]);
    setIsProcessing(false);
    setErrorType(null);
    setErrorMessage('');
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `easySocial-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handleContactDeveloper = () => {
    window.location.href = "mailto:tasinabrar01@gmail.com";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white transition-all duration-700 font-sans">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <span>easySocial</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleContactDeveloper}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <Mail size={14} /> Contact the Developer
            </button>
            <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="font-black text-xs uppercase tracking-widest opacity-60 hover:opacity-100 px-4 py-2 rounded-lg bg-white/5 transition-all">
              {lang === 'en' ? 'BN' : 'EN'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        
        {/* Step 1: Upload Section */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Professional Photos <br/><span className="text-blue-600">From Any Angle.</span>
            </h1>
            <p className="text-lg opacity-50 font-medium">{t.heroSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {t.uploadFront}
              </p>
              <label className={`relative block group cursor-pointer aspect-[4/3] rounded-[3rem] overflow-hidden border-4 border-dashed transition-all duration-500 ${sourceImage ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:border-blue-600/30 bg-slate-900/50'}`}>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'front')} className="hidden" />
                {sourceImage ? (
                  <div className="relative w-full h-full">
                    <img src={sourceImage} className="w-full h-full object-cover" alt="Front" />
                    <button onClick={(e) => { e.preventDefault(); setSourceImage(null); }} className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl hover:bg-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-lg">Click to Upload</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{t.uploadSub}</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {t.uploadBack}
              </p>
              <label className={`relative block group cursor-pointer aspect-[4/3] rounded-[3rem] overflow-hidden border-4 border-dashed transition-all duration-500 ${backImage ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:border-blue-600/30 bg-slate-900/50'}`}>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'back')} className="hidden" />
                {backImage ? (
                  <div className="relative w-full h-full">
                    <img src={backImage} className="w-full h-full object-cover" alt="Back" />
                    <button onClick={(e) => { e.preventDefault(); setBackImage(null); }} className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl hover:bg-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-all">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-lg opacity-40 group-hover:opacity-100">Add Back Side</p>
                      <p className="text-[10px] opacity-20 font-bold uppercase tracking-widest group-hover:opacity-40">{t.uploadOptional}</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </section>

        {sourceImage && !errorType && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10">
            <div className="bg-slate-900/40 rounded-[3rem] p-8 md:p-12 border border-white/5 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                      <Palette size={16} className="text-blue-500" /> {t.bgLabel}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {STUDIO_COLORS.map(color => (
                        <button 
                          key={color.value} 
                          onClick={() => { setSelectedBg(color.value); setIsTransparent(false); }}
                          className={`w-12 h-12 rounded-2xl border-2 transition-all shadow-lg ${selectedBg === color.value && !isTransparent ? 'border-blue-600 scale-110 shadow-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                      <button 
                        onClick={() => setIsTransparent(true)}
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center bg-white/5 transition-all ${isTransparent ? 'border-blue-600 scale-110 shadow-xl shadow-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                        title="Pure White / Transparent"
                      >
                         <div className="w-7 h-7 border-2 border-white/20 border-dashed rounded-md" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
                    <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs opacity-50 leading-relaxed font-medium">
                      {backImage 
                        ? "Both views detected. Generating 2 front angles and 2 back angles for a complete 360-degree set." 
                        : "Single view detected. Generating 4 professional perspectives using the front image."}
                    </p>
                  </div>
                </div>

                <div>
                   {!isProcessing ? (
                     <button 
                       onClick={generateShots} 
                       className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-blue-500/30 hover:-translate-y-1 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                     >
                       {t.generateBtn} <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   ) : (
                     <div className="w-full py-8 bg-slate-800 rounded-[2.5rem] flex items-center justify-center gap-4 text-blue-500 font-black text-2xl cursor-not-allowed">
                       <Loader2 className="animate-spin" size={32} /> RENDERING...
                     </div>
                   )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <section id="results-section" className="space-y-10 min-h-[40vh]">
          <AnimatePresence mode="wait">
            {errorType && (
              <motion.div 
                key="error-box"
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="max-w-3xl mx-auto p-12 bg-red-500/10 border border-red-500/30 rounded-[3rem] text-center space-y-8 shadow-2xl shadow-red-500/5"
              >
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto">
                   <AlertTriangle size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tight">
                    {errorType === 'quota' ? 'Limit Reached' : errorType === 'auth' ? 'Permission Error' : 'Studio Error'}
                  </h2>
                  <p className="text-lg opacity-70 font-medium leading-relaxed max-w-xl mx-auto">
                    {errorMessage || 'An unexpected error occurred while processing your images. Please try again or contact the developer.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button onClick={handleContactDeveloper} className="w-full sm:w-auto px-10 py-5 bg-red-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 hover:-translate-y-1 active:scale-95 transition-all">
                    <Mail size={22} /> Contact Tasin Abrar
                  </button>
                  <button onClick={reset} className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(isProcessing || generatedImages.length > 0) && !errorType && (
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                   <div className="w-2 h-8 bg-blue-600 rounded-full" /> Studio Results
                </h2>
                {generatedImages.length > 0 && (
                   <button onClick={reset} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                      <RefreshCw size={12} /> {t.resetBtn}
                   </button>
                )}
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isProcessing && !generatedImages.length ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-900 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent animate-pulse" />
                  <Loader2 className="animate-spin text-blue-600" size={48} />
                  <div className="text-center space-y-1">
                     <p className="font-black text-[10px] uppercase opacity-40 tracking-widest">Rendering Angle {i + 1}</p>
                  </div>
                </div>
              ))
            ) : generatedImages.length && !errorType ? (
              generatedImages.map((img, i) => (
                <motion.div 
                  key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="group relative aspect-square bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl hover:border-blue-600/30 transition-all duration-500"
                >
                  <img src={img.url} className="w-full h-full object-cover" alt={img.angle} />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-widest">{img.angle}</p>
                     <div className="flex items-center justify-between gap-4">
                        <button onClick={() => setActiveImage(img)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                           <Maximize2 size={14} /> Full View
                        </button>
                        <button onClick={() => downloadImage(img.url, img.angle)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                           <Download size={18} />
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))
            ) : sourceImage && !isProcessing && !errorType && (
              <div className="col-span-full py-20 text-center opacity-20 space-y-4">
                 <ImageIcon size={64} className="mx-auto" />
                 <p className="font-black uppercase tracking-[0.3em] text-xs">Ready for Studio Render</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveImage(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/5" >
              <div className="flex-1 bg-black/40 flex items-center justify-center p-6 md:p-12">
                 <img src={activeImage.url} className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl" alt="Preview" />
              </div>
              <div className="w-full md:w-96 p-12 flex flex-col justify-between border-l border-white/5 bg-slate-900">
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-blue-500 font-black text-xs uppercase tracking-widest">{activeImage.angle}</p>
                        <h3 className="text-4xl font-black tracking-tighter">Studio Quality</h3>
                      </div>
                      <button onClick={() => setActiveImage(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"> <X size={24} /> </button>
                   </div>
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500"> <CheckCircle size={14} /> Ready for Social Media </div>
                     <p className="text-sm opacity-50 font-medium leading-relaxed"> Professional studio rendering with optimized lighting and perspective for high-end marketing. </p>
                   </div>
                </div>
                <div className="space-y-4 pt-10">
                   <button onClick={() => downloadImage(activeImage.url, activeImage.angle)} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-all" > <Download size={22} /> {t.downloadBtn} </button>
                   <button onClick={() => setActiveImage(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"> Back to Studio </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-24 px-6 border-t border-white/5 text-center mt-20">
         <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3 font-black text-2xl opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
               <Zap size={24} fill="currentColor" className="text-blue-600" /> easySocial
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">easysocial.shop • 2026</p>
              <p className="text-[11px] font-bold opacity-40 uppercase tracking-[0.2em] text-blue-400">Developed by Tasin Abrar</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
