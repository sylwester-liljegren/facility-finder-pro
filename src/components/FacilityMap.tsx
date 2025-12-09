import { useFacilities } from "@/hooks/useFacilities";
import { Card } from "@/components/ui/card";
import { MapPin, Info } from "lucide-react";
import { useState } from "react";
import { Facility } from "@/types/facility";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function FacilityMap() {
  const { data: facilities, isLoading } = useFacilities();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const facilitiesWithCoords = facilities?.filter(
    (f) => f.facility_geometry?.latitude && f.facility_geometry?.longitude
  );

  // Simple map visualization using CSS grid positioning
  // For production, integrate with Mapbox or similar
  const mapBounds = {
    minLat: 55.3,
    maxLat: 69.1,
    minLng: 11.0,
    maxLng: 24.2,
  };

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
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
      <Card className="relative h-[600px] overflow-hidden bg-gradient-to-br from-secondary to-muted">
        {/* Sweden outline (simplified) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg viewBox="0 0 100 200" className="h-full w-auto">
            <path
              d="M50 10 L65 30 L60 50 L70 80 L55 100 L60 130 L50 160 L45 180 L40 170 L35 140 L45 110 L35 80 L45 50 L35 30 Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Facility markers */}
        {facilitiesWithCoords?.map((facility) => {
          const pos = getPosition(
            facility.facility_geometry!.latitude!,
            facility.facility_geometry!.longitude!
          );
          return (
            <button
              key={facility.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => setSelectedFacility(facility)}
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-card px-2 py-1 text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {facility.name}
                </div>
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {facilitiesWithCoords?.length || 0} anläggningar med koordinater
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Klicka på en markör för detaljer</span>
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