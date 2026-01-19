<template>
  <div class="map-scale">
    <div class="scale-line" :style="{ width: scaleWidth + 'px' }">
      <span class="scale-label">{{ scaleText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useMapStore } from "@/stores/mapStore";

const mapStore = useMapStore();
const scaleWidth = ref(100);
const scaleText = ref("0 nm");

// Convert meters to nautical miles
const metersToNauticalMiles = (meters: number) => meters * 0.000539957;

function updateScale() {
  if (!mapStore.map) return;

  const map = mapStore.map;
  const y = map.getSize().y / 2;
  const maxMeters = map.distance(
    map.containerPointToLatLng([0, y]),
    map.containerPointToLatLng([100, y])
  );

  const maxNauticalMiles = metersToNauticalMiles(maxMeters);

  // Find a nice round number for the scale
  const distances = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  let distance = distances[0];
  
  for (const d of distances) {
    distance = d;
    if (d > maxNauticalMiles) break;
  }

  const ratio = distance / maxNauticalMiles;
  scaleWidth.value = Math.round(100 * ratio);
  scaleText.value = `${distance} nm`;
}

watch(() => mapStore.zoom, updateScale);
watch(() => mapStore.map, updateScale);

onMounted(() => {
  if (mapStore.map) {
    mapStore.map.on("move", updateScale);
    updateScale();
  }
});
</script>

<style scoped>
.map-scale {
  position: absolute;
  bottom: 30px;
  right: 10px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: 600;
}

.scale-line {
  border: 2px solid #333;
  border-top: none;
  height: 8px;
  position: relative;
  box-sizing: content-box;
}

.scale-line::before,
.scale-line::after {
  content: "";
  position: absolute;
  bottom: -2px;
  width: 2px;
  height: 10px;
  background: #333;
}

.scale-line::before {
  left: -2px;
}

.scale-line::after {
  right: -2px;
}

.scale-label {
  position: absolute;
  top: -18px;
  left: 0;
  white-space: nowrap;
  color: #333;
}
</style>
