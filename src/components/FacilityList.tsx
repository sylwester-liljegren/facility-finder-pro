import { useFacilities, useKommuner } from "@/hooks/useFacilities";
import { FacilityCard } from "./FacilityCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Facility } from "@/types/facility";

interface FacilityListProps {
  onFacilityClick?: (facility: Facility) => void;
}

export function FacilityList({ onFacilityClick }: FacilityListProps) {
  const [selectedKommun, setSelectedKommun] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: kommuner, isLoading: kommunerLoading } = useKommuner();

  const filteredFacilities = useMemo(() => {
    if (!facilities) return [];

    return facilities.filter((facility) => {
      const matchesKommun =
        selectedKommun === "all" ||
        facility.kommun_id === parseInt(selectedKommun);
      const matchesSearch =
        !searchQuery ||
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.city?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesKommun && matchesSearch;
    });
  }, [facilities, selectedKommun, searchQuery]);

  if (facilitiesLoading || kommunerLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full max-w-xs" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Sök anläggning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedKommun} onValueChange={setSelectedKommun}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Välj kommun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla kommuner</SelectItem>
              {kommuner?.map((kommun) => (
                <SelectItem key={kommun.id} value={kommun.id.toString()}>
                  {kommun.kommun_namn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedKommun !== "all"
              ? "Inga anläggningar matchar din sökning."
              : "Inga anläggningar hittades."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Visar {filteredFacilities.length} anläggning
            {filteredFacilities.length !== 1 ? "ar" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onClick={() => onFacilityClick?.(facility)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}