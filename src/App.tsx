import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import SitesPage from "./components/sites/SitesPage";
import GatewaysPage from "./components/inventory/gateways/GatewaysPage";
import Loads from "./components/inventory/loads/Loads";
import MetersPage from "./components/inventory/meters/MetersPage";
import Charts from "./components/charts/charts";
import ChatPage from "./components/chat/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/sites" replace />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/charts" element={<Charts/>} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/inventory/gateways" element={<GatewaysPage />} />
          <Route path="/inventory/loads" element={<Loads />} />
          <Route path="/inventory/meters" element={<MetersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
