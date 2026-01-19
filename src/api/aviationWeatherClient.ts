import axios, { AxiosInstance } from "axios";

const BASE_URL = "/api/data";

class AviationWeatherClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        "Accept": "application/json",
      },
    });
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    return query ? `?${query}` : "";
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const queryString = this.buildQueryString(params);
      const url = `${endpoint}${queryString}`;
      console.log('Fetching:', BASE_URL + url);
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

export const aviationWeatherClient = new AviationWeatherClient();
