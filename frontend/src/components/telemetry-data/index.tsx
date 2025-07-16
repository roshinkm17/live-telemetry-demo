import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { TelemetryData as TelemetryDataType } from "@/api/types";

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

const TelemetryMapData: React.FC<TelemetryDataType> = ({
  latitude,
  longitude,
  altitude,
  battery,
}) => {
  const mapRef = useRef<L.Map>(null);

  return (
    <div>
      <MapContainer
        center={[latitude || 0, longitude || 0]}
        className="h-[50vh] w-full"
        zoom={18}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
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
        <MapUpdater latitude={latitude || 0} longitude={longitude || 0} />
      </MapContainer>
    </div>
  );
};

export default TelemetryMapData;
