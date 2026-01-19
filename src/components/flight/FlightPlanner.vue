<template>
  <div class="flight-planner">
    <div class="planner-header">
      <button 
        @click="togglePlanner" 
        :class="{ active: isActive }"
        class="planner-button"
        title="Flight Planning"
      >
        ✈️ Flight Plan
      </button>
      <button 
        v-if="isActive" 
        @click="isMinimized = !isMinimized" 
        class="minimize-btn"
        :title="isMinimized ? 'Expand' : 'Minimize'"
      >
        {{ isMinimized ? '▲' : '▼' }}
      </button>
    </div>
    
    <div v-if="isActive && !isMinimized" class="flight-plan-panel">
      <h3>Flight Planner</h3>
      
      <div class="flight-inputs">
        <div class="input-group">
          <label>Departure Airport:</label>
          <input 
            v-model="departure" 
            type="text" 
            placeholder="e.g., KJFK"
            @input="departure = departure.toUpperCase()"
            class="airport-input"
          />
        </div>
        
        <div class="input-group">
          <label>Route (space-separated):</label>
          <input 
            v-model="route" 
            type="text" 
            placeholder="e.g., SCELA LINND GAYEL or 43.65,-79.38 CYYZ"
            @input="route = route.toUpperCase()"
            class="route-input"
          />
          <small>Enter fixes, navaids, airports, or coordinates (lat,lon)</small>
        </div>
        
        <div class="input-group">
          <label>Arrival Airport:</label>
          <input 
            v-model="arrival" 
            type="text" 
            placeholder="e.g., KBOS"
            @input="arrival = arrival.toUpperCase()"
            class="airport-input"
          />
        </div>
        
        <div class="input-group">
          <label>Speed (knots):</label>
          <input 
            v-model.number="speed" 
            type="number" 
            placeholder="120"
            @input="updateTimes()"
            class="speed-input"
            min="1"
          />
        </div>
        
        <!-- Waypoint Search -->
        <div class="waypoint-search">
          <div class="input-group">
            <label>Search Waypoints:</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search airports, navaids, fixes..."
              @input="performSearch"
              @focus="showSearchResults = true"
              class="search-input"
            />
            <small>Search by identifier or name</small>
          </div>
          
          <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              @click="addWaypointFromSearch(result)"
              class="search-result-item"
              :class="result.type"
            >
              <div class="result-main">
                <span class="result-ident">{{ result.ident }}</span>
                <span class="result-type-badge">{{ result.type.toUpperCase() }}</span>
              </div>
              <div class="result-name">{{ result.name }}</div>
              <div class="result-coords">{{ result.coordinates }}</div>
            </div>
          </div>
          
          <div v-if="showSearchResults && searchQuery && searchResults.length === 0" class="no-results">
            No waypoints found for "{{ searchQuery }}"
          </div>
        </div>
        
        <button @click="plotRoute" class="btn-plot" :disabled="isLoading">
          {{ isLoading ? 'Plotting...' : 'Plot Route' }}
        </button>
      </div>
      
      <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
      
      <div v-if="routeLegs.length > 0" class="route-display">
        <h4>Route Details</h4>
        <div class="route-legs">
          <div v-for="(leg, idx) in routeLegs" :key="idx" class="leg-item">
            <span class="leg-from">{{ leg.from }}</span>
            <span class="leg-arrow">→</span>
            <span class="leg-to">{{ leg.to }}</span>
            <span class="leg-distance">{{ leg.distance.toFixed(1) }} nm</span>
            <span class="leg-time">{{ formatTime(leg.time) }}</span>
          </div>
        </div>
        <div class="route-total">
          <div><strong>Total Distance:</strong> {{ totalDistance.toFixed(1) }} nm</div>
          <div><strong>Total Time:</strong> {{ formatTime(routeLegs.reduce((sum, leg) => sum + leg.time, 0)) }}</div>
        </div>
        <div class="route-actions">
          <button @click="clearRoute" class="btn-clear">Clear</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import L, { LatLng, Polyline, Marker } from "leaflet";
