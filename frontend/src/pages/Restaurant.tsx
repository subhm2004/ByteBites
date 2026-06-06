import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import {
  AppCard,
  AppTabs,
  LoadingScreen,
  RoleShell,
} from "../components/ui/AppUI";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`,
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
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  if (loading) {
    return (
      <RoleShell>
        <LoadingScreen message="Loading your restaurant..." />
      </RoleShell>
    );
  }

  if (!restaurant) {
    return (
      <RoleShell>
        <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl bg-[#E23744]/10 px-4 py-2 text-center text-sm font-semibold text-[#E23744]">
          🍽️ Restaurant Partner Dashboard
        </div>

        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={true}
        />

        <RestaurantOrders restaurantId={restaurant._id} />

        <AppCard className="!p-0 overflow-hidden">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <AppTabs
              tabs={[
                { key: "menu", label: "Menu" },
                { key: "add-item", label: "Add item" },
                { key: "sales", label: "Sales" },
              ]}
              active={tab}
              onChange={(k) => setTab(k as SellerTab)}
            />
          </div>

          <div className="p-5">
            {tab === "menu" && (
              <MenuItems
                items={menuItems}
                onItemDeleted={() => fetchMenuItems(restaurant._id)}
                isSeller={true}
              />
            )}
            {tab === "add-item" && (
              <AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)} />
            )}
            {tab === "sales" && (
              <div className="py-12 text-center">
                <span className="text-4xl">📊</span>
                <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">Sales analytics</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Coming soon</p>
              </div>
            )}
          </div>
        </AppCard>
      </div>
    </RoleShell>
  );
};

export default Restaurant;
