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
    fixes: true,
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