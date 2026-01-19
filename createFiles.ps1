# Create navaid endpoint
$navaidContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\navaid.ts", $navaidContent)

# Create airport endpoint
$airportContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\airport.ts", $airportContent)

# Create fix endpoint
$fixContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\fix.ts", $fixContent)

# Create obstacle endpoint
$obstacleContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\obstacle.ts", $obstacleContent)

# Create stationInfo endpoint
$stationInfoContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\stationInfo.ts", $stationInfoContent)

# Create feature endpoint
$featureContent = @'
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
'@
[System.IO.File]::WriteAllText("$PWD\src\api\endpoints\feature.ts", $featureContent)

Write-Host "All endpoint files created successfully!"
