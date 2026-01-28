
import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, ScanLine } from 'lucide-react';
import { parseReceiptImage } from '../services/geminiService';
import { SmartParseResult } from '../types';

interface OpticalIngestProps {
  onScanComplete: (result: SmartParseResult) => void;
}

const OpticalIngest: React.FC<OpticalIngestProps> = ({ onScanComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsScanning(true);
      
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove header
          
          const result = await parseReceiptImage(base64Data);
          if (result) {
              onScanComplete(result);
          } else {
              alert("OPTICAL SCAN FAILED: UNREADABLE.");
          }
          setIsScanning(false);
      };
      reader.onerror = () => setIsScanning(false);
      
      // Reset input
      e.target.value = '';
  };

  return (
    <>
        <button 
            type="button"
            disabled={isScanning}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-14 md:w-16 border border-y2k-green flex items-center justify-center bg-black text-y2k-green hover:bg-y2k-green hover:text-black transition-all hover:shadow-[0_0_10px_#39ff14] disabled:opacity-50 group"
            title="Optical_Ingest (Receipt Scan)"
        >
            {isScanning ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                <Camera className="w-6 h-6" />
            )}
            {/* Scan line effect */}
            {isScanning && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="w-full h-1 bg-y2k-pink absolute top-0 animate-scan shadow-[0_0_5px_#ff00ff]"></div>
                </div>
            )}
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFile} 
            accept="image/*" 
            className="hidden"
        />
    </>
  );
};

export default OpticalIngest;
