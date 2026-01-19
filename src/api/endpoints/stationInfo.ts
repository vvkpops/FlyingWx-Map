import { aviationWeatherClient } from "../aviationWeatherClient";
import { StationInfoResponse } from "../types/apiResponses";

export interface StationInfoQueryParams {
  ids?: string;
  bbox?: string;
  format?: "raw" | "json" | "geojson" | "xml";
}

export const stationInfoEndpoint = {
  async getStationInfo(params: StationInfoQueryParams = {}): Promise<StationInfoResponse> {
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<StationInfoResponse>("/stationinfo", defaultParams);
  },

  async getStationInfoByBbox(bbox: [number, number, number, number]): Promise<StationInfoResponse> {
    return this.getStationInfo({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },

  async getStationInfoByIds(ids: string | string[]): Promise<StationInfoResponse> {
    const idsString = Array.isArray(ids) ? ids.join(",") : ids;
    return this.getStationInfo({
      ids: idsString,
      format: "geojson",
    });
  },
};