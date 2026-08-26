import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeData } from "./services/dataService";

// Initialize localStorage data before app renders
initializeData();

import { ThemeProvider } from "./contexts/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="890020262003-0ba7080apdo8slk5h2jk1e80p13do2sc.apps.googleusercontent.com">
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);
