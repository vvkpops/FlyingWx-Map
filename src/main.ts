import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { dataLoaderService } from "./services/dataLoader";
import "leaflet/dist/leaflet.css";
import "./styles/main.css";

// Fix for Leaflet default marker icons
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Load aviation data before mounting
console.log('Initializing aviation data...');
dataLoaderService.loadAllData().then(() => {
  console.log('Aviation data ready');
  app.mount("#app");
}).catch(error => {
  console.error('Failed to load aviation data:', error);
  // Mount anyway, but with limited functionality
  app.mount("#app");
});