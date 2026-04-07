import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@bcgov/bc-sans/css/BC_Sans.css";
import "./index.css";
import App from "./App.tsx";
import AuthProvider from "./auth";

/** Cache time for React Query in milliseconds (5 minutes) */
const QUERY_STALE_TIME_MS = 1000 * 60 * 5;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
