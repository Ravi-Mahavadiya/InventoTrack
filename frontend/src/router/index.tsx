import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import ProductsPage from "../features/products/ProductsPage";
import ProductDetailPage from "../features/products/ProductDetailPage";
import CategoriesPage from "../features/categories/CategoriesPage";
import StockPage from "../features/stock/StockPage";
import ProfilePage from "../features/profile/ProfilePage";
import AuditLogsPage from "../features/auditLogs/AuditLogsPage";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "stock", element: <StockPage /> },
      { path: "settings", element: <ProfilePage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
