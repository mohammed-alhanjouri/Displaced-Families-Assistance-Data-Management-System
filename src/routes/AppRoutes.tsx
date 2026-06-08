import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import GlobalSearchPage from "../pages/GlobalSearchPage";
import FamilyProfilePage from "../pages/FamilyProfilePage";
import ReportsPage from "../pages/ReportsPage";
import RegisterFamilyPage from "../pages/RegisterFamilyPage";
import LocalSearchPage from "../pages/LocalSearchPage";
import UpdateFamilyInformation from "../pages/UpdateFamilyInformationPage";
import VulnerabilityAssessment from "../pages/VulnerabilityAssessment";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/global-search" element={<GlobalSearchPage />} />
      <Route path="/families/:nationalID" element={<FamilyProfilePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/logout" element={<div>Logout - Coming Soon</div>} />
      <Route path="/register-family" element={<RegisterFamilyPage />} />
      <Route path="/local-search" element={<LocalSearchPage />} />
      <Route path="/update-family" element={<UpdateFamilyInformation />} />
      <Route
        path="/vulnerability-assessment"
        element={<VulnerabilityAssessment />}
      />
    </Routes>
  );
};

export default AppRoutes;
