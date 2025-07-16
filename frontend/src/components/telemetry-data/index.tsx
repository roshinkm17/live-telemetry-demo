import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useMemo } from "react";
import type {
  TelemetryData as TelemetryDataType,
  TelemetryHistoryData,
} from "@/api/types";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapUpdater: React.FC<{
  latitude: number;
  longitude: number;
}> = ({ latitude, longitude }) => {
  const map = useMap();
  const lastPosition = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (latitude !== 0 && longitude !== 0) {
      const newPosition: [number, number] = [latitude, longitude];

      if (
        lastPosition.current[0] !== latitude ||
        lastPosition.current[1] !== longitude
      ) {
        const currentZoom = map.getZoom();

        map.setView(newPosition, currentZoom, {
          animate: true,
          duration: 1,
        });

        lastPosition.current = newPosition;
      }
    }
  }, [latitude, longitude, map]);

  return null;
};

const FlightPathBoundsUpdater: React.FC<{
  telemetryHistory: TelemetryHistoryData[];
}> = ({ telemetryHistory }) => {
  const map = useMap();

  useEffect(() => {
    if (telemetryHistory.length > 0) {
      // Create bounds from all telemetry points
      const bounds = L.latLngBounds(
        telemetryHistory.map((point) => [point.latitude, point.longitude])
      );

      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: [20, 20], // Add 20px padding on all sides
        maxZoom: 18, // Don't zoom in too much
        animate: true,
      });
    }
  }, [telemetryHistory, map]);

  return null;
};

