import { aviationWeatherClient } from "../aviationWeatherClient";
import { FixResponse } from "../types/apiResponses";

export interface FixQueryParams {
  ids?: string;
  bbox?: string;
  format?: "raw" | "json" | "geojson";
}

export const fixEndpoint = {
  async getFixes(params: FixQueryParams = {}): Promise<FixResponse> {
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<FixResponse>("/fix", defaultParams);
  },

  async getFixesByBbox(bbox: [number, number, number, number]): Promise<FixResponse> {
    return this.getFixes({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },

  async getFixesByIds(ids: string | string[]): Promise<FixResponse> {
    const idsString = Array.isArray(ids) ? ids.join(",") : ids;
    return this.getFixes({
      ids: idsString,
      format: "geojson",
    });
  },
};