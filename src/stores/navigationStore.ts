import { defineStore } from "pinia";
import { ref } from "vue";
import { dataLoaderService } from "@/services/dataLoader";
import { airportEndpoint } from "@/api/endpoints/airport";

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, any>;
}

export const useNavigationStore = defineStore("navigation", () => {
  const navaids = ref<GeoJSONFeature[]>([]);
  const airports = ref<GeoJSONFeature[]>([]);
  const fixes = ref<GeoJSONFeature[]>([]);
  const obstacles = ref<GeoJSONFeature[]>([]);
  const selectedFeature = ref<GeoJSONFeature | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setNavaids(data: GeoJSONFeature[]) {
    navaids.value = data;
  }

  function setAirports(data: GeoJSONFeature[]) {
    airports.value = data;
  }

  function setFixes(data: GeoJSONFeature[]) {
    fixes.value = data;
  }

  function setObstacles(data: GeoJSONFeature[]) {
    obstacles.value = data;
  }

  function selectFeature(feature: GeoJSONFeature | null) {
    selectedFeature.value = feature;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  async function loadDataForBounds(minLat: number, minLon: number, maxLat: number, maxLon: number) {
    isLoading.value = true;
    error.value = null;

    try {
      // Load from local AIXM data
      const navaidData = dataLoaderService.getNavaidsByBounds(minLat, minLon, maxLat, maxLon);
      setNavaids(navaidData);
      
      // Load fixes from local data (includes NavCanada fixes)
      const fixData = dataLoaderService.getFixesByBounds(minLat, minLon, maxLat, maxLon);
      setFixes(fixData);
      
      // For airports, try API first, then fallback to local data
      let airportsLoaded = false;
      try {
        console.log('Loading airports from API for bounds:', { minLat, minLon, maxLat, maxLon });
        const airportData = await airportEndpoint.getAirportsByBbox([minLon, minLat, maxLon, maxLat]);
        if (airportData.features && airportData.features.length > 0) {
          setAirports(airportData.features);
          console.log('Loaded airports from API:', airportData.features.length);
          airportsLoaded = true;
        }
      } catch (e) {
        console.warn('API call failed for airports:', e);
      }

      // If API failed or returned no results, use local airport data
      if (!airportsLoaded) {
        console.log('Using local airport data as fallback');
        const localAirportData = dataLoaderService.getAirportsByBounds(minLat, minLon, maxLat, maxLon);
        setAirports(localAirportData);
        console.log('Loaded airports from local data:', localAirportData.length);
      }

    } catch (err: any) {
      error.value = err.message || "Failed to load data";
      console.error("Error loading navigation data:", err);
    } finally {
      isLoading.value = false;
    }
  }

  function clearData() {
    navaids.value = [];
    airports.value = [];
    fixes.value = [];
    obstacles.value = [];
    selectedFeature.value = null;
    error.value = null;
  }

  return {
    navaids,
    airports,
    fixes,
    obstacles,
    selectedFeature,
    isLoading,
    error,
    setNavaids,
    setAirports,
    setFixes,
    setObstacles,
    selectFeature,
    setLoading,
    setError,
    loadDataForBounds,
    clearData,
  };
});