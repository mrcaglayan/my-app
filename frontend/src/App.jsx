import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import RequireAuth from "./auth/RequireAuth";
import RequirePermission from "./auth/RequirePermission";
import AcilisFisiOlustur from "./pages/AcilisFisiOlustur";
import JournalWorkbenchPage from "./pages/JournalWorkbenchPage";
import CompanyOnboardingPage from "./pages/settings/CompanyOnboardingPage";
import GlSetupPage from "./pages/settings/GlSetupPage";
import HesapPlaniOlustur from "./pages/settings/HesapPlaniOlustur";
import OrganizationManagementPage from "./pages/settings/OrganizationManagementPage";
import RolesPermissionsPage from "./pages/security/RolesPermissionsPage";
import UserAssignmentsPage from "./pages/security/UserAssignmentsPage";
import ScopeAssignmentsPage from "./pages/security/ScopeAssignmentsPage";
import RbacAuditLogsPage from "./pages/security/RbacAuditLogsPage";
import ModulePlaceholderPage from "./pages/ModulePlaceholderPage";
import { collectSidebarLinks, sidebarItems } from "./layouts/sidebarConfig.js";

const sidebarLinks = collectSidebarLinks(sidebarItems);
const sidebarLinkByPath = new Map(sidebarLinks.map((link) => [link.to, link]));

const implementedRoutes = [
  {
    appPath: "/app/acilis-fisi",
    childPath: "acilis-fisi",
    element: <AcilisFisiOlustur />,
  },
  {
    appPath: "/app/mahsup-islemleri",
    childPath: "mahsup-islemleri",
    element: <JournalWorkbenchPage />,
  },
  {
    appPath: "/app/ayarlar/hesap-plani-olustur",
    childPath: "ayarlar/hesap-plani-olustur",
    element: <HesapPlaniOlustur />,
  },
  {
    appPath: "/app/ayarlar/hesap-plani-ayarlari",
    childPath: "ayarlar/hesap-plani-ayarlari",
    element: <GlSetupPage />,
  },
  {
    appPath: "/app/ayarlar/sirket-ayarlari",
    childPath: "ayarlar/sirket-ayarlari",
    element: <CompanyOnboardingPage />,
  },
  {
    appPath: "/app/ayarlar/organizasyon-yonetimi",
    childPath: "ayarlar/organizasyon-yonetimi",
    element: <OrganizationManagementPage />,
  },
  {
    appPath: "/app/ayarlar/rbac/roles-permissions",
    childPath: "ayarlar/rbac/roles-permissions",
    element: <RolesPermissionsPage />,
  },
  {
    appPath: "/app/ayarlar/rbac/user-assignments",
    childPath: "ayarlar/rbac/user-assignments",
    element: <UserAssignmentsPage />,
  },
  {
    appPath: "/app/ayarlar/rbac/scope-assignments",
    childPath: "ayarlar/rbac/scope-assignments",
    element: <ScopeAssignmentsPage />,
  },
  {
    appPath: "/app/ayarlar/rbac/audit-logs",
    childPath: "ayarlar/rbac/audit-logs",
    element: <RbacAuditLogsPage />,
  },
];

const implementedPaths = new Set([
  "/app",
  ...implementedRoutes.map((route) => route.appPath),
]);

const placeholderRoutes = sidebarLinks.filter(
  (link) => link.to.startsWith("/app/") && !implementedPaths.has(link.to)
);

function withPermissionGuard(appPath, element) {
  const requiredPermissions = sidebarLinkByPath.get(appPath)?.requiredPermissions;
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return element;
  }

  return (
    <RequirePermission anyOf={requiredPermissions}>{element}</RequirePermission>
  );
}

function toChildPath(appPath) {
  return appPath.replace(/^\/app\//, "");
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />

        {implementedRoutes.map((route) => (
          <Route
            key={route.appPath}
            path={route.childPath}
            element={withPermissionGuard(route.appPath, route.element)}
          />
        ))}

        {placeholderRoutes.map((link) => (
          <Route
            key={link.to}
            path={toChildPath(link.to)}
            element={withPermissionGuard(
              link.to,
              <ModulePlaceholderPage title={link.label || "Module"} path={link.to} />
            )}
          />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
