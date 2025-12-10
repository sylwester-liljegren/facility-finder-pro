import { useFacilities } from "@/hooks/useFacilities";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Facility } from "@/types/facility";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapLibreMap } from "@/components/MapLibreMap";
import { Skeleton } from "@/components/ui/skeleton";

export function FacilityMap() {
  const { data: facilities, isLoading } = useFacilities();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  if (isLoading) {
    return (
      <Card className="h-[400px] md:h-[600px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden rounded-lg">
        <MapLibreMap
          facilities={facilities || []}
          onFacilityClick={setSelectedFacility}
          className="h-[400px] md:h-[600px]"
        />
      </Card>

      <Dialog open={!!selectedFacility} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              {selectedFacility.facility_type && (
                <Badge variant="secondary">{selectedFacility.facility_type.label}</Badge>
              )}
              <div className="space-y-2 text-sm">
                {selectedFacility.kommun && (
                  <p>
                    <span className="font-medium">Kommun:</span>{" "}
                    {selectedFacility.kommun.kommun_namn}
                  </p>
                )}
                {selectedFacility.address && (
                  <p>
                    <span className="font-medium">Adress:</span>{" "}
                    {selectedFacility.address}
                    {selectedFacility.postal_code && `, ${selectedFacility.postal_code}`}
                    {selectedFacility.city && ` ${selectedFacility.city}`}
                  </p>
                )}
                {selectedFacility.facility_geometry?.latitude && (
                  <p>
                    <span className="font-medium">Koordinater:</span>{" "}
                    {selectedFacility.facility_geometry.latitude.toFixed(4)},{" "}
                    {selectedFacility.facility_geometry.longitude?.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
