import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Bell, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  AlertTriangle,
  Palette,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { simulationApi, alertApi } from "../services/api";

export default function Navbar({ onDataChange }) {
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [injecting, setInjecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("cloudheal_theme") || "cyber";
  });

  const themes = [
    { id: "cyber", name: "Cyber Cyan", icon: "⚡", accent: "#06b6d4" },
    { id: "aurora", name: "Aurora Violet", icon: "🌌", accent: "#a855f7" },
    { id: "matrix", name: "Quantum Emerald", icon: "🌲", accent: "#10b981" },
    { id: "light", name: "Arctic Light", icon: "☀️", accent: "#2563eb" },
  ];

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("cloudheal_theme", themeId);
  };

  useEffect(() => {
    // Initial theme set
    const saved = localStorage.getItem("cloudheal_theme") || "cyber";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const fetchAlertsCount = async () => {
    try {
      const res = await alertApi.getAll();
      const active = res.data.filter((a) => a.status === "active").length;
      setActiveAlertCount(active);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectFailure = async () => {
    setInjecting(true);
    try {
      await simulationApi.injectFailure("PIPE-103", "execution_timeout");
      if (onDataChange) onDataChange();
      await fetchAlertsCount();
    } catch (e) {
      alert("Error injecting failure: " + e.message);
    } finally {
      setTimeout(() => setInjecting(false), 800);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Reset all pipeline data, alerts, and recovery logs to default demo state?")) {
      setResetting(true);
      try {
        await simulationApi.resetDefaults();
        if (onDataChange) onDataChange();
        await fetchAlertsCount();
      } catch (e) {
        alert("Error resetting data: " + e.message);
      } finally {
        setTimeout(() => setResetting(false), 500);
      }
    }
  };

  return (
    <header className="navbar-container" style={{
      height: "70px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-navbar)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & System Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--color-primary), #a855f7)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(var(--color-primary-rgb), 0.45)"
          }}>
            <Activity size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              CloudHeal <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>Engine</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
              Autonomous Data Pipeline Observability
            </div>
          </div>
        </div>

        {/* Live Engine Status Pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--color-healthy-bg)",
          border: "1px solid var(--color-healthy-border)",
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          color: "var(--color-healthy)",
          fontWeight: 600
        }}>
          <span className="pulsing-dot" style={{ backgroundColor: "var(--color-healthy)" }}></span>
          Self-Healing: Autonomous
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Interactive Theme Switcher */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.2rem 0.35rem",
          gap: "0.3rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0 0.3rem", fontSize: "0.725rem", color: "var(--text-muted)" }}>
            <Palette size={13} color="var(--color-primary)" />
            <span style={{ fontWeight: 600 }}>Theme:</span>
          </div>
          {themes.map((t) => {
            const isActive = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => applyTheme(t.id)}
                title={`Switch to ${t.name}`}
                style={{
                  background: isActive ? "rgba(var(--color-primary-rgb), 0.25)" : "transparent",
                  border: isActive ? "1px solid var(--border-light)" : "1px solid transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  borderRadius: "6px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.15s ease"
                }}
              >
                <span>{t.icon}</span>
                <span>{t.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Simulation Mode Tag */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(var(--color-primary-rgb), 0.15)",
          border: "1px solid var(--border-light)",
          color: "var(--color-primary)",
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "0.35rem 0.75rem",
          borderRadius: "8px"
        }}>
          <Zap size={14} color="var(--color-primary)" />
          <span>Local Simulation</span>
        </div>

        {/* Failure Injection Button for quick demo */}
        <button
          onClick={handleInjectFailure}
          disabled={injecting}
          className="btn btn-danger btn-sm"
          title="Inject an artificial execution failure to demonstrate self-healing"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <AlertTriangle size={14} />
          {injecting ? "Simulating..." : "Inject Failure"}
        </button>

        {/* Reset Store Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="btn btn-secondary btn-sm"
          title="Reset demonstration state back to default"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <RotateCcw size={13} className={resetting ? "animate-spin-slow" : ""} />
          Reset
        </button>

        {/* Alerts Bell */}
        <a
          href="/alerts"
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            textDecoration: "none"
          }}
        >
          <Bell size={18} />
          {activeAlertCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--color-failed)",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 700,
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow-rose)"
            }}>
              {activeAlertCount}
            </span>
          )}
        </a>
      </div>
    </header>
  );
}
