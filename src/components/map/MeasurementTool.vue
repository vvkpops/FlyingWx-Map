<template>
  <div class="measurement-tool">
    <button 
      @click="toggleMeasurement" 
      :class="{ active: isActive }"
      class="tool-button"
      title="Measure distance"
    >
      📏
    </button>
    <div v-if="totalDistance > 0" class="distance-display">
      <strong>Distance:</strong> {{ totalDistance.toFixed(1) }} nm
      <button @click="clearMeasurement" class="clear-btn">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import L, { LatLng, Polyline, CircleMarker } from "leaflet";
import { useMapStore } from "@/stores/mapStore";

const mapStore = useMapStore();
const isActive = ref(false);
const totalDistance = ref(0);
const points = ref<LatLng[]>([]);
let polyline: Polyline | null = null;
let markers: CircleMarker[] = [];

const metersToNauticalMiles = (meters: number) => meters * 0.000539957;

function toggleMeasurement() {
  isActive.value = !isActive.value;
  
  if (isActive.value) {
    startMeasurement();
  } else {
    stopMeasurement();
  }
}

function startMeasurement() {
  if (!mapStore.map) return;
  
  mapStore.map.getContainer().style.cursor = "crosshair";
  mapStore.map.on("click", onMapClick);
}

function stopMeasurement() {
  if (!mapStore.map) return;
  
  mapStore.map.getContainer().style.cursor = "";
  mapStore.map.off("click", onMapClick);
}

function onMapClick(e: L.LeafletMouseEvent) {
  if (!mapStore.map) return;
  
  points.value.push(e.latlng);
  
  // Add marker
  const marker = L.circleMarker(e.latlng, {
    radius: 5,
    fillColor: "#ff0000",
    color: "#fff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  }).addTo(mapStore.map);
  
  markers.push(marker);
  
  // Update or create polyline
  if (points.value.length > 1) {
    if (polyline) {
      polyline.setLatLngs(points.value);
    } else {
      polyline = L.polyline(points.value, {
        color: "#ff0000",
        weight: 2,
        dashArray: "5, 5",
      }).addTo(mapStore.map);
    }
    
    // Calculate total distance
    let distance = 0;
    for (let i = 0; i < points.value.length - 1; i++) {
      distance += points.value[i].distanceTo(points.value[i + 1]);
    }
    totalDistance.value = metersToNauticalMiles(distance);
  }
}

function clearMeasurement() {
  if (!mapStore.map) return;
  
  // Remove polyline
  if (polyline) {
    mapStore.map.removeLayer(polyline);
    polyline = null;
  }
  
  // Remove markers
  markers.forEach(marker => mapStore.map?.removeLayer(marker));
  markers = [];
  
  // Reset data
  points.value = [];
  totalDistance.value = 0;
}

watch(() => isActive.value, (active) => {
  if (!active) {
    clearMeasurement();
  }
});
</script>

<style scoped>
.measurement-tool {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tool-button {
  background: white;
  border: 2px solid #333;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-button:hover {
  background: #f0f0f0;
}

.tool-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.distance-display {
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.clear-btn:hover {
  background: #c82333;
}
</style>
