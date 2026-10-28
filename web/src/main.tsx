import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Ordem de cascata: tokens definem as custom properties, base o reset,
// components/pages os blocos de UI, design-system o showcase e prototype
// por último para sobrescrever ajustes do protótipo.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/design-system.css";
import "./styles/prototype.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
