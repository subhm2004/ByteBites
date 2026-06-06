import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import ProtectedRoute from "./components/protectedRote";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/useAppData";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <h1 className="text-2xl font-bold text-red-500 text-center mt-56">
        Loading...
      </h1>
    );
  }

  if (user && user.role === "seller") {
    return <Restaurant />;
  }
  if (user && user.role === "rider") {
    return <RiderDashboard />;
  }

  if (user && user.role === "admin") {
    return <Admin />;
  }
  return (
    <>
      <BrowserRouter>
        <CustomerRoutes />
      </BrowserRouter>
    </>
  );
};

const CustomerRoutes = () => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/explore" element={<Explore />} />
            <Route
              path="/paymentsuccess/:paymentId"
              element={<PaymentSuccess />}
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/ordersuccess" element={<OrderSuccess />} />
            <Route path="/address" element={<AddAddressPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
    </>
  );
};

export default App;