import { useMapStore } from "@/stores/mapStore";
import { dataLoaderService } from "@/services/dataLoader";

const mapStore = useMapStore();
const isActive = ref(false);
const isMinimized = ref(false);
const isLoading = ref(false);
const departure = ref("");
const arrival = ref("");
const route = ref("");
const errorMessage = ref("");
const totalDistance = ref(0);
const speed = ref(120); // Default speed in knots

// Search functionality
const searchQuery = ref("");
const searchResults = ref<SearchResult[]>([]);
const showSearchResults = ref(false);

interface SearchResult {
  id: string;
  ident: string;
  name: string;
  type: 'airport' | 'navaid' | 'fix';
  coordinates: string;
  lat: number;
  lon: number;
}

interface RouteLeg {
  from: string;
  to: string;
  distance: number;
  time: number; // time in hours
  fromLatLng: LatLng;
  toLatLng: LatLng;
}

const routeLegs = ref<RouteLeg[]>([]);
let routeLine: Polyline | null = null;
let markers: Marker[] = [];

const metersToNauticalMiles = (meters: number) => meters * 0.000539957;

function togglePlanner() {
  isActive.value = !isActive.value;
  // Don't clear route when closing - let user explicitly clear it
}

function performSearch() {
  const query = searchQuery.value.trim().toLowerCase();
  
  if (query.length < 2) {
    searchResults.value = [];
    return;
  }

  const results: SearchResult[] = [];
  
  try {
    // Search airports
    const airports = dataLoaderService.getAllAirports();
    for (const airport of airports) {
      const ident = airport.properties.ident?.toLowerCase() || '';
      const name = airport.properties.name?.toLowerCase() || '';
      
      if (ident.includes(query) || name.includes(query)) {
        results.push({
          id: `airport-${airport.properties.ident}`,
          ident: airport.properties.ident || '',
          name: airport.properties.name || '',
          type: 'airport',
          coordinates: `${airport.geometry.coordinates[1].toFixed(4)}, ${airport.geometry.coordinates[0].toFixed(4)}`,
          lat: airport.geometry.coordinates[1],
          lon: airport.geometry.coordinates[0]
        });
      }
    }
    
    // Search navaids
    const navaids = dataLoaderService.getAllNavaids();
    for (const navaid of navaids) {
      const ident = navaid.properties.ident?.toLowerCase() || '';
      const name = navaid.properties.name?.toLowerCase() || '';
      
      if (ident.includes(query) || name.includes(query)) {
        results.push({
          id: `navaid-${navaid.properties.ident}`,
          ident: navaid.properties.ident || '',
          name: navaid.properties.name || '',
          type: 'navaid',
          coordinates: `${navaid.geometry.coordinates[1].toFixed(4)}, ${navaid.geometry.coordinates[0].toFixed(4)}`,
          lat: navaid.geometry.coordinates[1],
          lon: navaid.geometry.coordinates[0]
        });
      }
    }
    
    // Search fixes
    const fixes = dataLoaderService.getAllFixes();
    for (const fix of fixes) {
      const ident = fix.properties.ident?.toLowerCase() || '';
      const name = fix.properties.name?.toLowerCase() || '';
      
      if (ident.includes(query) || name.includes(query)) {
        results.push({
          id: `fix-${fix.properties.ident}`,
          ident: fix.properties.ident || '',
          name: fix.properties.name || 'Fix',
          type: 'fix',
          coordinates: `${fix.geometry.coordinates[1].toFixed(4)}, ${fix.geometry.coordinates[0].toFixed(4)}`,
          lat: fix.geometry.coordinates[1],
          lon: fix.geometry.coordinates[0]
        });
      }
    }
    
  } catch (error) {
    console.warn('Search error:', error);
  }
  
  // Sort by relevance (exact matches first, then by type)
  results.sort((a, b) => {
    const aExact = a.ident.toLowerCase() === query;
    const bExact = b.ident.toLowerCase() === query;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Then by type preference: airports, navaids, fixes
    const typeOrder = { airport: 0, navaid: 1, fix: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
  
  // Limit to 10 results
  searchResults.value = results.slice(0, 10);
}

function addWaypointFromSearch(result: SearchResult) {
  const waypointIdent = result.ident;
  
  // Add to route field
  if (route.value.trim()) {
    route.value += ` ${waypointIdent}`;
  } else {
    route.value = waypointIdent;
  }
  
  // Navigate map to waypoint location with safety checks
  if (mapStore.map && mapStore.map.getContainer()) {
    // Set appropriate zoom level based on waypoint type for visibility
    let zoomLevel = 10; // Default zoom
    
    switch (result.type) {
      case 'airport':
        zoomLevel = 12; // Closer zoom for airports
        break;
      case 'navaid':
        zoomLevel = 11; // Medium zoom for navaids
        break;
      case 'fix':
        zoomLevel = 10; // Standard zoom for fixes
        break;
    }
    
    try {
      // Use a timeout to ensure map is ready and avoid race conditions
      setTimeout(() => {
        if (mapStore.map && mapStore.map.getContainer()) {
          // Navigate to the waypoint with smooth animation
          mapStore.map.setView([result.lat, result.lon], zoomLevel, {
            animate: true,
            duration: 0.8, // Slightly shorter animation
            easeLinearity: 0.2
          });
          
          // Update mapStore center to keep it in sync
          mapStore.setCenter(result.lat, result.lon);
          mapStore.setZoom(zoomLevel);
          
          console.log(`Navigated to ${result.ident} (${result.type}) at ${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`);
        }
      }, 50); // Small delay to ensure map is ready
    } catch (error) {
      console.warn('Error navigating to waypoint:', error);
      // Fallback: try without animation
      try {
        mapStore.map.setView([result.lat, result.lon], zoomLevel, { animate: false });
        mapStore.setCenter(result.lat, result.lon);
        mapStore.setZoom(zoomLevel);
      } catch (fallbackError) {
        console.error('Failed to navigate to waypoint:', fallbackError);
      }
    }
  }
  
  // Clear search
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
}

// Close search results when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.waypoint-search')) {
    showSearchResults.value = false;
  }
}

// Add event listener for clicking outside
document.addEventListener('click', handleClickOutside);

async function plotRoute() {
  if (!departure.value || !arrival.value) {
    errorMessage.value = "Please enter both departure and arrival airports";
    return;
  }
  
  errorMessage.value = "";
  isLoading.value = true;
  clearRoute();
  
  try {
    // Build complete route: departure + route fixes + arrival
    const waypoints = [
      departure.value.trim(),
      ...route.value.trim().split(/\s+/).filter(w => w.length > 0),
      arrival.value.trim()
    ];
    
    console.log("Plotting route:", waypoints);
    
    // Find coordinates for each waypoint
    const resolvedWaypoints = await resolveWaypoints(waypoints);
    
    if (resolvedWaypoints.length < 2) {
      const resolvedCount = resolvedWaypoints.length;
      const totalCount = waypoints.length;
      errorMessage.value = `Could not resolve enough waypoints (found ${resolvedCount}/${totalCount}). Please check your input. Examples: KJFK, EGLL, DEN, YYZ, or coordinates like 40.7,-74.0`;
      isLoading.value = false;
      return;
    }
    
    // Calculate legs
    routeLegs.value = [];
    let total = 0;
    
    for (let i = 0; i < resolvedWaypoints.length - 1; i++) {
      const from = resolvedWaypoints[i];
      const to = resolvedWaypoints[i + 1];
      const distance = metersToNauticalMiles(from.latlng.distanceTo(to.latlng));
      const time = speed.value > 0 ? distance / speed.value : 0;
      
      routeLegs.value.push({
        from: from.name,
        to: to.name,
        distance: distance,
        time: time,
        fromLatLng: from.latlng,
        toLatLng: to.latlng
      });
      
      total += distance;
    }
    
    totalDistance.value = total;
    
    // Draw route on map
    drawRoute(resolvedWaypoints);
    
    // Zoom to fit route
    if (mapStore.map) {
      const bounds = L.latLngBounds(resolvedWaypoints.map(w => w.latlng));
      mapStore.map.fitBounds(bounds, { padding: [50, 50] });
    }
    
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to plot route";
    console.error("Route plotting error:", error);
  } finally {
    isLoading.value = false;
  }
}

async function resolveWaypoints(names: string[]): Promise<Array<{name: string, latlng: LatLng}>> {
  const resolved = [];
  const unresolved = [];
  
  for (const name of names) {
    try {
      const latlng = await findWaypoint(name);
      if (latlng) {
        resolved.push({ name: name.toUpperCase(), latlng });
        console.log(`✓ Found waypoint: ${name.toUpperCase()}`);
      } else {
        unresolved.push(name);
        console.warn(`✗ Could not find waypoint: ${name}`);
      }
    } catch (error) {
      console.error(`Error resolving waypoint ${name}:`, error);
      unresolved.push(name);
    }
  }
  
  if (unresolved.length > 0) {
    console.warn("Unresolved waypoints:", unresolved);
  }
  
  return resolved;
}

async function findWaypoint(identifier: string): Promise<LatLng | null> {
  // Ensure data is loaded first
  await dataLoaderService.loadAllData();
  
  // Search in AIXM data using the data loader service
  const feature = dataLoaderService.findByIdentifier(identifier.toUpperCase());
  
  if (feature && feature.geometry?.coordinates) {
    const [lon, lat] = feature.geometry.coordinates;
    return L.latLng(lat, lon);
  }
  
  // If not found in local data, try API for airports
  try {
    const response = await fetch(`/api/data/airport?ids=${identifier}&format=geojson`);
    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return L.latLng(lat, lon);
      }
    }
  } catch (e) {
    console.log("API fetch failed for", identifier);
  }
  
  // Try parsing as coordinates (lat,lon or lat/lon)
  const coordMatch = identifier.match(/^(-?\d+\.?\d*)[,\/]\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return L.latLng(lat, lon);
    }
  }
  
  return null;
}

