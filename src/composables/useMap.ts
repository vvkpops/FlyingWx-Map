import { ref } from "vue";
import { useMapStore } from "@/stores/mapStore";
import type { Map as LeafletMap } from "leaflet";

export function useMap() {
  const mapStore = useMapStore();

  function flyTo(lat: number, lon: number, zoom?: number) {
    if (mapStore.map) {
      mapStore.map.flyTo([lat, lon], zoom || mapStore.zoom);
    }
  }

  function fitBounds(bounds: [[number, number], [number, number]]) {
    if (mapStore.map) {
      mapStore.map.fitBounds(bounds);
    }
  }

  function setView(lat: number, lon: number, zoom: number) {
    if (mapStore.map) {
      mapStore.map.setView([lat, lon], zoom);
    }
  }

  return {
    map: mapStore.map,
    flyTo,
    fitBounds,
    setView,
  };
}