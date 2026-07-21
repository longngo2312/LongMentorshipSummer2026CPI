import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import DocumentGridPage from "../pages/DocumentGridPage";
import LoginPage from "../pages/LoginPage";
import QueryPage from "../pages/QueryPage";
import RegisterPage from "../pages/RegisterPage";
import SchemaBuilderPage from "../pages/SchemaBuilderPage";
import UploadPage from "../pages/UploadPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route path="/schemas" element={<SchemaBuilderPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/documents" element={<DocumentGridPage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/" element={<Navigate to="/schemas" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
