'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import exifr from 'exifr';
import { PDFDocument } from 'pdf-lib';

export default function Home() {
  const [mode, setMode] = useState<'IMAGE' | 'VIDEO' | 'PDF'>('IMAGE');
  const [status, setStatus] = useState("SYSTEM IDLE");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [leakData, setLeakData] = useState<{ type: string; info: string } | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);

  // --- 1. LOAD VIDEO ENGINE ---
  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg();
      try {
        await ffmpegRef.current.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setEngineLoaded(true);
      } catch (e) { console.error(e); }
    };
    loadFFmpeg();
  }, []);

  // --- 2. IMAGE LOGIC ---
  const processImage = async (file: File) => {
    setIsProcessing(true); setDownloadUrl(null); setLeakData(null);
    setStatus(`SCANNING IMAGE: ${file.name.toUpperCase()}...`);
    
    try {
      const data = await exifr.parse(file);
      if (data && (data.Make || data.latitude)) {
        setLeakData({
          type: 'EXIF DATA',
          info: `${data.Make || ''} ${data.Model || ''} ${data.latitude ? '(GPS FOUND)' : ''}`
        });
        setStatus("⚠️ IMAGE PRIVACY LEAK DETECTED.");
      }
    } catch (e) {}

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setDownloadUrl(URL.createObjectURL(blob));
            setIsProcessing(false);
            if (!leakData) setStatus("OPERATIONAL: IMAGE SECURED.");
          }
        }, file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- 3. VIDEO LOGIC ---
  const processVideo = async (file: File) => {
    if (!engineLoaded) return setStatus("ERROR: VIDEO ENGINE LOADING...");
    setIsProcessing(true); setLeakData(null); setDownloadUrl(null);
    setStatus(`INGESTING VIDEO STREAM...`);
    
    try {
      const ffmpeg = ffmpegRef.current!;
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      setStatus("SCRUBBING METADATA TRACKS...");
      await ffmpeg.exec(['-i', 'input.mp4', '-map_metadata', '-1', '-c', 'copy', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      
      // FIX: Added 'as any' to fix the Uint8Array error
      setDownloadUrl(URL.createObjectURL(new Blob([(data as Uint8Array).buffer as any], { type: 'video/mp4' })));
      setStatus("OPERATIONAL: VIDEO SECURED.");
    } catch (e) { setStatus("ERROR: PROCESS FAILED."); }
    setIsProcessing(false);
  };

  // --- 4. PDF LOGIC ---
  const processPdf = async (file: File) => {
    setIsProcessing(true); setDownloadUrl(null); setLeakData(null);
    setStatus(`ANALYZING PDF STRUCTURE...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      
      if (title || author) {
        setLeakData({
          type: 'METADATA FOUND',
          info: `Author: ${author || 'N/A'}`
        });
        setStatus("⚠️ PDF METADATA FOUND. WIPING...");
      } else {
        setStatus("PDF CLEAN. RE-SAVING FOR SAFETY...");
      }

      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setCreator('');

      const pdfBytes = await pdfDoc.save();
      // FIX: Added 'as any' to fix the Blob error
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      setDownloadUrl(URL.createObjectURL(blob));
      if (!leakData) setStatus("OPERATIONAL: PDF SECURED.");
    } catch (e) {
      setStatus("ERROR: COULD NOT PARSE PDF.");
    }
    setIsProcessing(false);
  };

  // --- UI ---
  const handleFile = (file: File) => {
    if (mode === 'IMAGE' && file.type.startsWith('image/')) processImage(file);
    else if (mode === 'VIDEO' && file.type.startsWith('video/')) processVideo(file);
    else if (mode === 'PDF' && file.type === 'application/pdf') processPdf(file);
    else setStatus(`ERROR: INVALID FILE TYPE FOR ${mode} MODE.`);
  };

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
        GHOST<span className="text-green-600">FILES</span>
      </h1>
      <p className="text-xs text-neutral-500 tracking-[0.3em] mb-12">DECENTRALIZED PRIVACY PROTOCOL</p>

      <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
        {['IMAGE', 'VIDEO', 'PDF'].map((m) => (
          <button 
            key={m}
            onClick={() => { setMode(m as any); setStatus("SYSTEM IDLE"); setDownloadUrl(null); setLeakData(null); }}
            className={`pb-1 border-b-2 transition-all ${mode === m ? 'border-green-500 text-white' : 'border-transparent text-neutral-600 hover:text-green-500'}`}
          >
            {m}_MODE {m === 'VIDEO' ? (engineLoaded ? '●' : '○') : ''}
          </button>
        ))}
      </div>

      {leakData && (
        <div className="w-full max-w-lg mb-6 border border-red-600 bg-red-900/10 p-4 rounded text-red-500 text-xs animate-pulse">
          <p className="font-bold mb-1">⚠️ {leakData.type}</p>
          <p>{'>'} {leakData.info}</p>
        </div>
      )}

      <div className={`relative w-full max-w-lg border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center transition-all ${
        isProcessing ? 'border-yellow-600 bg-yellow-900/10' : 'border-neutral-800 hover:border-green-600 hover:bg-neutral-900'
      }`}>
        <input 
          type="file" 
          accept={mode === 'IMAGE' ? "image/*" : mode === 'VIDEO' ? "video/mp4" : "application/pdf"}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {isProcessing ? <div className="animate-spin text-4xl mb-4">⚙️</div> : <div className="text-4xl mb-4 text-neutral-700">{mode === 'IMAGE' ? '📸' : mode === 'VIDEO' ? '📼' : '📄'}</div>}
        <p className="text-sm font-bold tracking-widest text-neutral-400">{isProcessing ? 'PROCESSING...' : `DROP ${mode} FILE`}</p>
      </div>

      <div className="w-full max-w-lg mt-6 font-mono text-xs text-neutral-500">
        <p>{'>'} STATUS: <span className={leakData ? "text-red-500" : "text-green-500"}>{status}</span></p>
      </div>

      {downloadUrl && (
        <a 
          href={downloadUrl} 
          download={`ghost_clean.${mode === 'IMAGE' ? 'png' : mode === 'VIDEO' ? 'mp4' : 'pdf'}`}
          className="mt-8 px-8 py-3 bg-green-600 text-black font-bold tracking-wider hover:bg-green-500 rounded transition-all"
        >
          DOWNLOAD_CLEAN_{mode}
        </a>
      )}
    </main>
  );
}