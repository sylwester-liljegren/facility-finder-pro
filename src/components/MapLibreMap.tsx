import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Facility } from "@/types/facility";

interface MapLibreMapProps {
  facilities: Facility[];
  onFacilityClick?: (facility: Facility) => void;
  className?: string;
}

export function MapLibreMap({ facilities, onFacilityClick, className }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter facilities with coordinates
  const facilitiesWithCoords = facilities.filter(
    (f) => f.facility_geometry?.latitude && f.facility_geometry?.longitude
  );

  // Search filtered facilities
  const filteredFacilities = searchQuery
    ? facilitiesWithCoords.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.kommun?.kommun_namn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.facility_type?.label?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : facilitiesWithCoords;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on Sweden
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [16.5, 62.5], // Sweden center [lng, lat]
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 18,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add geolocation control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredFacilities.forEach((facility) => {
      const lat = facility.facility_geometry!.latitude!;
      const lng = facility.facility_geometry!.longitude!;

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "facility-marker";
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: hsl(var(--primary));
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
      `;
      el.onmouseenter = () => {
        el.style.transform = "scale(1.2)";
      };
      el.onmouseleave = () => {
        el.style.transform = "scale(1)";
      };

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: "facility-popup",
      }).setHTML(`
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 4px; color: hsl(var(--foreground));">${facility.name}</h3>
          ${facility.facility_type ? `<p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 2px;">${facility.facility_type.label}</p>` : ""}
          ${facility.kommun ? `<p style="font-size: 12px; color: hsl(var(--muted-foreground));">${facility.kommun.kommun_namn}</p>` : ""}
          ${facility.address ? `<p style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-top: 4px;">${facility.address}</p>` : ""}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle click
      el.addEventListener("click", () => {
        if (onFacilityClick) {
          onFacilityClick(facility);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (filteredFacilities.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      filteredFacilities.forEach((f) => {
        bounds.extend([
          f.facility_geometry!.longitude!,
          f.facility_geometry!.latitude!,
        ]);
      });

      // Only fit bounds on initial load or when search changes significantly
      if (searchQuery) {
        map.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 12,
          duration: 500,
        });
      }
    }
  }, [filteredFacilities, onFacilityClick, searchQuery]);

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="text"
          placeholder="Sök anläggning, kommun eller typ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-72 px-4 py-2 rounded-lg bg-background/95 backdrop-blur border border-border shadow-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-10 rounded-lg bg-background/95 backdrop-blur p-3 shadow-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-4 rounded-full bg-primary border-2 border-white shadow" />
          <span className="text-muted-foreground">
            {filteredFacilities.length} anläggningar
            {searchQuery && ` (av ${facilitiesWithCoords.length})`}
          </span>
        </div>
      </div>
    </div>
  );
}
