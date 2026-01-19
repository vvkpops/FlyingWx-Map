import { aviationWeatherClient } from "../aviationWeatherClient";
import { AirportResponse } from "../types/apiResponses";

export interface AirportQueryParams {
  ids?: string;
  bbox?: string;
  format?: "raw" | "json" | "geojson" | "xml";
}

export const airportEndpoint = {
  async getAirports(params: AirportQueryParams = {}): Promise<AirportResponse> {
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<AirportResponse>("/airport", defaultParams);
  },

  async getAirportsByBbox(bbox: [number, number, number, number]): Promise<AirportResponse> {
    return this.getAirports({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },

  async getAirportsByIds(ids: string | string[]): Promise<AirportResponse> {
    const idsString = Array.isArray(ids) ? ids.join(",") : ids;
    return this.getAirports({
      ids: idsString,
      format: "geojson",
    });
  },
};