import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@bcgov/bc-sans/css/BC_Sans.css";
import "./index.css";
import App from "./App.tsx";
import { init } from "./auth";

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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const renderApp = () => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
};

const renderError = (message: string) => {
  root.render(
    <StrictMode>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Authentication Error</h1>
        <p>{message}</p>
        <button
          onClick={() => globalThis.location.reload()}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    </StrictMode>,
  );
};

const renderLoading = () => {
  root.render(
    <StrictMode>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Initializing...</p>
      </div>
    </StrictMode>,
  );
};

const bootstrap = async () => {
  renderLoading();
  try {
    await init();
    renderApp();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    renderError(message);
  }
};

bootstrap();
