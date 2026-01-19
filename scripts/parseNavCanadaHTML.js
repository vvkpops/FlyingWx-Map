/**
 * Parse NavCanada fixes from HTML export
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseNavCanadaHTML() {
  const htmlPath = path.join(__dirname, '../../..', 'Fixes in Navcanada.html');
  const outputPath = path.join(__dirname, '../public/data/navcanada-fixes.geojson');

  console.log('Reading HTML file...');
  
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    console.error('Could not read HTML file:', error);
    return;
  }
  
  // Extract text more carefully, preserving the structure
  // First, extract all text content from divs
  const divRegex = /<div[^>]*>(.*?)<\/div>/gs;
  const divMatches = [...html.matchAll(divRegex)];
  
  const lines = divMatches.map(match => {
    return match[1]
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/\./g, ' ')  // Replace dots (used for spacing) with spaces
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
  }).filter(line => line.length > 0);
  
  const features = [];
  
  console.log('Parsing fixes...');
  console.log(`Total lines: ${lines.length}`);
  
  // Debug: show first few meaningful lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].length > 20 && !lines[i].includes('INTERSECTIONS')) {
      console.log(`Sample line ${i}: "${lines[i].substring(0, 100)}"`);
    }
  }
  
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
    
    // Match pattern: FIX_NAME (5 chars) PROVINCE (2 chars) LAT_DEG LAT_MIN LAT_SEC LON_DEG LON_MIN LON_SEC
    // Example: "ACADN NS 44 40 0 64 00 0"
    // Format: degrees minutes seconds for both lat and lon
    const match = line.match(/([A-Z]{5})\s+([A-Z]{2})\s+(\d{1,2})\s+(\d{1,2}\.?\d*)\s+(\d{1,2}\.?\d*)\s+(\d{1,3})\s+(\d{1,2}\.?\d*)\s+(\d{1,2}\.?\d*)/);
    
    if (match) {
      const [_, fixName, province, latDeg, latMin, latSec, lonDeg, lonMin, lonSec] = match;
      
      // Debug first few matches
      if (features.length < 5) {
        console.log(`Match: ${fixName} ${province} | Lat: ${latDeg}°${latMin}'${latSec}" | Lon: ${lonDeg}°${lonMin}'${lonSec}"`);
      }
      
      // Convert degrees, minutes, seconds to decimal degrees
      // Formula: degrees + minutes/60 + seconds/3600
      const lat = parseInt(latDeg) + parseFloat(latMin) / 60 + parseFloat(latSec) / 3600;
      // Canada is in Western hemisphere, so longitude is negative
      const lon = -(parseInt(lonDeg) + parseFloat(lonMin) / 60 + parseFloat(lonSec) / 3600);
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          ident: fixName,
          province: province,
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
  console.log(`\nWriting ${features.length} fixes to ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2));
  
  console.log('\nDone!');
  console.log(`Total NavCanada fixes parsed: ${features.length}`);
  
  // Show sample of first few fixes by province
  console.log('\nSample fixes:');
  const byProvince = {};
  features.forEach(f => {
    const prov = f.properties.province;
    if (!byProvince[prov]) byProvince[prov] = [];
    byProvince[prov].push(f);
  });
  
  Object.keys(byProvince).sort().slice(0, 5).forEach(prov => {
    console.log(`\n  ${prov} (${byProvince[prov].length} fixes):`);
    byProvince[prov].slice(0, 3).forEach(f => {
      console.log(`    ${f.properties.ident}: Lat ${f.geometry.coordinates[1].toFixed(4)}°N, Lon ${Math.abs(f.geometry.coordinates[0]).toFixed(4)}°W`);
    });
  });
}

parseNavCanadaHTML();
