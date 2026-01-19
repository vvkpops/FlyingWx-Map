# Create Stores
$mapStoreContent = @'
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Map as LeafletMap, Layer, LatLngBounds } from "leaflet";

export const useMapStore = defineStore("map", () => {
  const map = ref<LeafletMap | null>(null);
  const zoom = ref(5);
  const center = ref<[number, number]>([39.8283, -98.5795]);
  const bounds = ref<LatLngBounds | null>(null);
  const layers = ref<Map<string, Layer>>(new Map());

  const layerVisibility = ref({
    navaids: true,
    airports: false,
    fixes: false,
    obstacles: false,
  });

  function setMap(mapInstance: LeafletMap) {
    map.value = mapInstance;
  }

  function setZoom(newZoom: number) {
    zoom.value = newZoom;
  }

  function setCenter(lat: number, lon: number) {
    center.value = [lat, lon];
  }

  function setBounds(newBounds: LatLngBounds) {
    bounds.value = newBounds;
  }

  function addLayer(id: string, layer: Layer) {
    layers.value.set(id, layer);
  }

  function removeLayer(id: string) {
    const layer = layers.value.get(id);
    if (layer && map.value) {
      map.value.removeLayer(layer);
      layers.value.delete(id);
    }
  }

  function toggleLayerVisibility(layerName: keyof typeof layerVisibility.value) {
    layerVisibility.value[layerName] = !layerVisibility.value[layerName];
  }

  function getBbox(): [number, number, number, number] | null {
    if (!bounds.value) return null;
    const sw = bounds.value.getSouthWest();
    const ne = bounds.value.getNorthEast();
    return [sw.lat, sw.lng, ne.lat, ne.lng];
  }

  return {
    map,
    zoom,
    center,
    bounds,
    layers,
    layerVisibility,
    setMap,
    setZoom,
    setCenter,
    setBounds,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    getBbox,
  };
});
'@
[System.IO.File]::WriteAllText("$PWD\src\stores\mapStore.ts", $mapStoreContent)

$navigationStoreContent = @'
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  NavaidFeature,
  AirportFeature,
  FixFeature,
  ObstacleFeature,
} from "@/api/types/apiResponses";

export const useNavigationStore = defineStore("navigation", () => {
  const navaids = ref<NavaidFeature[]>([]);
  const airports = ref<AirportFeature[]>([]);
  const fixes = ref<FixFeature[]>([]);
  const obstacles = ref<ObstacleFeature[]>([]);
  
  const selectedFeature = ref<NavaidFeature | AirportFeature | FixFeature | ObstacleFeature | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const hasNavaids = computed(() => navaids.value.length > 0);
  const hasAirports = computed(() => airports.value.length > 0);
  const hasFixes = computed(() => fixes.value.length > 0);
  const hasObstacles = computed(() => obstacles.value.length > 0);

  function setNavaids(data: NavaidFeature[]) {
    navaids.value = data;
  }

  function setAirports(data: AirportFeature[]) {
    airports.value = data;
  }

  function setFixes(data: FixFeature[]) {
    fixes.value = data;
  }

  function setObstacles(data: ObstacleFeature[]) {
    obstacles.value = data;
  }

  function selectFeature(feature: NavaidFeature | AirportFeature | FixFeature | ObstacleFeature | null) {
    selectedFeature.value = feature;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  function clearAll() {
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
    hasNavaids,
    hasAirports,
    hasFixes,
    hasObstacles,
    setNavaids,
    setAirports,
    setFixes,
    setObstacles,
    selectFeature,
    setLoading,
    setError,
    clearAll,
  };
});
'@
[System.IO.File]::WriteAllText("$PWD\src\stores\navigationStore.ts", $navigationStoreContent)

$userPreferencesStoreContent = @'
import { defineStore } from "pinia";
import { ref } from "vue";

export interface UserPreferences {
  theme: "light" | "dark";
  mapStyle: "streets" | "satellite" | "terrain";
  autoLoadNavaids: boolean;
  defaultZoom: number;
}

export const useUserPreferencesStore = defineStore("userPreferences", () => {
  const preferences = ref<UserPreferences>({
    theme: "light",
    mapStyle: "streets",
    autoLoadNavaids: true,
    defaultZoom: 5,
  });

  function setTheme(theme: "light" | "dark") {
    preferences.value.theme = theme;
    savePreferences();
  }

  function setMapStyle(style: "streets" | "satellite" | "terrain") {
    preferences.value.mapStyle = style;
    savePreferences();
  }

  function setAutoLoadNavaids(autoLoad: boolean) {
    preferences.value.autoLoadNavaids = autoLoad;
    savePreferences();
  }

  function setDefaultZoom(zoom: number) {
    preferences.value.defaultZoom = zoom;
    savePreferences();
  }

  function savePreferences() {
    localStorage.setItem("aviation-nav-preferences", JSON.stringify(preferences.value));
  }

  function loadPreferences() {
    const stored = localStorage.getItem("aviation-nav-preferences");
    if (stored) {
      try {
        preferences.value = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load preferences:", e);
      }
    }
  }

  return {
    preferences,
    setTheme,
    setMapStyle,
    setAutoLoadNavaids,
    setDefaultZoom,
    savePreferences,
    loadPreferences,
  };
});
'@
[System.IO.File]::WriteAllText("$PWD\src\stores\userPreferencesStore.ts", $userPreferencesStoreContent)

Write-Host "Store files created!"
