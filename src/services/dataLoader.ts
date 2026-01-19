/**
 * Data loader service for aviation data
 * Loads AIXM data from static files
 */

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, any>;
}

interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

class DataLoaderService {
  private navaidsData: GeoJSONFeature[] = [];
  private airportsData: GeoJSONFeature[] = [];
  private fixesData: GeoJSONFeature[] = [];
  private navcanadaFixesData: GeoJSONFeature[] = [];
  private isLoaded = false;

  async loadAllData(): Promise<void> {
    if (this.isLoaded) return;

    console.log('Loading aviation data...');
    
    try {
      // Load navaids from AIXM data
      const navaidResponse = await fetch('/data/navaids.geojson');
      if (navaidResponse.ok) {
        const navaidData: GeoJSONCollection = await navaidResponse.json();
        this.navaidsData = navaidData.features || [];
        console.log(`Loaded ${this.navaidsData.length} navaids from AIXM`);
      }
    } catch (error) {
      console.warn('Could not load navaids data:', error);
    }

    try {
      // Load NavCanada fixes if available
      const navcanadaResponse = await fetch('/data/navcanada-fixes.geojson');
      if (navcanadaResponse.ok) {
        const navcanadaData: GeoJSONCollection = await navcanadaResponse.json();
        this.navcanadaFixesData = navcanadaData.features || [];
        // Merge with fixes data
        this.fixesData = [...this.fixesData, ...this.navcanadaFixesData];
        console.log(`Loaded ${this.navcanadaFixesData.length} NavCanada fixes`);
      }
    } catch (error) {
      console.warn('Could not load NavCanada fixes:', error);
    }

    // Note: We can add airports and fixes when they're parsed
    // For now, these will be loaded from API on-demand

    this.isLoaded = true;
    console.log('Aviation data loaded successfully');
  }

  getNavaidsByBounds(minLat: number, minLon: number, maxLat: number, maxLon: number): GeoJSONFeature[] {
    return this.navaidsData.filter(navaid => {
      const [lon, lat] = navaid.geometry.coordinates;
      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    });
  }

  getAirportsByBounds(minLat: number, minLon: number, maxLat: number, maxLon: number): GeoJSONFeature[] {
    return this.airportsData.filter(airport => {
      const [lon, lat] = airport.geometry.coordinates;
      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    });
  }

  getFixesByBounds(minLat: number, minLon: number, maxLat: number, maxLon: number): GeoJSONFeature[] {
    return this.fixesData.filter(fix => {
      const [lon, lat] = fix.geometry.coordinates;
      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    });
  }

  findByIdentifier(identifier: string): GeoJSONFeature | null {
    // Search navaids
    const navaid = this.navaidsData.find(n => 
      n.properties.ident === identifier
    );
    if (navaid) return navaid;

    // Search airports
    const airport = this.airportsData.find(a => 
      a.properties.icaoId === identifier || 
      a.properties.iataId === identifier
    );
    if (airport) return airport;

    // Search fixes
    const fix = this.fixesData.find(f => 
      f.properties.ident === identifier
    );
    if (fix) return fix;

    return null;
  }

  getAllNavaids(): GeoJSONFeature[] {
    return this.navaidsData;
  }

  getAllAirports(): GeoJSONFeature[] {
    return this.airportsData;
  }

  getAllFixes(): GeoJSONFeature[] {
    return this.fixesData;
  }
}

export const dataLoaderService = new DataLoaderService();
