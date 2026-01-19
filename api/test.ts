import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test a simple airport request to see if the API is working
    const testUrl = 'https://aviationweather.gov/api/data/airport?format=geojson&bbox=-80,40,-70,45';
    
    console.log('Testing direct API call to:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'FlyingWX-Map/1.0',
        'Accept': 'application/json, application/geo+json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      return res.status(500).json({
        error: `API error: ${response.status} ${response.statusText}`,
        body: errorText,
        url: testUrl
      });
    }

    const data = await response.text();
    console.log('Response data length:', data.length);
    console.log('Response data preview:', data.substring(0, 500));

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      return res.status(200).json({
        success: true,
        dataLength: data.length,
        featureCount: jsonData.features?.length || 0,
        data: jsonData
      });
    } catch (parseError) {
      return res.status(200).json({
        success: true,
        dataLength: data.length,
        parseError: parseError.message,
        rawData: data.substring(0, 1000)
      });
    }

  } catch (error: any) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    });
  }
}