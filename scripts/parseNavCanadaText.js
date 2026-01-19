/**
 * Parse NavCanada fixes from text file
 * Export your PDF to text first, then run this script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseNavCanadaText() {
  // You can copy-paste the PDF text content here or read from a text file
  const textPath = path.join(__dirname, '../../navcanada-fixes.txt');
  const outputPath = path.join(__dirname, '../public/data/navcanada-fixes.geojson');

  console.log('Reading text file...');
  
  let text;
  try {
    text = fs.readFileSync(textPath, 'utf8');
  } catch (error) {
    console.error('Could not read text file. Please export the PDF to text format first.');
    console.error('Save it as: navcanada-fixes.txt in the root folder');
    return;
  }
  
  const lines = text.split('\n');
  const features = [];
  
  console.log('Parsing fixes...');
  
  for (const line of lines) {
    // Skip empty lines, headers, or page markers
    if (!line.trim() || 
        line.includes('INTERSECTIONS') || 
        line.includes('CO-ORDINATES') ||
        line.includes('(N)LAT') ||
        line.includes('(W)LONG') ||
        line.includes('PLANNING') ||
        line.includes('CANADA FLIGHT') ||
        line.includes('SUPPLEMENT')) {
      continue;
    }
    
    // Match pattern: NAME (with spaces)  LATITUDE  LONGITUDE
    // Example: "ACANU NS    44 47.0    64 38.1"
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
  
  console.log('\nDone!');
  console.log(`Total fixes parsed: ${features.length}`);
  
  // Show sample of first few fixes
  console.log('\nSample fixes:');
  features.slice(0, 10).forEach(f => {
    console.log(`  ${f.properties.ident}: Lat ${f.geometry.coordinates[1].toFixed(4)}°N, Lon ${Math.abs(f.geometry.coordinates[0]).toFixed(4)}°W`);
  });
}

parseNavCanadaText();
