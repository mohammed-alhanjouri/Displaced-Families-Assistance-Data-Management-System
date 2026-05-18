import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import GlobalSearchPage from "../pages/GlobalSearchPage";
import ReportsPage from "../pages/ReportsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/global-search" element={<GlobalSearchPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/logout" element={<div>Logout - Coming Soon</div>} />
    </Routes>
  );
};

export default AppRoutes;
