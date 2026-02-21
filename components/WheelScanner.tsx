
import React, { useState, useEffect } from 'react';
import { WheelConfig, WheelBrand } from '../types';

interface WheelScannerProps {
  availableWheelConfigs: WheelConfig[];
  onSelect: (wheel: WheelConfig) => void;
  onClose: () => void;
}

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number;
  config?: WheelConfig;
}

const WheelScanner: React.FC<WheelScannerProps> = ({ availableWheelConfigs, onSelect, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [foundDevices, setFoundDevices] = useState<DiscoveredDevice[]>([]);

  useEffect(() => {
    // Simulating Bluetooth discovery logic
    // In a real Web Bluetooth implementation, we would use navigator.bluetooth.requestDevice()
    const scanForDevices = () => {
      setIsScanning(true);
      
      // Simulate discovering devices with a delay
      setTimeout(() => {
        const simulatedDiscovery: DiscoveredDevice[] = [
          { 
            id: 'ble-inm-v14-001', 
            name: 'Inmotion_V14_7829', 
            rssi: -54,
            config: availableWheelConfigs.find(w => w.id === 'in-v14')
          },
          { 
            id: 'ble-lk-shl-002', 
            name: 'Sherman-L-B7', 
            rssi: -62,
            config: availableWheelConfigs.find(w => w.id === 'lk-sherman-l')
          }
        ];
        
        setFoundDevices(simulatedDiscovery);
        setIsScanning(false);
      }, 2500);
    };

    scanForDevices();
  }, [availableWheelConfigs]);

  const handleDeviceSelect = (device: DiscoveredDevice) => {
    if (device.config) {
      onSelect(device.config);
    } else {
      // Fallback for unknown brand detection based on name string
      const name = device.name.toLowerCase();
      let brand: WheelBrand = 'Begode';
      if (name.includes('inmotion') || name.includes('v')) brand = 'Inmotion';
      if (name.includes('sherman') || name.includes('lk') || name.includes('lynx')) brand = 'Leaperkim';
      if (name.includes('ks') || name.includes('king')) brand = 'Kingsong';

      onSelect({
        id: device.id,
        brand: brand,
        model: device.name,
        maxVoltage: 100, // Generic fallback
        minVoltage: 70,
        series: 24,
        topSpeed: 50,
        batteryCapacity: 1000
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden relative">
        {/* Radar Animation for Background */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-strava-orange rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-strava-orange rounded-full animate-ping [animation-delay:0.5s]"></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Nearby Wheels</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {isScanning ? 'Searching BLE Spectrum...' : `${foundDevices.length} Devices Found`}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-3 relative z-10">
          {isScanning ? (
            <div className="py-12 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-strava-orange/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-strava-orange rounded-full flex items-center justify-center text-white text-xl">
                  <i className="fa-solid fa-bluetooth animate-bounce"></i>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 italic">Waiting for wheel signal...</p>
            </div>
          ) : (
            foundDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleDeviceSelect(device)}
                className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-orange-50 hover:border-strava-orange transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-strava-orange group-hover:bg-strava-orange group-hover:text-white transition-colors">
                    <i className="fa-solid fa-bolt text-lg"></i>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                      {device.config?.brand || 'Unknown Device'} • {device.rssi}dBm
                    </div>
                    <div className="text-base font-black text-gray-900 group-hover:text-strava-orange transition-colors">
                      {device.name}
                    </div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-300 group-hover:translate-x-1 transition-all"></i>
              </button>
            ))
          )}

          {!isScanning && foundDevices.length === 0 && (
            <div className="py-10 text-center">
              <i className="fa-solid fa-signal-slash text-4xl text-gray-200 mb-4"></i>
              <p className="text-gray-500 font-bold">No wheels detected.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-strava-orange font-black uppercase text-xs tracking-widest hover:underline"
              >
                Retry Scan
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <i className="fa-solid fa-shield-halved"></i>
          <span>Encrypted Connection Secure</span>
        </div>
      </div>
    </div>
  );
};

export default WheelScanner;
