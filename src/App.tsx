// import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // if (!isAuthenticated) {
  //   return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  // }
  // return <DashboardPage />;
  return (
    // <>
    //   <LoginPage />
    //   <DashboardPage />
    // </>
    <AppRoutes />
  );
}

export default App;
