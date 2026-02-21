
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { AppView, TelemetryData, WheelConfig, RideMode, Route, Tour, RecordingStatus, MediaItem } from './types';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import WheelScanner from './components/WheelScanner';
import RecordOptionsModal from './components/RecordOptionsModal';
import MapView from './components/MapView';
import TourLog from './components/TourLog';
import gsap from 'gsap';

const AVAILABLE_WHEELS: WheelConfig[] = [
  // LEAPERKIM
  { id: 'lk-sherman-l', brand: 'Leaperkim', model: 'Sherman L', maxVoltage: 151.2, minVoltage: 115.0, series: 36, topSpeed: 105, batteryCapacity: 3200 },
  { id: 'lk-lynx', brand: 'Leaperkim', model: 'Lynx', maxVoltage: 151.2, minVoltage: 115.0, series: 36, topSpeed: 95, batteryCapacity: 2700 },
  { id: 'lk-sherman-s', brand: 'Leaperkim', model: 'Sherman S', maxVoltage: 100.8, minVoltage: 72.0, series: 24, topSpeed: 75, batteryCapacity: 3600 },
  
  // INMOTION
  { id: 'in-v14', brand: 'Inmotion', model: 'V14 Adventure (50GB)', maxVoltage: 134.4, minVoltage: 100.0, series: 32, topSpeed: 70, batteryCapacity: 2400 },
  { id: 'in-v13', brand: 'Inmotion', model: 'V13 Challenger', maxVoltage: 126.0, minVoltage: 90.0, series: 30, topSpeed: 90, batteryCapacity: 3024 },
  
  // BEGODE
  { id: 'b-et-max', brand: 'Begode', model: 'ET-Max', maxVoltage: 168.0, minVoltage: 120.0, series: 40, topSpeed: 110, batteryCapacity: 3000 },
  { id: 'b-master-pro', brand: 'Begode', model: 'Master Pro v3', maxVoltage: 134.4, minVoltage: 102.4, series: 32, topSpeed: 95, batteryCapacity: 4800 },
  { id: 'b-blitz', brand: 'Begode', model: 'Blitz', maxVoltage: 134.4, minVoltage: 102.4, series: 32, topSpeed: 85, batteryCapacity: 2400 },
  { id: 'b-master', brand: 'Begode', model: 'Master v4', maxVoltage: 134.4, minVoltage: 102.4, series: 32, topSpeed: 85, batteryCapacity: 2400 },
  
  // KINGSONG
  { id: 'ks-f22', brand: 'Kingsong', model: 'F22', maxVoltage: 126.0, minVoltage: 90.0, series: 30, topSpeed: 80, batteryCapacity: 2400 },
  { id: 'ks-s22', brand: 'Kingsong', model: 'S22 Pro', maxVoltage: 126.0, minVoltage: 90.0, series: 30, topSpeed: 70, batteryCapacity: 2220 },
  
  // BOUTIQUE / EXTREME
  { id: 'nosfet-aero', brand: 'Nosfet', model: 'Aero', maxVoltage: 151.2, minVoltage: 115.0, series: 36, topSpeed: 100, batteryCapacity: 2800 },
  { id: 'apex-custom', brand: 'Apex', model: 'Apex One', maxVoltage: 134.4, minVoltage: 100.0, series: 32, topSpeed: 90, batteryCapacity: 2500 },
  { id: 'aeon-high', brand: 'Aeon', model: 'Aeon Pulse', maxVoltage: 126.0, minVoltage: 90.0, series: 30, topSpeed: 85, batteryCapacity: 2400 },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedWheel, setSelectedWheel] = useState<WheelConfig | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [showRecOptions, setShowRecOptions] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [isHudMode, setIsHudMode] = useState(false);
  const [rideMode, setRideMode] = useState<RideMode>('Hard');
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0, battery: 100, temperature: 28, power: 0, voltage: 0, current: 0, pwm: 0, distance: 0, timestamp: Date.now()
  });
  const [history, setHistory] = useState<TelemetryData[]>([]);
  
  const [currentTour, setCurrentTour] = useState<Partial<Tour> | null>(null);
  const [savedTours, setSavedTours] = useState<Tour[]>([]);
  const [duration, setDuration] = useState(0);

  const viewRef = useRef<HTMLDivElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    if (recordingStatus !== 'idle') requestWakeLock();
    else releaseWakeLock();
    return () => releaseWakeLock();
  }, [recordingStatus]);

  useEffect(() => {
    const localData = localStorage.getItem('monobility_tours');
    if (localData) setSavedTours(JSON.parse(localData));
  }, []);

  useEffect(() => {
    let timer: number;
    if (recordingStatus === 'recording') {
      timer = window.setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [recordingStatus]);

  useLayoutEffect(() => {
    if (viewRef.current) {
      gsap.fromTo(viewRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  }, [view]);

  useEffect(() => {
    if (telemetry.pwm > 80) {
      gsap.to(appContainerRef.current, { backgroundColor: "#ff000033", duration: 0.2, repeat: 3, yoyo: true });
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    }
  }, [telemetry.pwm]);

  useEffect(() => {
    if (!selectedWheel) return;
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const speedDelta = (Math.random() - 0.4) * 6;
        const newSpeed = Math.max(0, Math.min(selectedWheel.topSpeed, prev.speed + speedDelta));
        const powerMultiplier = selectedWheel.series * 12; 
        const power = Math.round(newSpeed * powerMultiplier * (Math.random() * 0.5 + 0.8));
        const pwm = Math.min(100, (newSpeed / selectedWheel.topSpeed) * 85 + (Math.random() * 5));
        
        const newTelemetry = {
          ...prev,
          speed: newSpeed,
          power: power,
          pwm: pwm,
          voltage: selectedWheel.maxVoltage - (prev.distance * 0.25),
          battery: Math.max(0, 100 - (prev.distance * 1.1)),
          distance: prev.distance + (newSpeed / 3600),
          current: Math.max(0, (power / (selectedWheel.maxVoltage - (prev.distance * 0.3)))),
          timestamp: Date.now()
        };
        
        if (recordingStatus === 'recording' && currentTour) {
          setCurrentTour(curr => ({
            ...curr,
            points: [...(curr?.points || []), { 
              lat: 37.7749 + (Math.random() * 0.001), 
              lng: -122.4194 + (Math.random() * 0.001), 
              speed: newSpeed, 
              timestamp: Date.now() 
            }]
          }));
        }
        setHistory(h => [...h.slice(-100), newTelemetry]);
        return newTelemetry;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedWheel, recordingStatus, currentTour]);

  const handleRecClick = () => {
    if (recordingStatus !== 'idle') setView(AppView.MAP_NAVIGATION);
    else setShowRecOptions(true);
  };

  const startRide = (route: Route | null = null) => {
    setRecordingStatus('recording');
    setDuration(0);
    setCurrentTour({
      id: Date.now().toString(),
      name: route ? `Ride: ${route.name}` : `Session ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      date: new Date().toLocaleDateString(),
      points: [],
      media: [],
      wheelModel: selectedWheel?.model || 'Unknown',
      distance: 0
    });
    setActiveRoute(route);
    setShowRecOptions(false);
    setView(AppView.MAP_NAVIGATION);
  };

  const finishRide = () => {
    if (!currentTour) return;
    const finalTour: Tour = {
      ...currentTour as Tour,
      durationSeconds: duration,
      distance: telemetry.distance,
      avgSpeed: 28.5,
      maxSpeed: 52.0,
      energyUsed: 620,
    };
    const updatedTours = [finalTour, ...savedTours];
    setSavedTours(updatedTours);
    localStorage.setItem('monobility_tours', JSON.stringify(updatedTours));
    setRecordingStatus('idle');
    setCurrentTour(null);
    setDuration(0);
    setActiveRoute(null);
    setView(AppView.TOURS);
  };

  const toggleHud = () => setIsHudMode(!isHudMode);

  if (!selectedWheel) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-strava-orange rounded-full flex items-center justify-center mb-8 shadow-xl">
            <i className="fa-solid fa-bolt text-white text-4xl"></i>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">monobility</h1>
        <p className="text-gray-500 mb-12 text-center font-medium">Professional EUC Telemetry Dashboard.</p>
        <button 
          onClick={() => setIsScanning(true)}
          className="w-full max-w-xs bg-strava-orange hover:bg-[#E34402] text-white font-bold py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-bluetooth"></i>
          Register Your Wheel
        </button>
        {isScanning && (
          <WheelScanner 
            availableWheelConfigs={AVAILABLE_WHEELS} 
            onSelect={(w) => { setSelectedWheel(w); setIsScanning(false); }} 
            onClose={() => setIsScanning(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={appContainerRef} className={`flex flex-col h-screen w-full relative overflow-hidden transition-colors duration-500 ${isHudMode ? 'bg-black' : 'bg-[#F7F7F7]'}`}>
      {!isHudMode && (
        <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 pt-safe">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-strava-orange font-black text-2xl italic tracking-tighter">monobility</span>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={toggleHud} className="bg-gray-100 p-2 rounded-lg text-gray-600 active:text-strava-orange">
                  <i className="fa-solid fa-expand"></i>
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <i className="fa-solid fa-user text-gray-400"></i>
                </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto w-full no-scrollbar ${isHudMode ? 'p-0' : 'pb-32'}`}>
        <div ref={viewRef} className={`mx-auto w-full ${isHudMode ? 'max-w-none h-full' : (view === AppView.MAP_NAVIGATION ? 'max-w-none' : 'max-w-3xl px-4 pt-6')}`}>
          {view === AppView.DASHBOARD && (
            <Dashboard 
              telemetry={telemetry} 
              history={history} 
              wheel={selectedWheel} 
              isHud={isHudMode} 
              onToggleHud={toggleHud}
              rideMode={rideMode}
              setRideMode={setRideMode}
            />
          )}
          {view === AppView.MAP_NAVIGATION && (
            <MapView 
              activeRoute={activeRoute} 
              telemetry={telemetry} 
              recordingStatus={recordingStatus}
              duration={duration}
              onPause={() => setRecordingStatus('paused')}
              onResume={() => setRecordingStatus('recording')}
              onFinish={finishRide}
              onAddMedia={(type) => {
                if (!currentTour) return;
                const newItem: MediaItem = { id: Date.now().toString(), type, url: 'https://images.unsplash.com/photo-1558981403-c5f91ad9316b?auto=format&fit=crop&q=80&w=400', timestamp: Date.now() };
                setCurrentTour(curr => ({ ...curr, media: [...(curr?.media || []), newItem] }));
                if ('vibrate' in navigator) navigator.vibrate(50);
              }}
              currentTour={currentTour as Tour}
            />
          )}
          {view === AppView.DIAGNOSTICS && <AIAssistant telemetry={telemetry} wheel={selectedWheel} />}
          {view === AppView.TOURS && <TourLog tours={savedTours} />}
          {view === AppView.SETTINGS && (
            <div className="space-y-4 px-4 pb-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-widest">Safety & Calibration</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">Tilt-back speed</span>
                        <div className="flex items-center gap-3">
                            <span className="text-strava-orange font-black">75 km/h</span>
                            <i className="fa-solid fa-chevron-right text-gray-300"></i>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">System Voltage</span>
                        <span className="text-gray-400 font-bold">{selectedWheel.maxVoltage}V ({selectedWheel.series}S)</span>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {!isHudMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 pb-8 pt-2">
          <nav className="max-w-lg mx-auto flex justify-between items-end relative">
            <NavButton active={view === AppView.DASHBOARD} onClick={() => setView(AppView.DASHBOARD)} icon="fa-gauge-high" label="Dash" />
            <NavButton active={view === AppView.TOURS} onClick={() => setView(AppView.TOURS)} icon="fa-chart-area" label="Log" />
            <div className="flex flex-col items-center -mt-8">
              <button 
                  onClick={handleRecClick}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-50 transition-all border-4 border-white active:scale-90 ${
                      recordingStatus !== 'idle' ? 'bg-red-600' : 'bg-strava-orange'
                  }`}
              >
                  <i className={`fa-solid ${recordingStatus !== 'idle' ? 'fa-stop' : 'fa-play'} text-white text-2xl ml-0.5`}></i>
              </button>
              <span className="text-[10px] font-black mt-1 text-gray-500 uppercase tracking-tighter">Record</span>
            </div>
            <NavButton active={view === AppView.DIAGNOSTICS} onClick={() => setView(AppView.DIAGNOSTICS)} icon="fa-wand-magic-sparkles" label="Expert" />
            <NavButton active={view === AppView.SETTINGS} onClick={() => setView(AppView.SETTINGS)} icon="fa-sliders" label="Set" />
          </nav>
        </div>
      )}

      {showRecOptions && (
        <RecordOptionsModal 
          onClose={() => setShowRecOptions(false)}
          onStartNormal={() => startRide()}
          onStartGpx={(route) => startRide(route)}
        />
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-strava-orange' : 'text-gray-400'}`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
        <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
);

export default App;
