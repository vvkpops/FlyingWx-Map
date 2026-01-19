import axios, { AxiosInstance } from "axios";

// Use the Vercel API proxy route in production, and Vite proxy in development
const isProduction = process.env.NODE_ENV === 'production' || import.meta.env.PROD;
const BASE_URL = isProduction ? "/api/proxy" : "/api/data";

console.log('AviationWeatherClient environment:', {
  NODE_ENV: process.env.NODE_ENV,
  'import.meta.env.PROD': import.meta.env.PROD,
  isProduction,
  BASE_URL
});

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
      
      let url: string;
      if (isProduction) {
        // In production, use the proxy API with endpoint as a parameter
        const allParams = { endpoint, ...params };
        const proxyQueryString = this.buildQueryString(allParams);
        url = `${proxyQueryString}`;
      } else {
        // In development, use the Vite proxy
        url = `${endpoint}${queryString}`;
      }
      
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
