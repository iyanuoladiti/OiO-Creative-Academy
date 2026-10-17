import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

// Intercept and suppress external browser extension noise (e.g. MetaMask, wallet injection scripts)
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = typeof reason === "string" ? reason : reason?.message || "";
    const stack = reason?.stack || "";
    if (
      msg.toLowerCase().includes("metamask") ||
      msg.toLowerCase().includes("failed to connect to metamask") ||
      stack.includes("chrome-extension://") ||
      stack.includes("moz-extension://")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener(
    "error",
    (event) => {
      const filename = event.filename || "";
      const msg = event.message || "";
      if (
        filename.startsWith("chrome-extension://") ||
        filename.startsWith("moz-extension://") ||
        msg.toLowerCase().includes("metamask") ||
        msg.toLowerCase().includes("failed to connect to metamask")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
