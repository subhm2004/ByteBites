import L from "leaflet";

type LeafletDefaultIconPrototype = L.Icon.Default & {
  _getIconUrl?: (name: string) => string;
};

const defaultIconProto = L.Icon.Default.prototype as LeafletDefaultIconPrototype;
delete defaultIconProto._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
