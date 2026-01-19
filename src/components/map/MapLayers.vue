<template>
  <div class="map-layers"></div>
</template>

<script setup lang="ts">
import { watch, onMounted } from "vue";
import L, { LayerGroup, CircleMarker } from "leaflet";
import { useMapStore } from "@/stores/mapStore";
import { useNavigationStore } from "@/stores/navigationStore";

const mapStore = useMapStore();
const navStore = useNavigationStore();

let navaidLayer: LayerGroup | null = null;
let airportLayer: LayerGroup | null = null;
let fixLayer: LayerGroup | null = null;

onMounted(() => {
  // Layer initialization will happen when map is available
});

// Initialize layers when map becomes available
watch(
  () => mapStore.map,
  (map) => {
    if (map && !navaidLayer) {
      navaidLayer = L.layerGroup();
      airportLayer = L.layerGroup();
      fixLayer = L.layerGroup();
      console.log('Map layers initialized');
    }
  },
  { immediate: true }
);

// Watch for navaids changes
watch(
  () => navStore.navaids,
  (navaids) => {
    if (!navaidLayer || !mapStore.map) return;

    navaidLayer.clearLayers();

    if (!mapStore.layerVisibility.navaids) {
      navaidLayer.remove();
      return;
    }

    if (!mapStore.map.hasLayer(navaidLayer)) {
      navaidLayer.addTo(mapStore.map);
    }

    navaids.forEach((navaid) => {
      // GeoJSON coordinates are [longitude, latitude]
      const [lon, lat] = navaid.geometry?.coordinates || [0, 0];
      if (!lat || !lon) return;

      const currentZoom = mapStore.zoom;

      const marker = L.circleMarker([lat, lon], {
        radius: 3,
        fillColor: "#007bff",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const props = navaid.properties;

      // Show tooltip with navaid identifier when zoomed in (zoom level 9 or higher)
      if (currentZoom >= 9 && props.ident) {
        marker.bindTooltip(props.ident, {
          permanent: true,
          direction: "right",
          className: "navaid-label",
          offset: [8, 0]
        });
      }

      marker.bindPopup(`
        <div>
          <h4>${props.ident || "Navaid"} ${props.name ? "- " + props.name : ""}</h4>
          ${props.type ? `<p><strong>Type:</strong> ${props.type}</p>` : ""}
          ${props.freq ? `<p><strong>Frequency:</strong> ${props.freq}</p>` : ""}
          <p><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
          ${props.elev ? `<p><strong>Elevation:</strong> ${props.elev} ft</p>` : ""}
        </div>
      `);

      marker.on("click", () => {
        navStore.selectFeature(navaid);
      });

      marker.addTo(navaidLayer!);
    });
  }
);

// Watch for airports changes
watch(
  () => navStore.airports,
  (airports) => {
    if (!airportLayer || !mapStore.map) return;

    airportLayer.clearLayers();

    if (!mapStore.layerVisibility.airports) {
      airportLayer.remove();
      return;
    }

    if (!mapStore.map.hasLayer(airportLayer)) {
      airportLayer.addTo(mapStore.map);
    }

    airports.forEach((airport) => {
      // GeoJSON coordinates are [longitude, latitude]
      const [lon, lat] = airport.geometry?.coordinates || [0, 0];
      if (!lat || !lon) return;

      const currentZoom = mapStore.zoom;

      const marker = L.circleMarker([lat, lon], {
        radius: 4,
        fillColor: "#28a745",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const props = airport.properties;

      // Show tooltip with airport identifier when zoomed in (zoom level 8 or higher)
      if (currentZoom >= 8 && (props.icaoId || props.iataId)) {
        const label = props.icaoId || props.iataId;
        marker.bindTooltip(label, {
          permanent: true,
          direction: "right",
          className: "airport-label",
          offset: [8, 0]
        });
      }

      marker.bindPopup(`
        <div>
          <h4>${props.icaoId || props.name || "Airport"}</h4>
          ${props.icaoId ? `<p><strong>ICAO:</strong> ${props.icaoId}</p>` : ""}
          ${props.iataId ? `<p><strong>IATA:</strong> ${props.iataId}</p>` : ""}
          ${props.name ? `<p><strong>Name:</strong> ${props.name}</p>` : ""}
          <p><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
          ${props.elev ? `<p><strong>Elevation:</strong> ${props.elev} ft</p>` : ""}
        </div>
      `);

      marker.on("click", () => {
        navStore.selectFeature(airport);
      });

      marker.addTo(airportLayer!);
    });
  }
);

// Watch for fixes changes
watch(
  () => navStore.fixes,
  (fixes) => {
    if (!fixLayer || !mapStore.map) return;

    fixLayer.clearLayers();

    if (!mapStore.layerVisibility.fixes) {
      fixLayer.remove();
      return;
    }

    if (!mapStore.map.hasLayer(fixLayer)) {
      fixLayer.addTo(mapStore.map);
    }

    fixes.forEach((fix) => {
      // GeoJSON coordinates are [longitude, latitude]
      const [lon, lat] = fix.geometry?.coordinates || [0, 0];
      if (!lat || !lon) return;

      const currentZoom = mapStore.zoom;
      
      const marker = L.circleMarker([lat, lon], {
        radius: 3,
        fillColor: "#e91e63",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const props = fix.properties;
      
      // Show tooltip with fix name when zoomed in (zoom level 9 or higher)
      if (currentZoom >= 9 && props.ident) {
        marker.bindTooltip(props.ident, {
          permanent: true,
          direction: "right",
          className: "fix-label",
          offset: [8, 0]
        });
      }
      
      marker.bindPopup(`
        <div>
          <h4>${props.ident || "Fix"}</h4>
          ${props.province ? `<p><strong>Province:</strong> ${props.province}</p>` : ""}
          ${props.type ? `<p><strong>Type:</strong> ${props.type}</p>` : "<p><strong>Type:</strong> Fix/Waypoint</p>"}
          <p><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
          ${props.source ? `<p><strong>Source:</strong> ${props.source}</p>` : ""}
        </div>
      `);

      marker.on("click", () => {
        navStore.selectFeature(fix);
      });

      marker.addTo(fixLayer!);
    });
  }
);

// Watch for layer visibility changes
watch(
  () => mapStore.layerVisibility.navaids,
  (visible) => {
    if (!navaidLayer || !mapStore.map) return;
    if (visible) {
      navaidLayer.addTo(mapStore.map);
    } else {
      navaidLayer.remove();
    }
  }
);

watch(
  () => mapStore.layerVisibility.airports,
  (visible) => {
    if (!airportLayer || !mapStore.map) return;
    if (visible) {
      airportLayer.addTo(mapStore.map);
    } else {
      airportLayer.remove();
    }
  }
);

watch(
  () => mapStore.layerVisibility.fixes,
  (visible) => {
    if (!fixLayer || !mapStore.map) return;
    if (visible) {
      fixLayer.addTo(mapStore.map);
    } else {
      fixLayer.remove();
    }
  }
);

// Watch for zoom changes to update all labels
watch(
  () => mapStore.zoom,
  () => {
    // Trigger refresh to update labels based on zoom
    if (navStore.navaids.length > 0) {
      navStore.setNavaids([...navStore.navaids]);
    }
    if (navStore.airports.length > 0) {
      navStore.setAirports([...navStore.airports]);
    }
    if (navStore.fixes.length > 0) {
      navStore.setFixes([...navStore.fixes]);
    }
  }
);

</script>

<style>
.map-layers {
  display: none;
}

/* Style for navaid labels */
:deep(.navaid-label) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 10px;
  font-weight: bold;
  color: #004085;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.navaid-label::before) {
  display: none !important;
}

/* Style for airport labels */
:deep(.airport-label) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 11px;
  font-weight: bold;
  color: #155724;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.airport-label::before) {
  display: none !important;
}

/* Style for fix labels */
:deep(.fix-label) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 10px;
  font-weight: bold;
  color: #c2185b;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.fix-label::before) {
  display: none !important;
}
</style>