import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from "./i18n/I18nProvider";
import { useAuth } from "./store/auth";
import "./index.css";

function Root() {
  const initialize = useAuth((s) => s.initialize);
  React.useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <I18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
