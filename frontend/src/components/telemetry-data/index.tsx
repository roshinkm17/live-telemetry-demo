import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useMemo } from "react";
import type { TelemetryHistoryData } from "@/api/types";
import { L } from "./leaflet-config";
import type { TelemetryMapDataProps } from "./types";

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
      const bounds = L.latLngBounds(
        telemetryHistory.map((point) => [point.latitude, point.longitude])
      );

      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 18,
        animate: true,
      });
    }
  }, [telemetryHistory, map]);

  return null;
};

const TelemetryPopup: React.FC<{
  altitude: number;
  battery: number;
}> = ({ altitude, battery }) => {
  return (
    <Popup>
      <div>
        <span className="text-sm m-0 font-bold">Altitude: </span>
        <span className="text-sm m-0">{Math.round(altitude)} m</span>
        <br />
        <span className="text-sm m-0 font-bold">Battery: </span>
        <span className="text-sm m-0">{Math.round(battery * 100) / 100}%</span>
      </div>
    </Popup>
  );
};

const TelemetryMapData: React.FC<TelemetryMapDataProps> = ({
  latitude,
  longitude,
  altitude,
  battery,
  telemetryHistory = [],
  showFlightPath = false,
}) => {
  const mapRef = useRef<L.Map>(null);

  const flightPathCoordinates = useMemo(
    () =>
      telemetryHistory.map(
        (point) => [point.latitude, point.longitude] as [number, number]
      ),
    [telemetryHistory]
  );

  const centerLat = latitude || telemetryHistory[0]?.latitude || 0;
  const centerLng = longitude || telemetryHistory[0]?.longitude || 0;

  const hasFlightPath = showFlightPath && telemetryHistory.length > 1;
  const initialZoom = hasFlightPath ? 10 : 18;

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

        {/* Current Position Marker */}
        {(latitude !== 0 || longitude !== 0) && (
          <Marker position={[latitude || 0, longitude || 0]}>
            <TelemetryPopup altitude={altitude} battery={battery} />
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
              <TelemetryPopup
                altitude={telemetryHistory[0].altitude}
                battery={telemetryHistory[0].battery}
              />
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
                <TelemetryPopup
                  altitude={
                    telemetryHistory[telemetryHistory.length - 1].altitude
                  }
                  battery={
                    telemetryHistory[telemetryHistory.length - 1].battery
                  }
                />
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
