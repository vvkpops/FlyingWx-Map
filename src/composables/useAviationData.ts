import { ref } from "vue";
import { navaidEndpoint } from "@/api/endpoints/navaid";
import { airportEndpoint } from "@/api/endpoints/airport";
import { fixEndpoint } from "@/api/endpoints/fix";
import { useNavigationStore } from "@/stores/navigationStore";

export function useAviationData() {
  const navStore = useNavigationStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function loadNavaidsByBbox(bbox: [number, number, number, number]) {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await navaidEndpoint.getNavaidsByBbox(bbox);
      navStore.setNavaids(data.features);
      return data.features;
    } catch (err: any) {
      error.value = err.message || "Failed to load navaids";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAirportsByBbox(bbox: [number, number, number, number]) {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await airportEndpoint.getAirportsByBbox(bbox);
      navStore.setAirports(data.features);
      return data.features;
    } catch (err: any) {
      error.value = err.message || "Failed to load airports";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadFixesByBbox(bbox: [number, number, number, number]) {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await fixEndpoint.getFixesByBbox(bbox);
      navStore.setFixes(data.features);
      return data.features;
    } catch (err: any) {
      error.value = err.message || "Failed to load fixes";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    loadNavaidsByBbox,
    loadAirportsByBbox,
    loadFixesByBbox,
  };
}