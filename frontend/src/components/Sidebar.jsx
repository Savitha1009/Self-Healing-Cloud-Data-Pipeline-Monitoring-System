import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  GitBranch, 
  History, 
  AlertOctagon, 
  ShieldAlert, 
  RotateCw, 
  Settings as SettingsIcon,
  Cloud,
  CheckCircle2
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/pipelines", label: "Pipelines", icon: GitBranch },
    { to: "/executions", label: "Execution History", icon: History },
    { to: "/alerts", label: "Failure Alerts", icon: AlertOctagon },
    { to: "/recovery-policies", label: "Recovery Policies", icon: ShieldAlert },
    { to: "/recovery-history", label: "Recovery Logs", icon: RotateCw },
    { to: "/settings", label: "Settings & Cloud", icon: SettingsIcon },
  ];

  return (
    <aside style={{
      width: "250px",
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      gap: "0.5rem"
    }}>
      {/* Navigation Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        <div style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          padding: "0.5rem 0.75rem 0.25rem 0.75rem"
        }}>
          Operations & Observability
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(var(--color-primary-rgb), 0.2)" : "transparent",
                border: isActive ? "1px solid var(--border-light)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease"
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Cloud & Architecture Footer Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700 }}>
          <Cloud size={14} />
          AWS Cloud Architecture
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
          AWS Glue &bull; Step Functions &bull; CloudWatch &bull; S3 &bull; Lambda
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          marginTop: "0.2rem",
          fontSize: "0.68rem",
          color: "var(--color-healthy)",
          fontWeight: 600
        }}>
          <CheckCircle2 size={12} />
          Local Mock Connected
        </div>
      </div>
    </aside>
  );
}
