import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import { StoreProvider } from "./contexts/StoreContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <StoreProvider>
              <App />
            </StoreProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
