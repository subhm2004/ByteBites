import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import { useAppData } from "../context/useAppData";
import { getDistanceKm } from "../utils/eta";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import RestaurantReviews from "../components/RestaurantReviews";
import { AppCard, AppPage, LoadingScreen, PageHeader } from "../components/ui/AppUI";

const RestaurantPage = () => {
  const { id } = useParams();
  const { location } = useAppData();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  const distanceKm = useMemo(() => {
    if (!restaurant || !location?.latitude || !location?.longitude) return undefined;
    const [resLng, resLat] = restaurant.autoLocation.coordinates;
    return getDistanceKm(
      location.latitude,
      location.longitude,
      resLat,
      resLng
    );
  }, [restaurant, location]);

  if (loading) {
    return <LoadingScreen message="Loading restaurant..." />;
  }

  if (!restaurant) {
    return (
      <AppPage>
        <p className="text-center text-gray-500">Restaurant not found</p>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <div className="mx-auto max-w-3xl space-y-6">
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={false}
          distanceKm={distanceKm}
        />

        <div>
          <PageHeader
            eyebrow="Menu"
            title="What's on the menu"
            subtitle={`${menuItems.length} items available`}
          />
          <AppCard>
            <MenuItems
              isSeller={false}
              items={menuItems}
              onItemDeleted={() => {}}
            />
          </AppCard>
        </div>

        <div>
          <PageHeader
            eyebrow="Reviews"
            title="Customer ratings"
            subtitle="Real feedback from delivered orders"
          />
          <AppCard>
            <RestaurantReviews restaurantId={restaurant._id} />
          </AppCard>
        </div>
      </div>
    </AppPage>
  );
};

export default RestaurantPage;
