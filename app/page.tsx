'use client';

import React, { useState } from 'react';
import { ShieldAlert, Upload, Search, MapPin, Tablet, X, Download, ShieldCheck } from 'lucide-react';
import EXIF from 'exif-js';

export default function GhostFiles() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);

  const extractMetadata = (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = function() {
        // @ts-ignore
        EXIF.getData(img, function() {
          // @ts-ignore
          const allTags = EXIF.getAllTags(this);
          setMetadata(allTags);
          setIsAnalyzing(false);
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const performSurgery = () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCleanedUrl(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <nav className="flex justify-between items-center max-w-5xl mx-auto mb-16">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <ShieldAlert className="text-emerald-500" />
          <span>GHOST<span className="text-emerald-500 text-2xl font-black">FILES</span></span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono border border-slate-800 px-2 py-1 rounded">
          STATUS: LOCAL_SECURE
        </div>
      </nav>

      <main className="max-w-xl mx-auto">
        {!selectedFile ? (
          <div className="text-center">
            <h1 className="text-5xl font-black mb-6 leading-tight">Your privacy is <span className="text-emerald-500">leaking.</span></h1>
            <div className="border-2 border-dashed border-slate-800 rounded-3xl p-16 bg-slate-900/20 hover:border-emerald-500/50 transition-all cursor-pointer relative group">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setSelectedFile(file); extractMetadata(file); }
                }} accept="image/jpeg" 
              />
              <Upload className="mx-auto text-slate-600 group-hover:text-emerald-400 mb-4 transition-colors" size={48} />
              <p className="text-slate-300 font-medium tracking-tight">Drop an image to scan for traces</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-emerald-500">
                <Search size={16} /> Forensic Analysis
              </h2>
              <button onClick={() => {setSelectedFile(null); setMetadata(null); setCleanedUrl(null);}} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 text-center animate-pulse text-slate-500 font-mono italic text-xs">Reading file headers...</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <Tablet size={20} className="text-blue-400" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Device Profile</p>
                    <p className="text-sm text-slate-200">{metadata?.Make || "Unknown"} {metadata?.Model || ""}</p>
                  </div>
                </div>

                <div className="bg-black/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <MapPin size={20} className={metadata?.GPSLatitude ? "text-red-400" : "text-emerald-400"} />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Location Trace</p>
                    <p className="text-sm text-slate-200">{metadata?.GPSLatitude ? "GPS Found" : "No GPS Detected"}</p>
                  </div>
                </div>

                {!cleanedUrl ? (
                  <button onClick={performSurgery} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm">
                    Perform Surgery
                  </button>
                ) : (
                  <a href={cleanedUrl} download={`ghosted_${selectedFile.name}`} className="w-full mt-6 bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2">
                    <Download size={18} /> Download Cleaned File
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}