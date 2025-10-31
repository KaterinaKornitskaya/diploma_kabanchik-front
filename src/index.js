import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// глобальные стили
import "./app/styles/reset.css";
import "./app/styles/variables.css";
import "./app/styles/themes.css";
import "./app/styles/globals.css";

import App from "./app/App"; // теперь App в папке app
import { ProOnboardingProvider } from "./processes/pro-onboarding/model";
import reportWebVitals from "./reportWebVitals";

// Инициализируем тему (после импортов — чтобы пройти eslint/import-first)
(function initTheme() {
  try {
    const saved = localStorage.getItem("theme");
    const next = saved === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
  } catch (e) { /* no-op */ }
})();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
       <ProOnboardingProvider>
          <App />
      </ProOnboardingProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
