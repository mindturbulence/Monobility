
import React from 'react';
import { Tour } from '../types';

interface TourLogProps {
  tours: Tour[];
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const TourLog: React.FC<TourLogProps> = ({ tours }) => {
  if (tours.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 mx-4">
          <i className="fa-solid fa-file-export text-5xl text-gray-200 mb-6"></i>
          <h2 className="text-xl font-bold text-gray-800">Your Activity Log</h2>
          <p className="text-gray-500 mt-2">Start recording your first trip to build your monobility history.</p>
      </div>
    );
  }

  const exportGPX = (tour: Tour) => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="monobility">
  <trk><name>${tour.name}</name><trkseg>
    ${tour.points.map(p => `<trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.timestamp).toISOString()}</time></trkpt>`).join('')}
  </trkseg></trk>
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tour.name.replace(/\s+/g, '_')}.gpx`;
    a.click();
  };

  return (
    <div className="space-y-4 pb-12 px-4">
      <h2 className="text-2xl font-black mb-4">Activity Log</h2>
      {tours.map(tour => (
        <div key={tour.id} className="app-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{tour.name}</h3>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">
                {tour.date} • {tour.wheelModel}
              </p>
            </div>
            <button onClick={() => exportGPX(tour)} className="text-strava-orange text-xs font-bold hover:underline">
              <i className="fa-solid fa-file-arrow-down mr-1"></i> GPX
            </button>
          </div>
          
          <div className="grid grid-cols-3 divide-x divide-gray-100 py-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{tour.distance.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Km</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{formatDuration(tour.durationSeconds)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Time</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{tour.media.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Media</span>
            </div>
          </div>

          {tour.media.length > 0 && (
            <div className="px-4 pb-4 flex gap-2 overflow-x-auto custom-scrollbar">
              {tour.media.map(item => (
                <div key={item.id} className="flex-shrink-0 w-24 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                  <img src={item.url} className="w-full h-full object-cover" alt="Trip moment" />
                  {item.type === 'video' && <i className="fa-solid fa-play absolute inset-0 flex items-center justify-center text-white text-xs drop-shadow-md"></i>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TourLog;