function drawRoute(waypoints: Array<{name: string, latlng: LatLng}>) {
  if (!mapStore.map) return;
  
  // Draw line
  const latlngs = waypoints.map(w => w.latlng);
  routeLine = L.polyline(latlngs, {
    color: "#e91e63",
    weight: 4,
    opacity: 0.8,
  }).addTo(mapStore.map);
  
  // Add markers
  waypoints.forEach((wp, idx) => {
    const isDeparture = idx === 0;
    const isArrival = idx === waypoints.length - 1;
    
    let markerHtml = "";
    let markerClass = "waypoint";
    
    if (isDeparture) {
      markerHtml = `<div class="route-marker departure">${wp.name}</div>`;
      markerClass = "departure";
    } else if (isArrival) {
      markerHtml = `<div class="route-marker arrival">${wp.name}</div>`;
      markerClass = "arrival";
    } else {
      markerHtml = `<div class="route-marker waypoint">${wp.name}</div>`;
    }
    
    const marker = L.marker(wp.latlng, {
      icon: L.divIcon({
        className: `route-marker-container ${markerClass}`,
        html: markerHtml,
        iconAnchor: [0, 0],
      }),
    }).addTo(mapStore.map!);
    
    marker.bindPopup(`
      <strong>${wp.name}</strong><br>
      ${wp.latlng.lat.toFixed(4)}, ${wp.latlng.lng.toFixed(4)}
    `);
    
    markers.push(marker);
  });
}

