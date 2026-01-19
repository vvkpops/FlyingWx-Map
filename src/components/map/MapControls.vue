<template>
  <div class="map-controls" :class="{ collapsed: isCollapsed, 'sidebar-open': !preferencesStore.sidebarCollapsed }">
    <button class="toggle-btn" @click="isCollapsed = !isCollapsed" title="Toggle Layers Panel">
      {{ isCollapsed ? '◀' : '▶' }}
    </button>
    <div v-if="!isCollapsed" class="control-panel">
      <h3>Layers</h3>
      <div class="layer-toggles">
        <label>
          <input type="checkbox" v-model="mapStore.layerVisibility.navaids" @change="toggleNavaidsLayer" />
          <span>Navaids ({{ navStore.navaids.length }})</span>
        </label>
        <label>
          <input type="checkbox" v-model="mapStore.layerVisibility.airports" @change="toggleAirportsLayer" />
          <span>Airports ({{ navStore.airports.length }})</span>
        </label>
        <label>
          <input type="checkbox" v-model="mapStore.layerVisibility.fixes" @change="toggleFixesLayer" />
          <span>Fixes ({{ navStore.fixes.length }})</span>
        </label>
        <label>
          <input type="checkbox" v-model="mapStore.layerVisibility.obstacles" @change="toggleObstaclesLayer" />
          <span>Obstacles ({{ navStore.obstacles.length }})</span>
        </label>
      </div>
      <div v-if="navStore.isLoading" class="loading-indicator">Loading data...</div>
      <div v-if="navStore.error" class="error-message">{{ navStore.error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMapStore } from "@/stores/mapStore";
import { useNavigationStore } from "@/stores/navigationStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";

const mapStore = useMapStore();
const navStore = useNavigationStore();
const preferencesStore = useUserPreferencesStore();
const isCollapsed = ref(false);

function toggleNavaidsLayer() {
  // Layer toggle logic handled by MapLayers component watching the store
}

function toggleAirportsLayer() {
  // Layer toggle logic handled by MapLayers component watching the store
}

function toggleFixesLayer() {
  // Layer toggle logic handled by MapLayers component watching the store
}

function toggleObstaclesLayer() {
  // Layer toggle logic handled by MapLayers component watching the store
}
</script>

<style scoped>
.map-controls {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  min-width: 200px;
  transition: right 0.3s ease, transform 0.3s ease;
}

.map-controls.sidebar-open {
  right: 360px;
}

.map-controls.collapsed {
  transform: translateX(calc(100% + 10px));
}

.toggle-btn {
  position: absolute;
  left: -30px;
  top: 10px;
  width: 30px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #f0f0f0;
}

.control-panel h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.layer-toggles label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.layer-toggles input[type="checkbox"] {
  margin-right: 8px;
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 10px;
  padding: 8px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  font-size: 12px;
}

.loading-indicator {
  margin-top: 10px;
  padding: 8px;
  background: #d1ecf1;
  color: #0c5460;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
</style>