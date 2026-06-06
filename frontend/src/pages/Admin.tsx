import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import type { IRider, IRestaurant } from "../types";
import {
  AppCard,
  AppTabs,
  EmptyState,
  LoadingScreen,
  PageHeader,
  RoleShell,
} from "../components/ui/AppUI";

const Admin = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant[]>([]);
  const [riders, setRiders] = useState<IRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurants);
      setRiders(response.data.riders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <RoleShell>
        <LoadingScreen message="Loading admin panel..." />
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <PageHeader
        eyebrow="Admin"
        title="Verification dashboard"
        subtitle="Review and approve pending restaurants & riders"
      />

      <AppCard className="mb-6 !p-2">
        <AppTabs
          tabs={[
            { key: "restaurant", label: `Restaurants (${restaurant.length})` },
            { key: "rider", label: `Riders (${riders.length})` },
          ]}
          active={tab}
          onChange={(k) => setTab(k as "restaurant" | "rider")}
        />
      </AppCard>

      {tab === "restaurant" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {restaurant.length === 0 ? (
            <div className="col-span-full max-w-lg mx-auto w-full">
              <EmptyState
                variant="success"
                emoji="🎉"
                title="All caught up!"
                subtitle="Every restaurant has been reviewed. New partner requests will show up here."
              />
            </div>
          ) : (
            restaurant.map((r) => (
              <AdminRestaurantCard
                key={r._id}
                restaurant={r}
                onVerify={fetchData}
              />
            ))
          )}
        </div>
      )}

      {tab === "rider" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {riders.length === 0 ? (
            <div className="col-span-full max-w-lg mx-auto w-full">
              <EmptyState
                variant="success"
                emoji="🎉"
                title="All caught up!"
                subtitle="Every rider has been verified. New applications will appear here."
              />
            </div>
          ) : (
            riders.map((r) => (
              <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
            ))
          )}
        </div>
      )}
    </RoleShell>
  );
};

export default Admin;
