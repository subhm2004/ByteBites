import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

const serviceUrl = (key: keyof ImportMetaEnv, localFallback: string) =>
  import.meta.env[key] || localFallback;

export const authService = serviceUrl("VITE_AUTH_SERVICE", "http://localhost:5007");
export const restaurantService = serviceUrl(
  "VITE_RESTAURANT_SERVICE",
  "http://localhost:5001"
);
export const utilsService = serviceUrl("VITE_UTILS_SERVICE", "http://localhost:5002");
export const realtimeService = serviceUrl(
  "VITE_REALTIME_SERVICE",
  "http://localhost:5004"
);
export const riderService = serviceUrl("VITE_RIDER_SERVICE", "http://localhost:5005");
export const adminService = serviceUrl("VITE_ADMIN_SERVICE", "http://localhost:5006");

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("VITE_GOOGLE_CLIENT_ID is missing in frontend/.env");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppProvider>
        <ThemeProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </ThemeProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
