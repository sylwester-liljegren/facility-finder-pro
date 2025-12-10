import { Facility } from "@/types/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

export function FacilityCard({ facility, onClick }: FacilityCardProps) {
  const navigate = useNavigate();
  const hasCoordinates = facility.facility_geometry?.latitude && facility.facility_geometry?.longitude;

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to map with facility coordinates as query params
    const lat = facility.facility_geometry?.latitude;
    const lng = facility.facility_geometry?.longitude;
    navigate(`/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(facility.name)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 gradient-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${facility.name}${facility.facility_type ? `, ${facility.facility_type.label}` : ""}${facility.kommun ? `, ${facility.kommun.kommun_namn}` : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{facility.name}</CardTitle>
          {facility.facility_type && (
            <Badge variant="secondary" className="shrink-0">
              {facility.facility_type.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="space-y-2">
          {facility.kommun && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Kommun:</dt>
              <dd>{facility.kommun.kommun_namn}</dd>
            </div>
          )}
          {facility.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Adress:</dt>
              <dd className="truncate">
                {facility.address}
                {facility.postal_code && `, ${facility.postal_code}`}
                {facility.city && ` ${facility.city}`}
              </dd>
            </div>
          )}
        </dl>

        {hasCoordinates && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleMapClick}
            aria-label={`Visa ${facility.name} på kartan`}
          >
            <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
            Visa på karta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}