import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import "./sentry";
import App from "./App";
import { StripeProvider } from "@/context/StripeContext";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <StripeProvider>
      <App />
    </StripeProvider>
  </HelmetProvider>
);