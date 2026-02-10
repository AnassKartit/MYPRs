import React from "react";
import ReactDOM from "react-dom";
import { I18nProvider } from "./i18n/I18nContext";
import App from "./components/App";

ReactDOM.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