function clearRoute() {
  if (!mapStore.map) return;
  
  if (routeLine) {
    mapStore.map.removeLayer(routeLine);
    routeLine = null;
  }
  
  markers.forEach(marker => mapStore.map?.removeLayer(marker));
  markers = [];
  
  routeLegs.value = [];
  totalDistance.value = 0;
  errorMessage.value = "";
}

function formatTime(hours: number): string {
  if (hours === 0) return "0:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function updateTimes() {
  if (speed.value <= 0) return;
  
  routeLegs.value.forEach(leg => {
    leg.time = leg.distance / speed.value;
  });
}
</script>

<style scoped>
.flight-planner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
}

.planner-header {
  display: flex;
  gap: 5px;
  z-index: 1002;
}

.planner-button {
  background: white;
  border: 2px solid #333;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.planner-button:hover {
  background: #f0f0f0;
}

.planner-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.minimize-btn {
  width: 40px;
  padding: 8px;
  background: white;
  border: 2px solid #6c757d;
  border-radius: 4px;
  color: #6c757d;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.minimize-btn:hover {
  background: #6c757d;
  color: white;
}

.flight-plan-panel {
  position: absolute;
  top: 45px;
  left: 0;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 380px;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
}

.flight-plan-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.flight-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: 600;
  font-size: 13px;
  color: #555;
}

