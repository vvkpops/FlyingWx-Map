<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import L from "leaflet";
import { useMapStore } from "@/stores/mapStore";
import { useNavigationStore } from "@/stores/navigationStore";
import { useGeolocation } from "@/composables/useGeolocation";
import { dataLoaderService } from "@/services/dataLoader";

const mapContainer = ref<HTMLDivElement | null>(null);
const mapStore = useMapStore();
const navStore = useNavigationStore();
const { coords, isSupported } = useGeolocation();
let isUpdatingFromMap = false;

onMounted(async () => {
  if (!mapContainer.value) return;

  // Initialize data loader first
  try {
    console.log("Loading aviation data...");
    await dataLoaderService.loadAllData();
    console.log("Aviation data loaded successfully");
  } catch (error) {
    console.error("Failed to load aviation data:", error);
  }

  // Wait briefly for geolocation (max 1 second) before initializing map
  let initialCenter = mapStore.center;
  let initialZoom = mapStore.zoom;

  if (isSupported) {
    // Wait up to 1 second for geolocation
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 1000));
    const locationPromise = new Promise(resolve => {
      if (coords.value) {
        resolve(coords.value);
        return;
      }
      const unwatch = watch(coords, (newCoords) => {
        if (newCoords) {
          resolve(newCoords);
          unwatch();
        }
      });
      // Auto-unwatch after 1.1 seconds as backup
      setTimeout(() => unwatch(), 1100);
    });

    try {
      const result = await Promise.race([locationPromise, timeoutPromise]);
      
      if (result && typeof result === 'object' && 'latitude' in result) {
        initialCenter = [result.latitude, result.longitude];
        initialZoom = 10;
      }
    } catch (error) {
      console.log("Geolocation failed, using default center");
    }
  }

  const map = L.map(mapContainer.value, {
    zoomControl: false  // Disable default zoom control
  }).setView(initialCenter, initialZoom);

  // Add zoom control to bottom-right
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  mapStore.setMap(map);

  // Load data on map move/zoom
  const loadDataForCurrentView = () => {
    const bounds = map.getBounds();
    const bbox = [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ];
    
    navStore.loadDataForBounds(bbox[0], bbox[1], bbox[2], bbox[3]);
  };

  map.on("moveend", () => {
    isUpdatingFromMap = true;
    mapStore.setBounds(map.getBounds());
    mapStore.setZoom(map.getZoom());
    const center = map.getCenter();
    mapStore.setCenter(center.lat, center.lng);
    loadDataForCurrentView();
    setTimeout(() => {
      isUpdatingFromMap = false;
    }, 0);
  });

  map.on("zoomend", () => {
    isUpdatingFromMap = true;
    mapStore.setZoom(map.getZoom());
    setTimeout(() => {
      isUpdatingFromMap = false;
    }, 0);
  });

  mapStore.setBounds(map.getBounds());
  
  // Initial data load - add a small delay to ensure everything is ready
  setTimeout(() => {
    loadDataForCurrentView();
  }, 100);
});

watch(
  () => mapStore.center,
  (newCenter) => {
    if (mapStore.map && !isUpdatingFromMap) {
      mapStore.map.setView(newCenter, mapStore.zoom);
    }
  }
);
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>