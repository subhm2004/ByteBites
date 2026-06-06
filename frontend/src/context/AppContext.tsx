import axios from "axios";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { AppContext } from "./context";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(
    () => typeof navigator !== "undefined" && !!navigator.geolocation
  );
  const [city, setCity] = useState(() =>
    typeof navigator !== "undefined" && navigator.geolocation
      ? "Fetching Location..."
      : "Location unavailable"
  );

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quauntity, setQuauntity] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "customer") return;

    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuauntity(data.cartLength);
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(`${authService}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (active) {
          setUser(data);
          setIsAuth(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "customer") return;

    let active = true;

    (async () => {
      try {
        const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (active) {
          setCart(data.cart || []);
          setSubTotal(data.subtotal || 0);
          setQuauntity(data.cartLength);
        }
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Please Allow Location to continue");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          setLocation({
            latitude,
            longitude,
            formattedAddress: data.display_name || "current location",
          });

          setCity(
            data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "Your Location"
          );
        } catch {
          setLocation({
            latitude,
            longitude,
            formattedAddress: "Current Location",
          });
          setCity("Failed to load");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setLoadingLocation(false);
        setCity("Location denied");
      }
    );
  }, []);

  const value: AppContextType = {
    isAuth,
    loading,
    setIsAuth,
    setLoading,
    setUser,
    user,
    location,
    loadingLocation,
    city,
    cart,
    fetchCart,
    quauntity,
    subTotal,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};
