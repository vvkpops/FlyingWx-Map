<template>
  <div id="app">
    <MapContainer />
    <MapLayers />
    <MapControls />
    <MapScale />
    <div class="top-toolbar">
      <MeasurementTool />
      <FlightPlanner />
    </div>
    <Sidebar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import MapContainer from "./components/map/MapContainer.vue";
import MapLayers from "./components/map/MapLayers.vue";
import MapControls from "./components/map/MapControls.vue";
import MapScale from "./components/map/MapScale.vue";
import MeasurementTool from "./components/map/MeasurementTool.vue";
import FlightPlanner from "./components/flight/FlightPlanner.vue";
import Sidebar from "./components/ui/Sidebar.vue";
import { useUserPreferencesStore } from "./stores/userPreferencesStore";

const preferencesStore = useUserPreferencesStore();

onMounted(() => {
  preferencesStore.loadPreferences();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.top-toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
}
</style>