<template>
  <div class="sidebar" :class="{ collapsed: preferencesStore.sidebarCollapsed }">
    <button class="toggle-btn" @click="toggleSidebar">
      {{ preferencesStore.sidebarCollapsed ? ">" : "<" }}
    </button>
    
    <div v-if="!preferencesStore.sidebarCollapsed" class="sidebar-content">
      <h2>Aviation Navigation</h2>
      
      <div class="stats">
        <div class="stat-item">
          <span class="label">Navaids:</span>
          <span class="value">{{ navStore.navaids.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Airports:</span>
          <span class="value">{{ navStore.airports.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Fixes:</span>
          <span class="value">{{ navStore.fixes.length }}</span>
        </div>
      </div>

      <div v-if="navStore.selectedFeature" class="feature-details">
        <h3>Selected Feature</h3>
        <div class="details">
          <p><strong>Type:</strong> {{ getFeatureType(navStore.selectedFeature) }}</p>
          <p v-if="navStore.selectedFeature.properties.ident">
            <strong>Ident:</strong> {{ navStore.selectedFeature.properties.ident }}
          </p>
          <p v-if="navStore.selectedFeature.properties.name">
            <strong>Name:</strong> {{ navStore.selectedFeature.properties.name }}
          </p>
          <p v-if="navStore.selectedFeature.properties.icaoId">
            <strong>ICAO:</strong> {{ navStore.selectedFeature.properties.icaoId }}
          </p>
          <p v-if="navStore.selectedFeature.geometry?.coordinates">
            <strong>Coordinates:</strong> 
            {{ navStore.selectedFeature.geometry.coordinates[1].toFixed(4) }}, 
            {{ navStore.selectedFeature.geometry.coordinates[0].toFixed(4) }}
          </p>
          <p v-if="navStore.selectedFeature.properties.freq">
            <strong>Frequency:</strong> {{ navStore.selectedFeature.properties.freq }}
          </p>
          <p v-if="navStore.selectedFeature.properties.type">
            <strong>Type:</strong> {{ navStore.selectedFeature.properties.type }}
          </p>
          <p v-if="navStore.selectedFeature.properties.elev">
            <strong>Elevation:</strong> {{ navStore.selectedFeature.properties.elev }} ft
          </p>
        </div>
        <button @click="navStore.selectFeature(null)" class="btn-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNavigationStore } from "@/stores/navigationStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";

const navStore = useNavigationStore();
const preferencesStore = useUserPreferencesStore();

function toggleSidebar() {
  preferencesStore.setSidebarCollapsed(!preferencesStore.sidebarCollapsed);
}

function getFeatureType(feature: any): string {
  if ("freq" in feature.properties) return "Navaid";
  if ("icaoId" in feature.properties) return "Airport";
  if ("ident" in feature.properties) return "Fix";
  return "Unknown";
}
</script>

<style scoped>
.sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.sidebar.collapsed {
  transform: translateX(100%);
}

.toggle-btn {
  position: absolute;
  left: -35px;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 60px;
  background: white;
  border: none;
  border-radius: 6px 0 0 6px;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: all 0.2s;
  z-index: 1;
}

.toggle-btn:hover {
  background: #f0f0f0;
  color: #007bff;
}

.sidebar-content {
  padding: 20px;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.stats {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  color: #666;
}

.value {
  font-weight: bold;
  color: #007bff;
}

.feature-details {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.feature-details h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.details p {
  margin: 5px 0;
  font-size: 14px;
}

.btn-close {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-close:hover {
  background: #c82333;
}
</style>