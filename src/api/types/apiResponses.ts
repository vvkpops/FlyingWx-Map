// API Response Types based on AviationWeather.gov API

export interface NavaidProperties {
  id: string;
  ident: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  elev?: number;
  freq?: string;
  usage?: string;
  power?: string;
  channel?: string;
}

export interface NavaidFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: NavaidProperties;
}

export interface NavaidResponse {
  type: "FeatureCollection";
  features: NavaidFeature[];
}

export interface AirportProperties {
  icaoId: string;
  iataId?: string;
  faaId?: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
  site?: string;
  type?: string;
}

export interface AirportFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: AirportProperties;
}

export interface AirportResponse {
  type: "FeatureCollection";
  features: AirportFeature[];
}

export interface FixProperties {
  id: string;
  ident: string;
  lat: number;
  lon: number;
  airport?: string;
  type?: string;
}

export interface FixFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: FixProperties;
}

export interface FixResponse {
  type: "FeatureCollection";
  features: FixFeature[];
}

export interface ObstacleProperties {
  id: string;
  type: string;
  lat: number;
  lon: number;
  amsl?: number;
  agl?: number;
  lighted?: boolean;
  marking?: string;
}

export interface ObstacleFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: ObstacleProperties;
}

export interface ObstacleResponse {
  type: "FeatureCollection";
  features: ObstacleFeature[];
}

export interface StationInfoProperties {
  icaoId: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
  site?: string;
  state?: string;
  country?: string;
}

export interface StationInfoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: StationInfoProperties;
}

export interface StationInfoResponse {
  type: "FeatureCollection";
  features: StationInfoFeature[];
}

export interface FeatureProperties {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
}

export interface FeatureFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: FeatureProperties;
}

export interface FeatureResponse {
  type: "FeatureCollection";
  features: FeatureFeature[];
}
