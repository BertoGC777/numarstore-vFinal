import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";
import { StripeProvider } from "@/context/StripeContext";

// Unregister any existing service worker to fix cache issues
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <StripeProvider>
      <App />
    </StripeProvider>
  </HelmetProvider>
);