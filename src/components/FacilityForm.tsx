import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFacilityTypes, useKommuner } from "@/hooks/useFacilities";
import { FacilityFormData, Facility } from "@/types/facility";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { geocodeApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  facility_type_id: z.string().optional(),
  kommun_id: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FacilityFormProps {
  facility?: Facility;
  onSubmit: (data: FacilityFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FacilityForm({ facility, onSubmit, onCancel, isSubmitting }: FacilityFormProps) {
  const { data: facilityTypes } = useFacilityTypes();
  const { data: kommuner } = useKommuner();
  const [isGeocoding, setIsGeocoding] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: facility?.name || "",
      facility_type_id: facility?.facility_type_id?.toString() || "",
      kommun_id: facility?.kommun_id?.toString() || "",
      address: facility?.address || "",
      postal_code: facility?.postal_code || "",
      city: facility?.city || "",
      latitude: facility?.facility_geometry?.latitude?.toString() || "",
      longitude: facility?.facility_geometry?.longitude?.toString() || "",
    },
  });

  const handleGeocode = async () => {
    const address = form.getValues("address");
    const postalCode = form.getValues("postal_code");
    const city = form.getValues("city");
    const kommunId = form.getValues("kommun_id");
    
    // Get kommun name from id
    const kommun = kommuner?.find(k => k.id.toString() === kommunId);

    if (!address && !city && !kommun) {
      toast({
        title: "Adress saknas",
        description: "Ange minst adress, ort eller kommun för att hämta koordinater.",
        variant: "destructive",
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const data = await geocodeApi.geocode({
        address,
        postalCode,
        city,
        kommun: kommun?.kommun_namn,
      });

      if (data.success && data.latitude && data.longitude) {
        form.setValue("latitude", data.latitude.toString());
        form.setValue("longitude", data.longitude.toString());
        toast({
          title: "Koordinater hittade",
          description: `${data.displayName}`,
        });
      } else {
        toast({
          title: "Kunde inte hitta koordinater",
          description: data.error || "Kontrollera adressen och försök igen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid hämtning av koordinater.",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (values: FormValues) => {
    const data: FacilityFormData = {
      name: values.name,
      facility_type_id: values.facility_type_id ? parseInt(values.facility_type_id) : null,
      kommun_id: values.kommun_id ? parseInt(values.kommun_id) : null,
      address: values.address || "",
      postal_code: values.postal_code || "",
      city: values.city || "",
      latitude: values.latitude ? parseFloat(values.latitude) : undefined,
      longitude: values.longitude ? parseFloat(values.longitude) : undefined,
    };
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namn *</FormLabel>
              <FormControl>
                <Input placeholder="Anläggningens namn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facility_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj typ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {facilityTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kommun_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kommun</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kommun" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {kommuner?.map((kommun) => (
                      <SelectItem key={kommun.id} value={kommun.id.toString()}>
                        {kommun.kommun_namn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adress</FormLabel>
              <FormControl>
                <Input placeholder="Gatuadress" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postnummer</FormLabel>
                <FormControl>
                  <Input placeholder="123 45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ort</FormLabel>
                <FormControl>
                  <Input placeholder="Stad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Koordinater</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeocode}
              disabled={isGeocoding}
            >
              {isGeocoding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Hämta från adress
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="59.3293" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="18.0686" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {facility ? "Uppdatera" : "Skapa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
