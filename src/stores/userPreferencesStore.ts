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

  const sidebarCollapsed = ref(true);

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed;
  }

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
    sidebarCollapsed,
    setSidebarCollapsed,
    setTheme,
    setMapStyle,
    setAutoLoadNavaids,
    setDefaultZoom,
    savePreferences,
    loadPreferences,
  };
});