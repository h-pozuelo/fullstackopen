import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./client.js";
import { NotificationContextProvider } from "./contexts/NotificationContext.jsx";
import { UserContextProvider } from "./contexts/UserContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <QueryClientProvider client={queryClient}>
      <NotificationContextProvider>
        <BrowserRouter>
          {/* <App /> === children */}
          <App />
        </BrowserRouter>
      </NotificationContextProvider>
    </QueryClientProvider>
  </UserContextProvider>
);
