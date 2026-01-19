import { aviationWeatherClient } from "../aviationWeatherClient";
import { FeatureResponse } from "../types/apiResponses";

export interface FeatureQueryParams {
  bbox?: string;
  format?: "raw" | "json" | "geojson";
}

export const featureEndpoint = {
  async getFeatures(params: FeatureQueryParams): Promise<FeatureResponse> {
    if (!params.bbox) {
      throw new Error("bbox parameter is required for feature endpoint");
    }
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<FeatureResponse>("/feature", defaultParams);
  },

  async getFeaturesByBbox(bbox: [number, number, number, number]): Promise<FeatureResponse> {
    return this.getFeatures({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },
};