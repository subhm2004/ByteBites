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
} from "../components/ui/AppUI";
import { BiMapPin, BiSearch } from "react-icons/bi";

const categories = [
  { emoji: "🍕", label: "Pizza", tint: "from-orange-500/20 to-red-500/10 dark:from-orange-500/25 dark:to-red-900/20" },
  { emoji: "🍔", label: "Burgers", tint: "from-amber-500/20 to-yellow-500/10 dark:from-amber-500/25 dark:to-yellow-900/20" },
  { emoji: "🍣", label: "Sushi", tint: "from-pink-500/20 to-rose-500/10 dark:from-pink-500/25 dark:to-rose-900/20" },
  { emoji: "🍛", label: "Indian", tint: "from-yellow-500/20 to-orange-500/10 dark:from-yellow-500/25 dark:to-orange-900/20" },
  { emoji: "🥗", label: "Healthy", tint: "from-green-500/20 to-emerald-500/10 dark:from-green-500/25 dark:to-emerald-900/20" },
  { emoji: "🍜", label: "Noodles", tint: "from-violet-500/20 to-purple-500/10 dark:from-violet-500/25 dark:to-purple-900/20" },
];

const Explore = () => {
  const { location, city } = useAppData();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const placeLabel =
    restaurants.length === 1
      ? "1 restaurant delivering to you"
      : `${restaurants.length} restaurants delivering to you`;

  const openCount = restaurants.filter((r) => r.isOpen).length;

  return (
    <AppPage>
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#E23744]/10 via-white to-orange-50/80 p-6 dark:border-gray-800 dark:from-[#E23744]/15 dark:via-gray-900 dark:to-gray-900">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#E23744]/10 blur-3xl dark:bg-[#E23744]/20" />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E23744]">
            {search ? "Search results" : "Explore"}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {search ? `"${search}"` : `Hungry in ${city || "your area"}?`}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <BiMapPin className="text-[#E23744]" />
              {placeLabel}
            </span>
            {openCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {openCount} open now
              </span>
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#E23744]/20 bg-white/80 px-3 py-1 text-xs font-semibold text-[#E23744] dark:border-[#E23744]/30 dark:bg-gray-800/80 dark:text-[#ff6b7a]">
              🎟️ Use coupons at checkout
            </span>
            <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300">
              Free delivery on ₹250+
            </span>
          </div>
        </div>
      </div>

      {!search && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            What are you craving?
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => {
              const active = activeCategory === c.label;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() =>
                    setActiveCategory(active ? null : c.label)
                  }
                  className={`flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition duration-200 ${
                    active
                      ? "border-[#E23744] bg-[#E23744]/10 shadow-md shadow-[#E23744]/10 dark:border-[#E23744]/60 dark:bg-[#E23744]/15"
                      : `border-gray-100 bg-gradient-to-br ${c.tint} hover:-translate-y-0.5 hover:border-[#E23744]/20 hover:shadow-md dark:border-gray-800`
                  }`}
                >
                  <span className="text-2xl drop-shadow-sm">{c.emoji}</span>
                  <span
                    className={`text-xs font-bold ${
                      active
                        ? "text-[#E23744] dark:text-[#ff6b7a]"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {search && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <BiSearch className="h-5 w-5 text-[#E23744]" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing results for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {search}
            </span>
          </p>
        </div>
      )}

      {restaurants.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {search ? "Matching restaurants" : "All restaurants"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tap a card to view menu & order
              </p>
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              restaurants.length === 1
                ? "mx-auto max-w-md grid-cols-1"
                : restaurants.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 lg:max-w-3xl"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {restaurants.map((res, index) => {
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
                  featured={restaurants.length <= 2 && index === 0}
                />
              );
            })}
          </div>
        </section>
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
