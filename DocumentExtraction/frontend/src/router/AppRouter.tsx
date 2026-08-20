import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "../components/layout/Layout";
import DocumentGridPage from "../pages/DocumentGridPage";
import LoginPage from "../pages/LoginPage";
import QueryPage from "../pages/QueryPage";
import RegisterPage from "../pages/RegisterPage";
import SchemaBuilderPage from "../pages/SchemaBuilderPage";
import SchemaDetailPage from "../pages/SchemaDetailPage";
import UploadPage from "../pages/UploadPage";
import { useAuthStore } from "../stores/authStore";

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/schemas" element={<SchemaBuilderPage />} />
            <Route path="/schemas/:id" element={<SchemaDetailPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/documents" element={<DocumentGridPage />} />
            <Route path="/query" element={<QueryPage />} />
            <Route path="/" element={<Navigate to="/schemas" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
