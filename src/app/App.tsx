import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Check, Copy, Loader2, X, Image as ImageIcon } from 'lucide-react';

type AppState = 'idle' | 'ready' | 'extracting' | 'done';

// Load Tesseract.js from CDN
declare global {
  interface Window {
    Tesseract: any;
  }
}

export default function App() {
  const [status, setStatus] = useState<AppState>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setStatus('ready');
      };
      reader.readAsDataURL(file);
    }
  };

  // Load Tesseract.js from CDN if not already loaded
  const loadTesseract = async () => {
    if (window.Tesseract) {
      return window.Tesseract;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => {
        resolve(window.Tesseract);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Tesseract.js'));
      };
      document.head.appendChild(script);
    });
  };

  // Handle OCR extraction using Tesseract.js
  const handleExtract = async () => {
    setStatus('extracting');
    
    try {
      if (!imageSrc) {
        setStatus('ready');
        return;
      }

      const Tesseract = await loadTesseract();
      const result = await Tesseract.recognize(imageSrc, 'eng');

      setExtractedText(result.data.text || '');
      setStatus('done');
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractedText('Error extracting text from image. Please try again.');
      setStatus('done');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStatus('idle');
    setImageSrc(null);
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setStatus('ready');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-[#f5f5f7] flex items-center justify-center p-4 sm:p-8 font-sans antialiased selection:bg-[#4da3ff]/30">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4da3ff]/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[540px] bg-[#15161b] rounded-[2.5rem] p-6 sm:p-10 shadow-[0_24px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.03] relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-12 h-12 bg-gradient-to-br from-[#1c1d23] to-[#15161b] rounded-2xl mx-auto mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5 flex items-center justify-center"
          >
            <FileText className="w-5 h-5 text-[#f5f5f7]" />
          </motion.div>
          <h1 className="text-2xl font-medium tracking-tight text-[#f5f5f7] mb-2">Photo Note</h1>
          <p className="text-[#9aa0aa] text-sm tracking-wide font-medium">Transform images into editable notes.</p>
        </div>

        {/* Dynamic Content Area */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            
            {/* IDLE / READY STATE - Upload & Preview */}
            {(status === 'idle' || status === 'ready') && (
              <motion.div
                key="upload-preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#1c1d23] rounded-3xl border border-white/5 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {status === 'idle' ? (
                  <label className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300 group">
                    <div className="bg-[#15161b] p-3.5 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-[#1c1d23] transition-all duration-300 shadow-sm border border-white/[0.02]">
                      <Upload className="w-5 h-5 text-[#4da3ff]" />
                    </div>
                    <span className="text-[#f5f5f7] font-medium mb-1.5 text-sm">Upload a photo</span>
                    <span className="text-[#9aa0aa] text-xs">Drag and drop or click to browse</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleFileChange} 
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-[#0b0b0f]/50 flex items-center justify-center max-h-[280px]">
                    <img 
                      src={imageSrc!} 
                      className="object-contain w-full h-full" 
                      alt="Preview" 
                    />
                    <button 
                      onClick={handleReset}
                      className="absolute top-3 right-3 p-2 bg-[#15161b]/80 backdrop-blur-md rounded-full text-[#9aa0aa] hover:text-[#f5f5f7] hover:bg-[#1c1d23] transition-all border border-white/10 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* EXTRACTING STATE */}
            {status === 'extracting' && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="bg-[#1c1d23] rounded-3xl border border-white/5 p-12 flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#4da3ff]/20 rounded-full blur-xl animate-pulse" />
                  <div className="bg-[#15161b] p-4 rounded-2xl border border-white/5 relative z-10">
                    <Loader2 className="w-6 h-6 text-[#4da3ff] animate-spin" />
                  </div>
                </div>
                <h3 className="text-[#f5f5f7] font-medium mb-2">Analyzing Image</h3>
                <p className="text-[#9aa0aa] text-sm text-center">Identifying text and formatting...</p>
              </motion.div>
            )}

            {/* DONE STATE - Result Editor */}
            {status === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {/* Small preview of original image */}
                <div className="flex items-center gap-3 bg-[#1c1d23] p-2 pr-4 rounded-2xl border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0b0b0f] flex-shrink-0">
                    <img src={imageSrc!} className="w-full h-full object-cover opacity-80" alt="Thumbnail" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f5f5f7] text-sm font-medium truncate">Extracted Note</p>
                    <p className="text-[#9aa0aa] text-xs truncate">Ready to edit</p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="text-xs font-medium text-[#4da3ff] hover:text-[#4da3ff]/80 transition-colors px-2 py-1"
                  >
                    Start over
                  </button>
                </div>

                {/* Editor Area */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-[#4da3ff]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" />
                  <div className="relative bg-[#1c1d23] border border-white/5 rounded-3xl p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <textarea 
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder="Start typing your note..."
                      className="w-full h-64 bg-transparent p-5 text-[#f5f5f7] text-[15px] leading-relaxed focus:outline-none resize-none placeholder:text-[#9aa0aa]/50 custom-scrollbar"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-[#15161b] rounded-xl text-[#f5f5f7] hover:bg-white/[0.04] transition-all border border-white/5 shadow-sm font-medium text-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#9aa0aa]" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Action Button */}
          {status === 'ready' && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleExtract}
              className="w-full bg-[#4da3ff] text-[#0b0b0f] py-4 rounded-2xl font-medium text-[15px] hover:bg-[#4da3ff]/90 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(77,163,255,0.25)] flex items-center justify-center gap-2"
            >
              Extract Text
            </motion.button>
          )}

        </div>
      </motion.div>

      {/* Global styles for custom scrollbar to match the design */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 2px solid #1c1d23;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
