import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import "../utils/leafletDefaultIcon";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiMapPin, BiPlus, BiTrash } from "react-icons/bi";
import { getErrorMessage } from "../utils/errors";
import {
  AppButton,
  AppCard,
  AppInput,
  AppPage,
  LoadingScreen,
  PageHeader,
} from "../components/ui/AppUI";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };
  return (
    <button
      type="button"
      onClick={locateUser}
      className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-lg transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
    >
      <LuLocateFixed size={16} className="text-[#E23744]" />
      Use current location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const addAddress = async () => {
    if (
      !mobile ||
      !formattedAddress ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("Please select location on map");
      return;
    }
    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        { formattedAddress, mobile, latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Address added");
      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);
      fetchAddresses();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed"));
    } finally {
      setAdding(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppPage narrow>
      <PageHeader
        eyebrow="Delivery"
        title="Your addresses"
        subtitle="Tap on the map to pin your delivery location"
      />

      <div className="space-y-5">
        <AppCard className="overflow-hidden !p-0">
          <div className="relative h-72 w-full sm:h-80">
            <MapContainer
              center={[latitude || 28.6139, longitude || 77.209]}
              zoom={13}
              className="h-full w-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <LocationPicker setLocation={setLocation} />
              <LocateMeButton onLocate={setLocation} />
              {latitude && longitude && (
                <Marker position={[latitude, longitude]} />
              )}
            </MapContainer>
          </div>
        </AppCard>

        {formattedAddress && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            📍 {formattedAddress}
          </div>
        )}

        <AppInput
          type="number"
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <AppButton disabled={adding} onClick={addAddress}>
          {adding ? <BiLoader className="animate-spin" /> : <BiPlus />}
          Save address
        </AppButton>

        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Saved addresses
          </h2>

          {loading ? (
            <LoadingScreen message="Loading..." />
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No addresses saved yet
            </p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/40 transition hover:border-[#E23744]/15 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-[#E23744]/25"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E23744]/10 to-orange-500/10 text-[#E23744] dark:from-[#E23744]/20 dark:to-orange-500/10 dark:text-[#ff6b7a]">
                  <BiMapPin className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                    {addr.formattedAddress}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-[#E23744] dark:text-[#ff6b7a]">📞</span>
                    {addr.mobile}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteAddress(addr._id)}
                  disabled={deletingId === addr._id}
                  className="shrink-0 rounded-xl border border-transparent p-2.5 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/40"
                  aria-label="Delete address"
                >
                  {deletingId === addr._id ? (
                    <BiLoader size={16} className="animate-spin" />
                  ) : (
                    <BiTrash size={16} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppPage>
  );
};

export default AddAddressPage;
