import { Facility } from "@/types/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Tag } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

export function FacilityCard({ facility, onClick }: FacilityCardProps) {
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
      <CardContent className="space-y-2">
        {facility.kommun && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{facility.kommun.kommun_namn}</span>
          </div>
        )}
        {facility.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {facility.address}
              {facility.postal_code && `, ${facility.postal_code}`}
              {facility.city && ` ${facility.city}`}
            </span>
          </div>
        )}
        {facility.facility_type?.code && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="font-mono text-xs">{facility.facility_type.code}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}