/**
 * Parse NavCanada fixes PDF and convert to GeoJSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function parseNavCanadaPDF() {
  const pdfPath = path.join(__dirname, '../../Fixes in Navcanada.pdf');
  const outputPath = path.join(__dirname, '../public/data/navcanada-fixes.geojson');

  console.log('Reading PDF file...');
  const dataBuffer = fs.readFileSync(pdfPath);

  console.log('Parsing PDF content...');
  const data = await pdfParse(dataBuffer);
  
  console.log(`Total pages: ${data.numpages}`);
  console.log('Extracting text...');
  
  const text = data.text;
  const lines = text.split('\n');
  
  const features = [];
  
  // Pattern to match NavCanada format:
  // FIX_NAME    LAT_DEG LAT_MIN    LONG_DEG LONG_MIN
  // ACANU NS    44 47.0            64 38.1
  // The longitude appears to be W (negative) by default for Canada
  
  for (const line of lines) {
    // Skip empty lines, headers, or page markers
    if (!line.trim() || 
        line.includes('INTERSECTIONS') || 
        line.includes('CO-ORDINATES') ||
        line.includes('(N)LAT') ||
        line.includes('(W)LONG') ||
        line.includes('PLANNING') ||
        line.includes('CANADA FLIGHT')) {
      continue;
    }
    
    // Match pattern: NAME (with spaces)  LATITUDE  LONGITUDE
    // Example: "ACANU NS    44 47.0    64 38.1"
    // More flexible regex to handle various spacing
    const match = line.match(/^([A-Z]{2,6}\s*[A-Z]{0,3})\s+(\d{1,2})\s+(\d{1,2}\.?\d*)\s+(\d{1,3})\s+(\d{1,2}\.?\d*)/);
    
    if (match) {
      const [_, ident, latDeg, latMin, lonDeg, lonMin] = match;
      
      // Convert degrees and decimal minutes to decimal degrees
      const lat = parseInt(latDeg) + parseFloat(latMin) / 60;
      // Canada is in Western hemisphere, so longitude is negative
      const lon = -(parseInt(lonDeg) + parseFloat(lonMin) / 60);
      
      const fixIdent = ident.trim();
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          ident: fixIdent,
          source: 'NavCanada',
          type: 'FIX',
          region: 'Canada'
        }
      });
      
      if (features.length % 100 === 0) {
        console.log(`Parsed ${features.length} fixes...`);
      }
    }
  }
  
  // Create GeoJSON collection
  const geoJSON = {
    type: 'FeatureCollection',
    features: features
  };
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to file
  console.log(`Writing ${features.length} fixes to ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2));
  
  console.log('Done!');
  console.log(`Total fixes parsed: ${features.length}`);
  
  // Show sample of first few fixes
  console.log('\nSample fixes:');
  features.slice(0, 10).forEach(f => {
    console.log(`  ${f.properties.ident}: Lat ${f.geometry.coordinates[1].toFixed(4)}°N, Lon ${Math.abs(f.geometry.coordinates[0]).toFixed(4)}°W`);
  });
}

parseNavCanadaPDF().catch(console.error);
