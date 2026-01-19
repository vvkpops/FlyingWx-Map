import { aviationWeatherClient } from "../aviationWeatherClient";
import { ObstacleResponse } from "../types/apiResponses";

export interface ObstacleQueryParams {
  bbox?: string;
  format?: "raw" | "json" | "geojson";
}

export const obstacleEndpoint = {
  async getObstacles(params: ObstacleQueryParams): Promise<ObstacleResponse> {
    if (!params.bbox) {
      throw new Error("bbox parameter is required for obstacle endpoint");
    }
    const defaultParams = {
      format: "geojson",
      ...params,
    };
    return await aviationWeatherClient.get<ObstacleResponse>("/obstacle", defaultParams);
  },

  async getObstaclesByBbox(bbox: [number, number, number, number]): Promise<ObstacleResponse> {
    return this.getObstacles({
      bbox: bbox.join(","),
      format: "geojson",
    });
  },
};