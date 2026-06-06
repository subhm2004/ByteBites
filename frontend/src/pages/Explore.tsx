import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import {
  AppPage,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../components/ui/AppUI";

const categories = [
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍔", label: "Burgers" },
  { emoji: "🍣", label: "Sushi" },
  { emoji: "🍛", label: "Indian" },
  { emoji: "🥗", label: "Healthy" },
  { emoji: "🍜", label: "Noodles" },
];

const Explore = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loading || !location) {
    return <LoadingScreen message="Finding restaurants near you..." />;
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow="Explore"
        title={search ? `Results for "${search}"` : "Restaurants near you"}
        subtitle={`${restaurants.length} places delivering to your location`}
      />

      {!search && (
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((c) => (
            <div
              key={c.label}
              className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition hover:border-[#E23744]/20 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#E23744]/30"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {restaurants.map((res) => {
            const [resLng, resLat] = res.autoLocation.coordinates;

            const distance = getDistanceKm(
              location.latitude,
              location.longitude,
              resLat,
              resLng
            );

            return (
              <RestaurantCard
                key={res._id}
                id={res._id}
                name={res.name}
                image={res.image ?? ""}
                distance={`${distance}`}
                isOpen={res.isOpen}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          variant="search"
          emoji="🔍"
          title="No restaurants found"
          subtitle="Try a different search term or check your delivery address"
        />
      )}
    </AppPage>
  );
};

export default Explore;
