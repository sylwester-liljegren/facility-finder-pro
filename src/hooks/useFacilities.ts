import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Facility, FacilityFormData } from "@/types/facility";
import { toast } from "@/hooks/use-toast";

export function useFacilities(kommunId?: number) {
  return useQuery({
    queryKey: ["facilities", kommunId],
    queryFn: async () => {
      let query = supabase
        .from("facility")
        .select(`
          *,
          facility_type (*),
          kommun (*),
          facility_geometry (*)
        `)
        .order("name");

      if (kommunId) {
        query = query.eq("kommun_id", kommunId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Facility[];
    },
  });
}

export function useFacility(id: number) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility")
        .select(`
          *,
          facility_type (*),
          kommun (*),
          facility_geometry (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Facility;
    },
    enabled: !!id,
  });
}

export function useKommuner() {
  return useQuery({
    queryKey: ["kommuner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kommun")
        .select("*")
        .order("kommun_namn");
      if (error) throw error;
      return data;
    },
  });
}

export function useFacilityTypes() {
  return useQuery({
    queryKey: ["facility_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_type")
        .select("*")
        .order("label");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FacilityFormData) => {
      const { latitude, longitude, ...facilityData } = formData;

      // Insert facility
      const { data: facility, error: facilityError } = await supabase
        .from("facility")
        .insert(facilityData)
        .select()
        .single();

      if (facilityError) throw facilityError;

      // Insert geometry if coordinates provided
      if (latitude && longitude) {
        const { error: geoError } = await supabase
          .from("facility_geometry")
          .insert({
            facility_id: facility.id,
            latitude,
            longitude,
            geom_type: "Point",
          });

        if (geoError) throw geoError;
      }

      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "Anläggning skapad",
        description: "Den nya anläggningen har sparats.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte skapa anläggningen: " + error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: FacilityFormData & { id: number }) => {
      const { latitude, longitude, ...facilityData } = formData;

      // Update facility
      const { error: facilityError } = await supabase
        .from("facility")
        .update(facilityData)
        .eq("id", id);

      if (facilityError) throw facilityError;

      // Upsert geometry if coordinates provided
      if (latitude !== undefined && longitude !== undefined) {
        const { error: geoError } = await supabase
          .from("facility_geometry")
          .upsert({
            facility_id: id,
            latitude,
            longitude,
            geom_type: "Point",
          });

        if (geoError) throw geoError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "Anläggning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera anläggningen: " + error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("facility").delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "Anläggning borttagen",
        description: "Anläggningen har tagits bort.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort anläggningen: " + error.message,
        variant: "destructive",
      });
    },
  });
}