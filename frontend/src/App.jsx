import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import PipelineDetails from "./pages/PipelineDetails";
import ExecutionHistory from "./pages/ExecutionHistory";
import Alerts from "./pages/Alerts";
import RecoveryPolicies from "./pages/RecoveryPolicies";
import RecoveryHistory from "./pages/RecoveryHistory";
import Settings from "./pages/Settings";
import "./App.css";

export default function App() {
  const [dataVersion, setDataVersion] = useState(0);

  const handleGlobalRefresh = () => {
    setDataVersion((v) => v + 1);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar onDataChange={handleGlobalRefresh} />
          <Routes>
            <Route path="/" element={<Dashboard key={dataVersion} />} />
            <Route path="/pipelines" element={<Pipelines key={dataVersion} />} />
            <Route path="/pipelines/:id" element={<PipelineDetails key={dataVersion} />} />
            <Route path="/executions" element={<ExecutionHistory key={dataVersion} />} />
            <Route path="/alerts" element={<Alerts key={dataVersion} />} />
            <Route path="/recovery-policies" element={<RecoveryPolicies key={dataVersion} />} />
            <Route path="/recovery-history" element={<RecoveryHistory key={dataVersion} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
