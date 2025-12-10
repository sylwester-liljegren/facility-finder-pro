import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  address?: string;
  city?: string;
  postalCode?: string;
  kommun?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, city, postalCode, kommun }: GeocodeRequest = await req.json();

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
        // Nominatim requires a User-Agent
        'User-Agent': 'FacilityRegistry/1.0'
      }
    });

    if (!response.ok) {
      console.error("Nominatim error:", response.status, response.statusText);
      throw new Error(`Geocoding service error: ${response.status}`);
    }

    const results = await response.json();
    console.log("Nominatim results:", JSON.stringify(results));

    if (results && results.length > 0) {
      const result = results[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      console.log("Found coordinates:", { latitude, longitude, displayName: result.display_name });

      return new Response(
        JSON.stringify({
          success: true,
          latitude,
          longitude,
          displayName: result.display_name,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      console.log("No results found for query:", searchQuery);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Kunde inte hitta koordinater för angiven adress",
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ett fel uppstod vid geocoding";
    console.error("Geocoding error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
