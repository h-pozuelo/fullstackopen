import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationContextProvider } from "./contexts/NotificationContext.jsx";

// La clase "QueryClient" nos permite construir un cliente que actuará como el contexto propuesto por el proveedor "<QueryClientProvider>".
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <NotificationContextProvider>
      {/* <App /> === children */}
      <App />
    </NotificationContextProvider>
  </QueryClientProvider>
);
