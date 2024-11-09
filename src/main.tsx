import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/reset.css";
import "./styles/colors.css";
import "./styles/index.css";

import App from "./components/app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
