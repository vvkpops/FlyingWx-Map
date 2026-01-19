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
    // Extract the endpoint path from the query
    const endpoint = req.query.endpoint as string;
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // Build the Aviation Weather API URL
    const baseUrl = 'https://aviationweather.gov/api/data';
    const url = new URL(`${baseUrl}${endpoint}`);
    
    // Add query parameters (excluding the endpoint parameter)
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'endpoint' && value) {
        url.searchParams.append(key, value as string);
      }
    });

    console.log('Proxying request to:', url.toString());

    // Make the request to Aviation Weather API
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'User-Agent': 'FlyingWX-Map/1.0',
        'Accept': 'application/json, application/geo+json',
      },
    });

    if (!response.ok) {
      console.error('Aviation Weather API error:', response.status, response.statusText);
      return res.status(response.status).json({
        error: `Aviation Weather API error: ${response.statusText}`,
        status: response.status
      });
    }

    // Get the response data
    const data = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    // Set the appropriate content type and return the data
    res.setHeader('Content-Type', contentType);
    
    // Try to parse as JSON if it's JSON content type
    if (contentType.includes('application/json') || contentType.includes('application/geo+json')) {
      try {
        const jsonData = JSON.parse(data);
        return res.status(200).json(jsonData);
      } catch (parseError) {
        // If JSON parsing fails, return as text
        return res.status(200).send(data);
      }
    }
    
    return res.status(200).send(data);

  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}