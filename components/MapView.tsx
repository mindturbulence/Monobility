
import React, { useEffect, useState } from 'react';
import { Route, TelemetryData, RecordingStatus, Tour } from '../types';

interface MapViewProps {
  activeRoute: Route | null;
  telemetry: TelemetryData;
  recordingStatus: RecordingStatus;
  duration: number;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onAddMedia: (type: 'photo' | 'video') => void;
  currentTour: Tour | null;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v < 10 ? '0' + v : v).filter((v, i) => v !== '00' || i > 0).join(':');
};

const MapView: React.FC<MapViewProps> = ({ 
  activeRoute, 
  telemetry, 
  recordingStatus, 
  duration, 
  onPause, 
  onResume, 
  onFinish, 
  onAddMedia,
  currentTour
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 bg-[#e5e3df] flex items-center justify-center">
        {!mapLoaded ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-strava-orange/20 border-t-strava-orange rounded-full animate-spin mb-4"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Maps...</span>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i15!2i5245!3i12656!2m3!1e0!2sm!3i637042531!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2!23i1301875')] bg-cover" />
            <svg className="absolute inset-0 w-full h-full">
              <path d="M 50,200 Q 150,150 250,200 T 450,200" fill="none" stroke="#FC4C02" strokeWidth="6" strokeLinecap="round" className="opacity-80" />
              <circle cx="50" cy="200" r="10" fill="#FC4C02" />
              <circle cx="150" cy="175" r="8" fill="#3B82F6" className="animate-pulse" />
            </svg>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="app-card p-4 pointer-events-auto border-l-4 border-l-strava-orange shadow-lg">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {recordingStatus === 'paused' ? 'Recording Paused' : 'Live Trip'}
          </div>
          <div className="text-2xl font-black text-gray-900 tabular-nums">{formatTime(duration)}</div>
          <div className="text-[10px] font-bold text-strava-orange uppercase">{activeRoute?.name || 'Free Tracking'}</div>
        </div>

        <button className="w-12 h-12 rounded-xl bg-white shadow-lg pointer-events-auto flex items-center justify-center text-gray-700">
          <i className="fa-solid fa-location-crosshairs text-xl"></i>
        </button>
      </div>

      {/* Recording Controls Overlay */}
      <div className="absolute bottom-24 left-4 right-4 flex justify-center gap-4 pointer-events-none">
        {recordingStatus === 'recording' && (
          <button onClick={onPause} className="pointer-events-auto w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 active:scale-90 transition-transform">
            <i className="fa-solid fa-pause text-xl"></i>
          </button>
        )}
        {recordingStatus === 'paused' && (
          <>
            <button onClick={onResume} className="pointer-events-auto w-14 h-14 bg-strava-orange rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform">
              <i className="fa-solid fa-play text-xl ml-1"></i>
            </button>
            <button onClick={() => onAddMedia('photo')} className="pointer-events-auto w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 active:scale-90 transition-transform">
              <i className="fa-solid fa-camera text-xl"></i>
            </button>
            <button onClick={onFinish} className="pointer-events-auto w-14 h-14 bg-red-600 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform">
              <i className="fa-solid fa-square text-xl"></i>
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-6 left-4 right-4 grid grid-cols-3 gap-3 pointer-events-none">
        <MetricOverlay label="Speed" value={Math.round(telemetry.speed)} unit="km/h" />
        <MetricOverlay label="PWM" value={Math.round(telemetry.pwm)} unit="%" alert={telemetry.pwm > 80} />
        <MetricOverlay label="Photos" value={currentTour?.media?.length || 0} unit="pics" />
      </div>
    </div>
  );
};

const MetricOverlay: React.FC<{ label: string, value: string | number, unit: string, alert?: boolean }> = ({ label, value, unit, alert }) => (
  <div className={`app-card p-3 pointer-events-auto flex flex-col items-center justify-center backdrop-blur-md bg-white/90 border transition-colors ${alert ? 'border-red-500 bg-red-50' : 'border-white/50'}`}>
    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
    <div className="flex items-baseline gap-0.5">
      <span className={`text-xl font-black ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase">{unit}</span>
    </div>
  </div>
);

export default MapView;
