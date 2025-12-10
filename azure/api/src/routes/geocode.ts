import { Router, Request, Response } from 'express';

const router = Router();

interface GeocodeRequest {
  address?: string;
  city?: string;
  postalCode?: string;
  kommun?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

// POST /api/geocode
router.post('/', async (req: Request, res: Response) => {
  try {
    const { address, city, postalCode, kommun }: GeocodeRequest = req.body;

    // Build search query from available fields
    const queryParts: string[] = [];
    if (address) queryParts.push(address);
    if (postalCode) queryParts.push(postalCode);
    if (city) queryParts.push(city);
    if (kommun) queryParts.push(kommun);
    queryParts.push("Sweden"); // Always search in Sweden

    const searchQuery = queryParts.join(", ");
    
    console.log("Geocoding query:", searchQuery);

    // Use Nominatim (OpenStreetMap) for geocoding - free, no API key required
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=se`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FacilityRegistry/1.0'
      }
    });

    if (!response.ok) {
      console.error("Nominatim error:", response.status, response.statusText);
      throw new Error(`Geocoding service error: ${response.status}`);
    }

    // Type assertion needed for proper TypeScript compilation in Azure
    const results = await response.json() as NominatimResult[];
    console.log("Nominatim results:", JSON.stringify(results));

    if (results && results.length > 0) {
      const result = results[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      console.log("Found coordinates:", { latitude, longitude, displayName: result.display_name });

      return res.json({
        success: true,
        latitude,
        longitude,
        displayName: result.display_name,
      });
    } else {
      console.log("No results found for query:", searchQuery);
      return res.json({
        success: false,
        error: "Kunde inte hitta koordinater för angiven adress",
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ett fel uppstod vid geocoding";
    console.error("Geocoding error:", errorMessage);
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export { router as geocodeRouter };
