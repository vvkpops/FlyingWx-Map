import { ref, onMounted, onUnmounted } from "vue";

export function useGeolocation() {
  const coords = ref<GeolocationCoordinates | null>(null);
  const isSupported = "navigator" in window && "geolocation" in navigator;
  const error = ref<GeolocationPositionError | null>(null);
  let watcher: number | null = null;

  function updatePosition(position: GeolocationPosition) {
    coords.value = position.coords;
    error.value = null;
  }

  function updateError(err: GeolocationPositionError) {
    error.value = err;
  }

  function getCurrentPosition() {
    if (!isSupported) return;
    navigator.geolocation.getCurrentPosition(updatePosition, updateError);
  }

  function watchPosition() {
    if (!isSupported) return;
    watcher = navigator.geolocation.watchPosition(updatePosition, updateError);
  }

  function clearWatch() {
    if (watcher !== null) {
      navigator.geolocation.clearWatch(watcher);
      watcher = null;
    }
  }

  onMounted(() => {
    getCurrentPosition();
  });

  onUnmounted(() => {
    clearWatch();
  });

  return {
    coords,
    isSupported,
    error,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}