const DirectionalArrows: React.FC<{
  telemetryHistory: TelemetryHistoryData[];
  isLiveData?: boolean;
}> = ({ telemetryHistory, isLiveData = false }) => {
  const arrowPositions = useMemo(() => {
    if (telemetryHistory.length < 2) return [];

    const positions: Array<{
      position: [number, number];
      bearing: number;
      timestamp: string;
    }> = [];

    // For live data, show fewer arrows to avoid clutter
    const maxArrows = isLiveData ? 4 : 8;
    const step = Math.max(1, Math.floor(telemetryHistory.length / maxArrows));

    for (let i = step; i < telemetryHistory.length - step; i += step) {
      const current = telemetryHistory[i];
      const next = telemetryHistory[i + 1];

      if (next) {
        // Calculate bearing (direction) between two points
        const lat1 = (current.latitude * Math.PI) / 180;
        const lat2 = (next.latitude * Math.PI) / 180;
        const deltaLon = ((next.longitude - current.longitude) * Math.PI) / 180;

        const y = Math.sin(deltaLon) * Math.cos(lat2);
        const x =
          Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
        const bearing = (Math.atan2(y, x) * 180) / Math.PI;

        positions.push({
          position: [current.latitude, current.longitude],
          bearing: (bearing + 360) % 360,
          timestamp: current.timestamp,
        });
      }
    }

    return positions;
  }, [telemetryHistory, isLiveData]);

  return (
    <>
      {arrowPositions.map((arrow, index) => (
        <Marker
          key={index}
          position={arrow.position}
          icon={L.divIcon({
            className: "directional-arrow",
            html: `
              <div style="
                width: 0; 
                height: 0; 
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 12px solid ${isLiveData ? "#10b981" : "#2563eb"};
                transform: rotate(${arrow.bearing}deg);
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
              "></div>
            `,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })}
        >
          <Popup>
            <div>
              <span className="text-sm m-0 font-bold">
                {isLiveData ? "Live Direction" : "Direction"}
              </span>
              <br />
              <span className="text-sm m-0">
                {new Date(arrow.timestamp).toLocaleString()}
              </span>
              <br />
              <span className="text-sm m-0">
                Bearing: {Math.round(arrow.bearing)}°
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

interface TelemetryMapDataProps extends TelemetryDataType {
  telemetryHistory?: TelemetryHistoryData[];
  showFlightPath?: boolean;
  isLiveData?: boolean;
}

const TelemetryMapData: React.FC<TelemetryMapDataProps> = ({
  latitude,
  longitude,
  altitude,
  battery,
  telemetryHistory = [],
  showFlightPath = false,
  isLiveData = false,
}) => {
  const mapRef = useRef<L.Map>(null);
  const liveTelemetryRef = useRef<TelemetryHistoryData[]>([]);

  // Track live telemetry data
  useEffect(() => {
    if (isLiveData && latitude !== 0 && longitude !== 0) {
      const newPoint: TelemetryHistoryData = {
        latitude,
        longitude,
        altitude,
        battery,
        timestamp: new Date().toISOString(),
      };

      liveTelemetryRef.current.push(newPoint);

      // Keep only last 20 points for live data to avoid clutter
      if (liveTelemetryRef.current.length > 20) {
        liveTelemetryRef.current = liveTelemetryRef.current.slice(-20);
      }
    }
  }, [latitude, longitude, altitude, battery, isLiveData]);

  // Use live telemetry for arrows if no history provided
  const telemetryForArrows =
    telemetryHistory.length > 0 ? telemetryHistory : liveTelemetryRef.current;

  // Create flight path coordinates from telemetry history
  const flightPathCoordinates = telemetryHistory.map(
    (point) => [point.latitude, point.longitude] as [number, number]
  );

  // Get center coordinates - use current position or first history point
  const centerLat = latitude || telemetryHistory[0]?.latitude || 0;
  const centerLng = longitude || telemetryHistory[0]?.longitude || 0;

  // Calculate bounds for flight path
  const hasFlightPath = showFlightPath && telemetryHistory.length > 1;
  const initialZoom = hasFlightPath ? 10 : 18; // Lower zoom for flight path to show more area

  return (
    <div>
      <MapContainer
        center={[centerLat, centerLng]}
        className="h-[50vh] w-full"
        zoom={initialZoom}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Flight Path */}
        {showFlightPath && flightPathCoordinates.length > 1 && (
          <Polyline
            positions={flightPathCoordinates}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Directional Arrows for Historical Data */}
        {showFlightPath && telemetryHistory.length > 2 && (
          <DirectionalArrows
            telemetryHistory={telemetryHistory}
            isLiveData={false}
          />
        )}

        {/* Directional Arrows for Live Data */}
        {isLiveData && telemetryForArrows.length > 2 && (
          <DirectionalArrows
            telemetryHistory={telemetryForArrows}
            isLiveData={true}
          />
        )}

        {/* Current Position Marker */}
        {(latitude !== 0 || longitude !== 0) && (
          <Marker position={[latitude || 0, longitude || 0]}>
            <Popup>
              <div>
                <span className="text-sm m-0 font-bold">Altitude: </span>
                <span className="text-sm m-0">{Math.round(altitude)} m</span>
                <br />
                <span className="text-sm m-0 font-bold">Battery: </span>
                <span className="text-sm m-0">
                  {Math.round(battery * 100) / 100}%
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Start and End Markers for Flight Path */}
        {showFlightPath && telemetryHistory.length > 0 && (
          <>
            <Marker
              position={[
                telemetryHistory[0].latitude,
                telemetryHistory[0].longitude,
              ]}
              icon={L.divIcon({
                className: "custom-div-icon",
                html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })}
            >
              <Popup>
                <div>
                  <span className="text-sm m-0 font-bold">Start Point</span>
                  <br />
                  <span className="text-sm m-0">
                    {new Date(telemetryHistory[0].timestamp).toLocaleString()}
                  </span>
                </div>
              </Popup>
            </Marker>

            {telemetryHistory.length > 1 && (
              <Marker
                position={[
                  telemetryHistory[telemetryHistory.length - 1].latitude,
                  telemetryHistory[telemetryHistory.length - 1].longitude,
                ]}
                icon={L.divIcon({
                  className: "custom-div-icon",
                  html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                })}
              >
                <Popup>
                  <div>
                    <span className="text-sm m-0 font-bold">End Point</span>
                    <br />
                    <span className="text-sm m-0">
                      {new Date(
                        telemetryHistory[telemetryHistory.length - 1].timestamp
                      ).toLocaleString()}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Only show MapUpdater for real-time data */}
        {!showFlightPath && (latitude !== 0 || longitude !== 0) && (
          <MapUpdater latitude={latitude || 0} longitude={longitude || 0} />
        )}

        {/* Show FlightPathBoundsUpdater for flight path data */}
        {showFlightPath && telemetryHistory.length > 1 && (
          <FlightPathBoundsUpdater telemetryHistory={telemetryHistory} />
        )}
      </MapContainer>
    </div>
  );
};

export default TelemetryMapData;
