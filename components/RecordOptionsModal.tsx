
import React, { useLayoutEffect, useRef } from 'react';
import { Route } from '../types';
import gsap from 'gsap';

interface RecordOptionsModalProps {
  onClose: () => void;
  onStartNormal: () => void;
  onStartGpx: (route: Route) => void;
}

const DUMMY_ROUTES: Route[] = [
  { id: '1', name: 'Coastal Trail', distance: '12.4 km', difficulty: 'Moderate', coordinates: [] },
  { id: '2', name: 'Mountain Loop', distance: '24.1 km', difficulty: 'Hard', coordinates: [] },
  { id: '3', name: 'City Sprint', distance: '5.2 km', difficulty: 'Easy', coordinates: [] },
];

const RecordOptionsModal: React.FC<RecordOptionsModalProps> = ({ onClose, onStartNormal, onStartGpx }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modalRef.current, { y: '100%' }, { y: '0%', duration: 0.4, ease: "power3.out" });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div 
        ref={bgRef} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div 
        ref={modalRef} 
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 shadow-2xl pb-12"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <h2 className="text-2xl font-black mb-2">Record Activity</h2>
        <p className="text-gray-500 mb-8 font-medium">Choose how you want to track your ride.</p>

        <div className="space-y-4">
          <button 
            onClick={onStartNormal}
            className="w-full bg-strava-orange text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-4 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
          >
            <i className="fa-solid fa-bolt text-xl"></i>
            <div>
              <div className="text-lg">Free Ride</div>
              <div className="text-xs opacity-80 font-medium">Standard telemetry tracking</div>
            </div>
          </button>

          <div className="pt-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Follow Route (GPX)</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {DUMMY_ROUTES.map(route => (
                <button 
                  key={route.id}
                  onClick={() => onStartGpx(route)}
                  className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-strava-orange hover:bg-orange-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-strava-orange transition-colors">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{route.name}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase">{route.distance} • {route.difficulty}</div>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-200 group-hover:text-strava-orange"></i>
                </button>
              ))}
              <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <i className="fa-solid fa-file-import"></i>
                Import GPX File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordOptionsModal;
