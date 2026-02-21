
import React, { useState, useEffect } from 'react';
import { WheelConfig } from '../types';

interface WheelScannerProps {
  wheels: WheelConfig[];
  onSelect: (wheel: WheelConfig) => void;
  onClose: () => void;
}

const WheelScanner: React.FC<WheelScannerProps> = ({ wheels, onSelect, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black">Register Device</h2>
            <button onClick={onClose} className="text-gray-400">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        {isScanning ? (
            <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-4 border-strava-orange/20 border-t-strava-orange rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Searching BLE...</p>
            </div>
        ) : (
            <div className="space-y-3">
                {wheels.map(wheel => (
                    <button 
                        key={wheel.id}
                        onClick={() => onSelect(wheel)}
                        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-strava-orange transition-colors group flex justify-between items-center bg-gray-50/50"
                    >
                        <div>
                            <div className="text-[10px] font-black text-strava-orange uppercase tracking-tight">{wheel.brand}</div>
                            <div className="text-lg font-black text-gray-900">{wheel.model}</div>
                        </div>
                        <i className="fa-solid fa-plus text-gray-300 group-hover:text-strava-orange"></i>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default WheelScanner;