.airport-input,
.route-input,
.speed-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
  font-weight: 600;
}

.airport-input:focus,
.route-input:focus,
.speed-input:focus {
  outline: none;
  border-color: #007bff;
}

.input-group small {
  color: #666;
  font-size: 11px;
}

.btn-plot {
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-plot:hover:not(:disabled) {
  background: #218838;
}

.btn-plot:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-msg {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  font-size: 13px;
  margin-top: 10px;
}

.route-display {
  margin-top: 20px;
  border-top: 2px solid #eee;
  padding-top: 15px;
}

.route-display h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #333;
}

.route-legs {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.leg-item {
  display: grid;
  grid-template-columns: 60px 20px 60px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
  font-size: 13px;
}

.leg-item:last-child {
  border-bottom: none;
}

.leg-from,
.leg-to {
  font-weight: 600;
  font-family: monospace;
  min-width: 60px;
}

.leg-arrow {
  color: #007bff;
  font-size: 16px;
}

.leg-distance,
.leg-time {
  color: #666;
  font-weight: 600;
  font-size: 12px;
}

.route-total {
  background: #007bff;
  color: white;
  padding: 12px;
  border-radius: 4px;
  margin-top: 10px;
  text-align: center;
  font-size: 15px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;
}

.route-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-clear {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  background: #dc3545;
  color: white;
}

.btn-clear:hover {
  background: #c82333;
}

/* Waypoint Search Styles */
.waypoint-search {
  position: relative;
  margin: 15px 0;
}

.search-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item.airport {
  border-left: 4px solid #28a745;
}

.search-result-item.navaid {
  border-left: 4px solid #007bff;
}

.search-result-item.fix {
  border-left: 4px solid #ffc107;
}

.result-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.result-ident {
  font-weight: bold;
  font-family: monospace;
  font-size: 14px;
  color: #333;
}

.result-type-badge {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.result-type-badge {
  background: #6c757d;
}

.search-result-item.airport .result-type-badge {
  background: #28a745;
}

.search-result-item.navaid .result-type-badge {
  background: #007bff;
}

.search-result-item.fix .result-type-badge {
  background: #ffc107;
  color: #333;
}

.result-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-coords {
  font-size: 11px;
  color: #999;
  font-family: monospace;
}

.no-results {
  padding: 15px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border: 2px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
}
</style>

<style>
.route-marker-container {
  background: transparent !important;
  border: none !important;
}

.route-marker {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  transform: translate(-50%, -50%);
  position: absolute;
  top: 0;
  left: 0;
}

.route-marker.departure {
  background: #28a745;
  color: white;
}

.route-marker.arrival {
  background: #dc3545;
  color: white;
}

.route-marker.waypoint {
  background: #007bff;
  color: white;
  font-size: 10px;
  padding: 3px 6px;
}
</style>
