import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FacilityPayload {
  name: string;
  facility_type_id?: number | null;
  kommun_id?: number | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  external_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin API request from user: ${user.id}`);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const id = url.searchParams.get("id");
    const kommunId = url.searchParams.get("kommun_id");

    let responseData: unknown;

    switch (req.method) {
      case "GET": {
        switch (action) {
          case "facilities": {
            let query = supabase
              .from("facility")
              .select(`
                *,
                facility_type (*),
                kommun (*),
                facility_geometry (*)
              `);

            if (id) {
              query = query.eq("id", parseInt(id));
            }
            if (kommunId) {
              query = query.eq("kommun_id", parseInt(kommunId));
            }

            const result = await query.order("name");
            if (result.error) throw result.error;
            responseData = result.data;
            break;
          }

          case "facility": {
            if (!id) {
              return new Response(
                JSON.stringify({ success: false, error: "Missing facility id" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const result = await supabase
              .from("facility")
              .select(`
                *,
                facility_type (*),
                kommun (*),
                facility_geometry (*)
              `)
              .eq("id", parseInt(id))
              .single();

            if (result.error) throw result.error;
            responseData = result.data;
            break;
          }

          default:
            return new Response(
              JSON.stringify({ success: false, error: "Invalid GET action. Valid: facilities, facility" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
        break;
      }

      case "POST": {
        if (action !== "create-facility") {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid POST action. Valid: create-facility" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const body: FacilityPayload = await req.json();
        
        if (!body.name?.trim()) {
          return new Response(
            JSON.stringify({ success: false, error: "Facility name is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Creating facility:", body.name);

        // Create facility
        const { data: facility, error: facilityError } = await supabase
          .from("facility")
          .insert({
            name: body.name.trim(),
            facility_type_id: body.facility_type_id,
            kommun_id: body.kommun_id,
            address: body.address,
            postal_code: body.postal_code,
            city: body.city,
            external_id: body.external_id,
          })
          .select()
          .single();

        if (facilityError) throw facilityError;

        // Create geometry if coordinates provided
        if (body.latitude && body.longitude) {
          const { error: geomError } = await supabase
            .from("facility_geometry")
            .insert({
              facility_id: facility.id,
              latitude: body.latitude,
              longitude: body.longitude,
              geom_type: "POINT",
            });

          if (geomError) {
            console.error("Geometry insert error:", geomError);
          }
        }

        // Fetch complete facility with relations
        const { data: completeFacility } = await supabase
          .from("facility")
          .select(`
            *,
            facility_type (*),
            kommun (*),
            facility_geometry (*)
          `)
          .eq("id", facility.id)
          .single();

        responseData = completeFacility;
        console.log("Facility created successfully:", facility.id);
        break;
      }

      case "PUT": {
        if (action !== "update-facility") {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid PUT action. Valid: update-facility" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing facility id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const body: FacilityPayload = await req.json();

        if (!body.name?.trim()) {
          return new Response(
            JSON.stringify({ success: false, error: "Facility name is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Updating facility:", id);

        // Update facility
        const { error: updateError } = await supabase
          .from("facility")
          .update({
            name: body.name.trim(),
            facility_type_id: body.facility_type_id,
            kommun_id: body.kommun_id,
            address: body.address,
            postal_code: body.postal_code,
            city: body.city,
            external_id: body.external_id,
          })
          .eq("id", parseInt(id));

        if (updateError) throw updateError;

        // Update or create geometry
        if (body.latitude && body.longitude) {
          const { data: existingGeom } = await supabase
            .from("facility_geometry")
            .select("facility_id")
            .eq("facility_id", parseInt(id))
            .single();

          if (existingGeom) {
            await supabase
              .from("facility_geometry")
              .update({
                latitude: body.latitude,
                longitude: body.longitude,
                geom_type: "POINT",
              })
              .eq("facility_id", parseInt(id));
          } else {
            await supabase
              .from("facility_geometry")
              .insert({
                facility_id: parseInt(id),
                latitude: body.latitude,
                longitude: body.longitude,
                geom_type: "POINT",
              });
          }
        }

        // Fetch updated facility
        const { data: updatedFacility } = await supabase
          .from("facility")
          .select(`
            *,
            facility_type (*),
            kommun (*),
            facility_geometry (*)
          `)
          .eq("id", parseInt(id))
          .single();

        responseData = updatedFacility;
        console.log("Facility updated successfully:", id);
        break;
      }

      case "DELETE": {
        if (action !== "delete-facility") {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid DELETE action. Valid: delete-facility" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing facility id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Deleting facility:", id);

        const { error: deleteError } = await supabase
          .from("facility")
          .delete()
          .eq("id", parseInt(id));

        if (deleteError) throw deleteError;

        responseData = { deleted: true, id: parseInt(id) };
        console.log("Facility deleted successfully:", id);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
