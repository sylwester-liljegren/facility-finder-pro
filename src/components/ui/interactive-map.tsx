"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Types
interface MarkerData {
  id: string | number;
  position: [number, number];
  color?: "blue" | "red" | "green" | "orange" | "purple";
  size?: "small" | "medium" | "large";
  popup?: {
    title?: string;
    content?: string;
    image?: string;
  };
}

interface CircleData {
  id: string | number;
  center: [number, number];
  radius: number;
  style?: L.PathOptions;
  popup?: string;
}

interface PolygonData {
  id: string | number;
  positions: [number, number][];
  style?: L.PathOptions;
  popup?: string;
}

interface AdvancedMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  circles?: CircleData[];
  polygons?: PolygonData[];
  onMarkerClick?: (marker: MarkerData) => void;
  onMapClick?: (latlng: L.LatLng) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Color mappings for markers
const markerColors: Record<string, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
};

const markerSizes: Record<string, number> = {
  small: 24,
  medium: 32,
  large: 40,
};

// Custom marker icon creator
const createCustomIcon = (
  color: string = "blue",
  size: string = "medium"
): L.DivIcon => {
  const iconSize = markerSizes[size] || 32;
  const colorHex = markerColors[color] || markerColors.blue;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${iconSize}px;
        height: ${iconSize}px;
        background-color: ${colorHex};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${iconSize * 0.4}px;
          height: ${iconSize * 0.4}px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
  });
};

// Map controls component
const MapControls: React.FC<{
  onLocate: () => void;
  onToggleSatellite: () => void;
  isSatellite: boolean;
}> = ({ onLocate, onToggleSatellite, isSatellite }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onLocate}
        className="flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent"
        title="Find my location"
      >
        📍 Hitta mig
      </button>
      <button
        onClick={onToggleSatellite}
        className="flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent"
        title="Toggle satellite view"
      >
        {isSatellite ? "🗺️ Karta" : "🛰️ Satellit"}
      </button>
    </div>
  );
};

// Search component
const SearchControl: React.FC<{
  onSearch: (query: string) => void;
}> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute right-4 top-4 z-[1000] flex gap-2"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Sök plats..."
        className="rounded-lg border border-border bg-background/95 px-3 py-2 text-sm text-foreground shadow-lg backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        🔍
      </button>
    </form>
  );
};

// Map events handler
const MapEventsHandler: React.FC<{
  onMapClick?: (latlng: L.LatLng) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Locate control
const LocateControl: React.FC<{ locate: boolean; onLocated: () => void }> = ({
  locate,
  onLocated,
}) => {
  const map = useMap();

  useEffect(() => {
    if (locate) {
      map.locate({ setView: true, maxZoom: 14 });
      onLocated();
    }
  }, [locate, map, onLocated]);

  return null;
};

// Main component
export const AdvancedMap: React.FC<AdvancedMapProps> = ({
  center = [62.5, 16.5], // Default to Sweden center
  zoom = 5,
  markers = [],
  circles = [],
  polygons = [],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  style = { height: "600px", width: "100%" },
  className = "",
}) => {
  const [isSatellite, setIsSatellite] = useState(false);
  const [shouldLocate, setShouldLocate] = useState(false);

  const tileUrl = isSatellite
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isSatellite
    ? "Tiles &copy; Esri"
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const handleLocate = useCallback(() => {
    setShouldLocate(true);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // We'll handle this via state in parent component if needed
        console.log("Found location:", lat, lon);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }, []);

  const renderMarkers = useMemo(() => {
    return markers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        icon={createCustomIcon(marker.color, marker.size)}
        eventHandlers={{
          click: () => onMarkerClick?.(marker),
        }}
      >
        {marker.popup && (
          <Popup>
            <div className="min-w-[150px]">
              {marker.popup.image && (
                <img
                  src={marker.popup.image}
                  alt={marker.popup.title || ""}
                  className="mb-2 h-24 w-full rounded object-cover"
                />
              )}
              {marker.popup.title && (
                <h3 className="mb-1 font-semibold text-foreground">
                  {marker.popup.title}
                </h3>
              )}
              {marker.popup.content && (
                <p className="text-sm text-muted-foreground">
                  {marker.popup.content}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Marker>
    ));
  }, [markers, onMarkerClick]);

  return (
    <div className={`relative ${className}`} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="rounded-lg"
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <ZoomControl position="topright" />

        <MapEventsHandler onMapClick={onMapClick} />
        <LocateControl
          locate={shouldLocate}
          onLocated={() => setShouldLocate(false)}
        />

        {/* Circles */}
        {circles.map((circle) => (
          <Circle
            key={circle.id}
            center={circle.center}
            radius={circle.radius}
            pathOptions={circle.style}
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {/* Polygons */}
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            positions={polygon.positions}
            pathOptions={polygon.style}
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {/* Markers with optional clustering */}
        {enableClustering && markers.length > 0 ? (
          <MarkerClusterGroup chunkedLoading>
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={createCustomIcon(marker.color, marker.size)}
                eventHandlers={{
                  click: () => onMarkerClick?.(marker),
                }}
              >
                {marker.popup && (
                  <Popup>
                    <div className="min-w-[150px]">
                      {marker.popup.image && (
                        <img
                          src={marker.popup.image}
                          alt={marker.popup.title || ""}
                          className="mb-2 h-24 w-full rounded object-cover"
                        />
                      )}
                      {marker.popup.title && (
                        <h3 className="mb-1 font-semibold text-foreground">
                          {marker.popup.title}
                        </h3>
                      )}
                      {marker.popup.content && (
                        <p className="text-sm text-muted-foreground">
                          {marker.popup.content}
                        </p>
                      )}
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCustomIcon(marker.color, marker.size)}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              {marker.popup && (
                <Popup>
                  <div className="min-w-[150px]">
                    {marker.popup.image && (
                      <img
                        src={marker.popup.image}
                        alt={marker.popup.title || ""}
                        className="mb-2 h-24 w-full rounded object-cover"
                      />
                    )}
                    {marker.popup.title && (
                      <h3 className="mb-1 font-semibold text-foreground">
                        {marker.popup.title}
                      </h3>
                    )}
                    {marker.popup.content && (
                      <p className="text-sm text-muted-foreground">
                        {marker.popup.content}
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          ))
        )}
      </MapContainer>

      {enableSearch && <SearchControl onSearch={handleSearch} />}
      {enableControls && (
        <MapControls
          onLocate={handleLocate}
          onToggleSatellite={() => setIsSatellite(!isSatellite)}
          isSatellite={isSatellite}
        />
      )}
    </div>
  );
};
