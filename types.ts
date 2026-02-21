
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TOURS = 'TOURS',
  DIAGNOSTICS = 'DIAGNOSTICS',
  SETTINGS = 'SETTINGS',
  MAP_NAVIGATION = 'MAP_NAVIGATION'
}

export type RideMode = 'Soft' | 'Medium' | 'Hard';
export type WheelBrand = 'Begode' | 'Kingsong' | 'Inmotion' | 'Leaperkim' | 'Extreme Bull';
export type RecordingStatus = 'idle' | 'recording' | 'paused';

export interface WheelConfig {
  id: string;
  brand: WheelBrand;
  model: string;
  maxVoltage: number;
  minVoltage: number;
  series: number;
  topSpeed: number;
  batteryCapacity: number;
}

export interface TelemetryData {
  speed: number;
  battery: number;
  temperature: number;
  power: number;
  voltage: number;
  current: number;
  pwm: number;
  distance: number;
  timestamp: number;
}

export interface Route {
  id: string;
  name: string;
  distance: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  coordinates: { lat: number; lng: number }[];
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: number;
}

export interface Tour {
  id: string;
  name: string;
  date: string;
  durationSeconds: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  energyUsed: number;
  wheelModel: string;
  points: { lat: number; lng: number; speed: number; timestamp: number }[];
  media: MediaItem[];
}
