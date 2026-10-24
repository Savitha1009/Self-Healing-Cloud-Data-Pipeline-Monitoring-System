import React from "react";
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  RotateCw 
} from "lucide-react";
import { alertApi } from "../services/api";

export default function AlertPanel({ alerts, onAlertUpdated }) {
  const handleAcknowledge = async (alertId) => {
    try {
      await alertApi.acknowledge(alertId);
      if (onAlertUpdated) onAlertUpdated();
    } catch (e) {
      alert("Error acknowledging alert: " + e.message);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertApi.resolve(alertId);
      if (onAlertUpdated) onAlertUpdated();
    } catch (e) {
      alert("Error resolving alert: " + e.message);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return <span className="badge badge-critical">Critical</span>;
      case "warning":
        return <span className="badge badge-warning">Warning</span>;
      default:
        return <span className="badge badge-info">Info</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "1.25rem" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertOctagon size={18} color="#ef4444" />
          Active Incidents & Failure Alerts
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {alerts.filter(a => a.status === "active").length} active
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {alerts.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No incident alerts detected. All pipelines operating within SLA parameters.
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.alert_id}
              style={{
                background: alert.status === "active" ? "rgba(239, 68, 68, 0.05)" : "rgba(255, 255, 255, 0.02)",
                border: alert.status === "active" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {getSeverityBadge(alert.severity)}
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {alert.pipeline_name}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {alert.alert_id}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {alert.status === "active" && (
                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.725rem", padding: "0.2rem 0.5rem" }}
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== "resolved" && (
                    <button
                      onClick={() => handleResolve(alert.alert_id)}
                      className="btn btn-success btn-sm"
                      style={{ fontSize: "0.725rem", padding: "0.2rem 0.5rem" }}
                    >
                      <CheckCircle size={12} />
                      Resolve
                    </button>
                  )}

                  {alert.status === "resolved" && (
                    <span className="badge badge-healthy" style={{ fontSize: "0.7rem" }}>
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                {alert.message}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.725rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Clock size={12} />
                  Detected: {alert.created_at}
                </div>
                {alert.auto_recovery_triggered && (
                  <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                    <ShieldCheck size={13} />
                    Auto-Healing Action Dispatched
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
