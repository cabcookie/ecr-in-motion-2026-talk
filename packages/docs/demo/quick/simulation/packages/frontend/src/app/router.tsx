import { Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/landing/LandingPage";
import { SimulationPage } from "../pages/simulation/SimulationPage";
import { OutlookPage } from "../pages/outlook/OutlookPage";
import { TeamsPage } from "../pages/teams/TeamsPage";
import { SapPage } from "../pages/sap/SapPage";
import { WmsPage } from "../pages/wms/WmsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulation" element={<SimulationPage />} />
      <Route path="/outlook" element={<OutlookPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/sap" element={<SapPage />} />
      <Route path="/wms" element={<WmsPage />} />
    </Routes>
  );
}
