/**
 * Parse FAA AIXM 5.1 XML files into GeoJSON format
 * Usage: node scripts/parseAIXM.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true
});

function parseNavaids(xmlPath, outputPath) {
  console.log('Reading AIXM XML...');
  const xmlData = readFileSync(xmlPath, 'utf-8');
  
  console.log('Parsing XML...');
  const parsed = parser.parse(xmlData);
  
  const members = parsed['faa:SubscriberFile']['faa:Member'];
  
  const features = [];
  let count = 0;
  
  console.log('Converting to GeoJSON...');
  for (const member of members) {
    const navaid = member['aixm:Navaid'];
    if (!navaid) continue;
    
    const timeSlice = navaid['aixm:timeSlice']?.['aixm:NavaidTimeSlice'];
    if (!timeSlice) continue;
    
    const location = timeSlice['aixm:location']?.['aixm:ElevatedPoint'];
    if (!location) continue;
    
    const pos = location['gml:pos'];
    if (!pos) continue;
    
    const [lon, lat] = pos.split(' ').map(parseFloat);
    
    const designator = timeSlice['aixm:designator'];
    const name = timeSlice['aixm:name'];
    const type = timeSlice['aixm:type'];
    const elevation = location['aixm:elevation']?.['#text'] || location['aixm:elevation'];
    
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {
        ident: designator,
        name: name || '',
        type: type || '',
        elev: elevation ? parseFloat(elevation) : null,
        source: 'AIXM'
      }
    });
    
    count++;
    if (count % 1000 === 0) {
      console.log(`Processed ${count} navaids...`);
    }
  }
  
  const geojson = {
    type: 'FeatureCollection',
    features: features
  };
  
  console.log(`Writing ${features.length} navaids to ${outputPath}...`);
  writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log('Done!');
  
  return features.length;
}

function parseAirports(xmlPath, outputPath) {
  console.log('Reading Airport AIXM XML...');
  const xmlData = readFileSync(xmlPath, 'utf-8');
  
  console.log('Parsing XML...');
  const parsed = parser.parse(xmlData);
  
  const members = parsed['faa:SubscriberFile']['faa:Member'];
  
  const features = [];
  let count = 0;
  
  console.log('Converting airports to GeoJSON...');
  for (const member of members) {
    const airport = member['aixm:AirportHeliport'];
    if (!airport) continue;
    
    const timeSlice = airport['aixm:timeSlice']?.['aixm:AirportHeliportTimeSlice'];
    if (!timeSlice) continue;
    
    const location = timeSlice['aixm:ARP']?.['aixm:ElevatedPoint'];
    if (!location) continue;
    
    const pos = location['gml:pos'];
    if (!pos) continue;
    
    const [lon, lat] = pos.split(' ').map(parseFloat);
    
    const icaoId = timeSlice['aixm:locationIndicatorICAO'];
    const name = timeSlice['aixm:name'];
    const elevation = location['aixm:elevation']?.['#text'] || location['aixm:elevation'];
    
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {
        icaoId: icaoId || '',
        name: name || '',
        elev: elevation ? parseFloat(elevation) : null,
        source: 'AIXM'
      }
    });
    
    count++;
    if (count % 500 === 0) {
      console.log(`Processed ${count} airports...`);
    }
  }
  
  const geojson = {
    type: 'FeatureCollection',
    features: features
  };
  
  console.log(`Writing ${features.length} airports to ${outputPath}...`);
  writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log('Done!');
  
  return features.length;
}

// Parse Navaids
try {
  const navCount = parseNavaids(
    '../AIXM_5.1/XML-Subscriber-Files/NAV_AIXM/NAV_AIXM.xml',
    './public/data/navaids.geojson'
  );
  console.log(`\n✓ Successfully parsed ${navCount} navaids`);
} catch (error) {
  console.error('Error parsing navaids:', error.message);
}

// Parse Airports
try {
  console.log('\n--- Extracting airports ---');
  const aptCount = parseAirports(
    '../AIXM_5.1/XML-Subscriber-Files/APT_AIXM/APT_AIXM.xml',
    './public/data/airports.geojson'
  );
  console.log(`\n✓ Successfully parsed ${aptCount} airports`);
} catch (error) {
  console.error('Error parsing airports:', error.message);
}
