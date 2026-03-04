import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi, adminApi } from "@/lib/api";
import { Facility, FacilityFormData } from "@/types/facility";
import { toast } from "@/hooks/use-toast";

export function useFacilities(kommunId?: number) {
  return useQuery({
    queryKey: ["facilities", kommunId],
    queryFn: async () => {
      const data = await publicApi.getFacilities(kommunId);
      return data as Facility[];
    },
  });
}

export function useMyFacilities() {
  return useQuery({
    queryKey: ["my-facilities"],
    queryFn: async () => {
      const data = await adminApi.getMyFacilities();
      return data as Facility[];
    },
  });
}

export function useFacility(id: number) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: async () => {
      const data = await publicApi.getFacility(id);
      return data as Facility;
    },
    enabled: !!id,
  });
}

export function useKommuner() {
  return useQuery({
    queryKey: ["kommuner"],
    queryFn: async () => {
      const data = await publicApi.getMunicipalities();
      return data;
    },
  });
}

export function useFacilityTypes() {
  return useQuery({
    queryKey: ["facility_types"],
    queryFn: async () => {
      const data = await publicApi.getFacilityTypes();
      return data;
    },
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FacilityFormData) => {
      const facility = await adminApi.createFacility(formData);
      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["my-facilities"] });
      toast({
        title: "Anläggning skapad",
        description: "Den nya anläggningen har sparats.",
      });
    },
    onError: (error: Error) => {
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
      await adminApi.updateFacility(id, formData);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["my-facilities"] });
      toast({
        title: "Anläggning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    },
    onError: (error: Error) => {
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
      await adminApi.deleteFacility(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["my-facilities"] });
      toast({
        title: "Anläggning borttagen",
        description: "Anläggningen har tagits bort.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort anläggningen: " + error.message,
        variant: "destructive",
      });
    },
  });
}
