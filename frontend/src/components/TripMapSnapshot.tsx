import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

const pickupIcon = new L.DivIcon({
  html: "🍽️",
  iconSize: [24, 24],
  className: "",
});

const dropIcon = new L.DivIcon({
  html: "📦",
  iconSize: [24, 24],
  className: "",
});

const Routing = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: {
        styles: [{ color: "#E23744", weight: 4 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]);

  return null;
};

type TripMapSnapshotProps = {
  pickup: { latitude: number; longitude: number } | null;
  dropoff: { latitude: number; longitude: number } | null;
  compact?: boolean;
};

const TripMapSnapshot = ({
  pickup,
  dropoff,
  compact = false,
}: TripMapSnapshotProps) => {
  if (
    !pickup ||
    !dropoff ||
    dropoff.latitude == null ||
    dropoff.longitude == null
  ) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800 ${
          compact ? "h-28" : "h-36"
        }`}
      >
        Map unavailable
      </div>
    );
  }

  const from: [number, number] = [pickup.latitude, pickup.longitude];
  const to: [number, number] = [dropoff.latitude, dropoff.longitude];
  const center: [number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      dragging={!compact}
      className={`w-full rounded-lg ${compact ? "h-28" : "h-36"}`}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={from} icon={pickupIcon}>
        <Popup>Pickup</Popup>
      </Marker>
      <Marker position={to} icon={dropIcon}>
        <Popup>Delivery</Popup>
      </Marker>
      <Routing from={from} to={to} />
    </MapContainer>
  );
};

export default TripMapSnapshot;
