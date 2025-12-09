import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const id = url.searchParams.get("id");
    const kommunId = url.searchParams.get("kommun_id");
    const facilityTypeId = url.searchParams.get("facility_type_id");

    console.log(`Public API request: action=${action}, id=${id}, kommun_id=${kommunId}`);

    // Only GET requests allowed for public API
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data: unknown;
    let count: number | null = null;

    switch (action) {
      case "facilities": {
        let query = supabase
          .from("facility")
          .select(`
            *,
            facility_type (*),
            kommun (*),
            facility_geometry (*)
          `, { count: "exact" });

        if (id) {
          query = query.eq("id", parseInt(id));
        }
        if (kommunId) {
          query = query.eq("kommun_id", parseInt(kommunId));
        }
        if (facilityTypeId) {
          query = query.eq("facility_type_id", parseInt(facilityTypeId));
        }

        const result = await query.order("name");
        if (result.error) throw result.error;
        data = result.data;
        count = result.count;
        break;
      }

      case "facilities-map": {
        let query = supabase
          .from("facility")
          .select(`
            id,
            name,
            address,
            city,
            facility_type (code, label),
            kommun (kommun_namn),
            facility_geometry (latitude, longitude)
          `);

        if (kommunId) {
          query = query.eq("kommun_id", parseInt(kommunId));
        }

        const result = await query.not("facility_geometry", "is", null);
        if (result.error) throw result.error;
        
        // Filter to only include facilities with valid coordinates
        data = (result.data as Array<{ facility_geometry: Array<{ latitude: number | null; longitude: number | null }> }>).filter(
          (f) => f.facility_geometry?.[0]?.latitude && f.facility_geometry?.[0]?.longitude
        );
        count = (data as unknown[]).length;
        break;
      }

      case "municipalities": {
        const result = await supabase
          .from("kommun")
          .select("*")
          .order("kommun_namn");
        if (result.error) throw result.error;
        data = result.data;
        count = result.data?.length ?? 0;
        break;
      }

      case "facility-types": {
        const result = await supabase
          .from("facility_type")
          .select("*")
          .order("label");
        if (result.error) throw result.error;
        data = result.data;
        count = result.data?.length ?? 0;
        break;
      }

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action. Valid actions: facilities, facilities-map, municipalities, facility-types",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Public API response: ${count} records`);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        count,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Public API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
