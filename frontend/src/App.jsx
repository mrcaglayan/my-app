import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import RequireAuth from "./auth/RequireAuth";
import AcilisFisiOlustur from "./pages/AcilisFisiOlustur";
import HesapPlaniOlustur from "./pages/settings/HesapPlaniOlustur";

export default function App() {
  return (
    <Routes>
      {/* Default entry */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area with sidebar layout */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* /app */}
        <Route index element={<Dashboard />} />
        {/* /app/acilis-fisi */}
        <Route path="acilis-fisi" element={<AcilisFisiOlustur />} />
        {/* /app/hesap-plani-olustur */}
        <Route path="ayarlar/hesap-plani-olustur" element={<HesapPlaniOlustur />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}