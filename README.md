# Aviation Navigation App

A web-based aviation navigation application that displays real-time aviation data from the AviationWeather.gov API on an interactive map, similar to SkyVector.

## Features

- **Interactive Map**: Built with Leaflet.js for smooth navigation and zooming
- **Real-time Aviation Data**: Integration with AviationWeather.gov API
- **Multiple Data Layers**:
  - Navaids (Navigational Aids) - VOR, DME, NDB, TACAN, etc.
  - Airports - With ICAO codes and detailed information
  - Fixes/Waypoints - Navigation waypoints
  - Obstacles (coming soon)
- **Layer Toggle Controls**: Show/hide different types of aviation features
- **Feature Details**: Click on any marker to see detailed information
- **Responsive Sidebar**: Collapsible sidebar showing data statistics and selected feature details
- **Bounding Box Queries**: Automatically loads data for the current map view

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API with TypeScript)
- **State Management**: Pinia
- **Mapping Library**: Leaflet
- **API Client**: Axios
- **Build Tool**: Vite
- **Language**: TypeScript

## Project Structure

```
aviation-nav-app/
 public/
    index.html
    assets/
 src/
    api/
       aviationWeatherClient.ts      # Base API client
       endpoints/                    # API endpoint modules
          navaid.ts
          airport.ts
          fix.ts
          obstacle.ts
          stationInfo.ts
          feature.ts
       types/
           apiResponses.ts           # TypeScript interfaces
    components/
       map/
          MapContainer.vue          # Main map component
          MapControls.vue           # Layer controls
          MapLayers.vue             # Marker rendering
       navigation/                   # Individual marker components
       search/                       # Search functionality
       ui/
           Sidebar.vue               # Collapsible sidebar
           InfoPanel.vue
           LayerControl.vue
    composables/
       useAviationData.ts            # Aviation data fetching
       useMap.ts                     # Map utilities
       useGeolocation.ts             # User geolocation
    stores/
       mapStore.ts                   # Map state management
       navigationStore.ts            # Aviation data state
       userPreferencesStore.ts       # User settings
    styles/
       main.css
       map.css
    utils/
       coordinates.ts
       formatters.ts
       mapHelpers.ts
    App.vue
    main.ts
 package.json
 tsconfig.json
 vite.config.ts
 README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aviation-nav-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Loading Data**: 
   - Toggle the layers you want to view (Navaids, Airports, Fixes)
   - Click the "Load Data" button to fetch aviation data for the current map view

2. **Map Navigation**:
   - Pan: Click and drag the map
   - Zoom: Use mouse wheel or the +/- controls
   - The app will load new data when you move to a different area

3. **Feature Details**:
   - Click on any marker to see detailed information
   - The sidebar will display the selected feature's properties

4. **Layer Controls**:
   - Use checkboxes in the control panel to show/hide different layers
   - Toggle the sidebar using the arrow button

## API Reference

The app uses the AviationWeather.gov API (https://aviationweather.gov/api/data):

- `/navaid` - Navigational aids (VOR, DME, NDB, etc.)
- `/airport` - Airport information with ICAO codes
- `/fix` - Navigation waypoints and fixes
- `/obstacle` - Aviation obstacles
- `/stationinfo` - Weather station information
- `/feature` - Additional geographic features

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Future Enhancements

- [ ] Search functionality for airports and navaids
- [ ] Route planning and drawing tools
- [ ] Weather overlay (METARs, TAFs)
- [ ] Airspace boundaries (Class A-G)
- [ ] Flight tracking
- [ ] Offline mode with cached data
- [ ] Export/import flight plans
- [ ] User accounts and saved preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Aviation data provided by [AviationWeather.gov](https://aviationweather.gov/)
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/)
- Inspired by [SkyVector](https://skyvector.com/)