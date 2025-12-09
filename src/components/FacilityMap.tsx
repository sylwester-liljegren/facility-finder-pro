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
import { AdvancedMap } from "@/components/ui/interactive-map";

export function FacilityMap() {
  const { data: facilities, isLoading } = useFacilities();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Convert facilities to map markers
  const markers = facilities
    ?.filter((f) => f.facility_geometry?.latitude && f.facility_geometry?.longitude)
    .map((facility) => ({
      id: facility.id,
      position: [
        facility.facility_geometry!.latitude!,
        facility.facility_geometry!.longitude!,
      ] as [number, number],
      color: "blue" as const,
      size: "medium" as const,
      popup: {
        title: facility.name,
        content: [
          facility.facility_type?.label,
          facility.kommun?.kommun_namn,
          facility.address,
        ]
          .filter(Boolean)
          .join(" • "),
      },
    })) || [];

  const handleMarkerClick = (marker: { id: string | number }) => {
    const facility = facilities?.find((f) => f.id === marker.id);
    if (facility) {
      setSelectedFacility(facility);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar karta...</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        <AdvancedMap
          center={[62.5, 16.5]} // Center of Sweden
          zoom={5}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          enableClustering={true}
          enableSearch={true}
          enableControls={true}
          style={{ height: "600px", width: "100%" }}
        />
        
        {/* Legend */}
        <div className="absolute bottom-20 left-8 z-[1000] rounded-lg bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              {markers.length} anläggningar med koordinater
            </span>
          </div>
        </div>
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
