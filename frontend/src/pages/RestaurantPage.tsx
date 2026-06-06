import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import { AppCard, AppPage, LoadingScreen, PageHeader } from "../components/ui/AppUI";

const RestaurantPage = () => {
  const { id } = useParams();

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
      </div>
    </AppPage>
  );
};

export default RestaurantPage;
