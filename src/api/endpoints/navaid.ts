import { aviationWeatherClient } from "../aviationWeatherClient";
import { NavaidResponse } from "../types/apiResponses";

export interface NavaidQueryParams {
  ids?: string;
  bbox?: string;
  format?: "raw" | "json" | "geojson";
}

export const navaidEndpoint = {
  async getNavaids(params: NavaidQueryParams = {}): Promise<NavaidResponse> {
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<NavaidResponse>("/navaid", defaultParams);
  },

  async getNavaidsByBbox(bbox: [number, number, number, number]): Promise<NavaidResponse> {
    return this.getNavaids({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },

  async getNavaidsByIds(ids: string | string[]): Promise<NavaidResponse> {
    const idsString = Array.isArray(ids) ? ids.join(",") : ids;
    return this.getNavaids({
      ids: idsString,
      format: "geojson",
    });
  },
};