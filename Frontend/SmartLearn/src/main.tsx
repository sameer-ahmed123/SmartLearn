import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { useAuthStore } from "./store/useAuthStore.ts";

const token = useAuthStore.getState().accessToken

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider userToken={token}>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
);
