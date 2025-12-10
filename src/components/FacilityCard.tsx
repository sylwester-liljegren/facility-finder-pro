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

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 gradient-card"
      onClick={onClick}
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
        <div className="space-y-2">
          {facility.kommun && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4 shrink-0" />
              <span>{facility.kommun.kommun_namn}</span>
            </div>
          )}
          {facility.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {facility.address}
                {facility.postal_code && `, ${facility.postal_code}`}
                {facility.city && ` ${facility.city}`}
              </span>
            </div>
          )}
          {facility.facility_type?.code && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{facility.facility_type.code}</span>
            </div>
          )}
        </div>

        {hasCoordinates && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleMapClick}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Visa på karta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}