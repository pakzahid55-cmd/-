import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from "./i18n/I18nProvider";
import { isDemo } from "./lib/mode";
import { useAuth } from "./store/auth";
import "./index.css";

function Root() {
  const initialize = useAuth((s) => s.initialize);
  React.useEffect(() => {
    void initialize();
  }, [initialize]);

  // HashRouter in demo builds keeps deep links working on any static host
  // (GitHub Pages, CDNs) without server-side SPA fallback.
  const Router = isDemo ? HashRouter : BrowserRouter;
  return (
    <I18nProvider>
      <Router basename={isDemo ? undefined : import.meta.env.BASE_URL}>
        <App />
      </Router>
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
