# FlyingWx Navigation Map

A web-based aviation navigation application that displays aviation data on an interactive map with flight planning capabilities.

## Features

- **Interactive Map**: Built with Leaflet.js for smooth navigation and zooming
- **Flight Planning**: Create routes with time calculations and distance measurements
- **Aviation Data Layers**:
  - Navaids (Navigational Aids) - VOR, DME, NDB, TACAN, etc.
  - Airports - With ICAO codes and detailed information
  - Fixes/Waypoints - Navigation waypoints from AIXM and NavCanada data
- **Geolocation**: Automatically centers map on user's current location
- **Layer Toggle Controls**: Show/hide different types of aviation features
- **Feature Details**: Click on any marker to see detailed information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Composition API
- **Mapping**: Leaflet.js
- **State Management**: Pinia
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **Data Sources**: AIXM navigation data, NavCanada fixes

## Live Demo

🌐 **[Visit FlyingWx Navigation Map](https://your-vercel-url.vercel.app)**

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vvkpops/FlyingWx-Map.git)

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vvkpops/FlyingWx-Map.git
cd FlyingWx-Map
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. **One-click Deploy**: Use the deploy button above, or
2. **Manual Deploy**:
   - Fork/clone this repository
   - Connect your GitHub account to Vercel
   - Import this repository
   - Vercel will automatically detect it's a Vite project and configure the build settings

### Environment Variables

For production deployment, you can set these optional environment variables in Vercel:

- `VITE_APP_TITLE`: Custom app title (default: "FlyingWx Navigation Map")
- `VITE_APP_VERSION`: App version (default: "1.0.0")

### Custom Domain

After deployment, you can add a custom domain in your Vercel dashboard.

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