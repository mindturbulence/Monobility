
import React, { useLayoutEffect, useRef, useState } from 'react';
import { TelemetryData, WheelConfig, RideMode } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

interface DashboardProps {
  telemetry: TelemetryData;
  history: TelemetryData[];
  wheel: WheelConfig;
  isHud: boolean;
  onToggleHud: () => void;
  rideMode: RideMode;
  setRideMode: (mode: RideMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ telemetry, history, wheel, isHud, onToggleHud, rideMode, setRideMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isHud) {
      const cards = containerRef.current?.querySelectorAll('.app-card');
      if (cards) {
        gsap.fromTo(cards, 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
        );
      }
    }
  }, [isHud]);

  if (isHud) {
    return (
      <div onClick={onToggleHud} className="h-screen w-full bg-black flex flex-col items-center justify-center p-10 cursor-pointer">
        <div className="text-strava-orange font-black text-[25vw] leading-none mb-4">
          {Math.round(telemetry.speed)}
        </div>
        <div className="flex justify-between w-full max-w-xl">
          <div className="flex flex-col items-center">
            <span className="text-white text-4xl font-black">{telemetry.battery}%</span>
            <span className="text-gray-500 font-bold uppercase">Battery</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-black ${telemetry.pwm > 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{Math.round(telemetry.pwm)}%</span>
            <span className="text-gray-500 font-bold uppercase">PWM</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-4xl font-black">{Math.round(telemetry.power)}W</span>
            <span className="text-gray-500 font-bold uppercase">Power</span>
          </div>
        </div>
        <div className="mt-12 text-gray-700 text-sm font-bold animate-pulse">TAP TO EXIT HUD</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* High-Utility Main Speed Card */}
      <div className="app-card p-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{wheel.model} Online</span>
            <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${telemetry.pwm > 80 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Live BLE</span>
            </div>
        </div>
        <div className="text-8xl font-black tracking-tighter text-gray-900 mb-2">
            {Math.round(telemetry.speed)}
            <span className="text-2xl ml-1 text-gray-300 font-bold">km/h</span>
        </div>
        
        {/* Progress Bar for PWM/Load */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div 
                className={`h-full transition-all duration-300 ${telemetry.pwm > 80 ? 'bg-red-500' : 'bg-strava-orange'}`}
                style={{ width: `${telemetry.pwm}%` }}
            ></div>
        </div>

        <div className="grid grid-cols-4 w-full gap-2">
            <MiniMetric label="PWM" value={`${Math.round(telemetry.pwm)}%`} />
            <MiniMetric label="Voltage" value={`${telemetry.voltage.toFixed(1)}V`} />
            <MiniMetric label="Current" value={`${telemetry.current.toFixed(1)}A`} />
            <MiniMetric label="Temp" value={`${telemetry.temperature}°C`} />
        </div>
      </div>

      {/* Wheel Command Center (DarknessBot style) */}
      <div className="app-card p-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Command Center</h4>
        <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-lightbulb text-strava-orange"></i>
                    <span className="text-xs font-bold">Wheel Lights</span>
                </div>
                <div className="w-8 h-4 bg-strava-orange rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
            </button>
            <button 
                onClick={() => {
                    const modes: RideMode[] = ['Soft', 'Medium', 'Hard'];
                    const next = modes[(modes.indexOf(rideMode) + 1) % 3];
                    setRideMode(next);
                }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-bolt text-strava-orange"></i>
                    <span className="text-xs font-bold">Mode</span>
                </div>
                <span className="text-xs font-black strava-orange uppercase">{rideMode}</span>
            </button>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="app-card p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Power vs PWM</span>
            <i className="fa-solid fa-chart-line text-gray-300 text-xs"></i>
        </div>
        <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.slice(-50)}>
                    <defs>
                        <linearGradient id="colorPwm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FC4C02" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#FC4C02" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="pwm" stroke="#FC4C02" fill="url(#colorPwm)" strokeWidth={3} isAnimationActive={false} />
                    <Area type="monotone" dataKey="power" stroke="#2D2D2D" fill="transparent" strokeWidth={1} strokeDasharray="5 5" opacity={0.3} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Safety Diagnostics Card */}
      <div className="app-card p-5 border-l-4 border-l-strava-orange flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-strava-orange text-xl"></i>
        </div>
        <div>
            <h4 className="text-sm font-bold">Safety Engine Active</h4>
            <p className="text-xs text-gray-500 leading-tight mt-1">
                Temperature is stable. PWM overhead is currently {Math.round(100 - telemetry.pwm)}%. Tilt-back ready at 65km/h.
            </p>
        </div>
      </div>
    </div>
  );
};

const MiniMetric: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 border border-gray-100">
        <span className="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">{label}</span>
        <span className="text-xs font-black text-gray-800 leading-none">{value}</span>
    </div>
);

export default Dashboard;
