import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  RotateCw,
  Bell,
  AlertTriangle
} from "lucide-react";
import { alertApi } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const loadAlerts = async () => {
    try {
      const res = await alertApi.getAll();
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await alertApi.acknowledge(id);
      loadAlerts();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertApi.resolve(id);
      loadAlerts();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const filtered = alerts.filter((alt) => {
    const matchesSearch =
      alt.alert_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.failure_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alt.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || alt.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

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
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <AlertOctagon size={26} color="#ef4444" />
            Failure & SLA Anomaly Alerts
          </h1>
          <p>
            Deterministic threshold alarms and ML anomaly detection triggers with automated recovery dispatch.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search alert ID, pipeline, failure reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <Filter size={14} /> Status:
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses ({alerts.length})</option>
              <option value="active">Active Only</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Severity:
            </div>
            <select
              className="select-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No incident alerts match your filter criteria.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.alert_id}
              className="glass-panel"
              style={{
                padding: "1.25rem",
                borderLeft:
                  alert.severity === "critical"
                    ? "4px solid #ef4444"
                    : alert.severity === "warning"
                    ? "4px solid #f59e0b"
                    : "4px solid #3b82f6"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {getSeverityBadge(alert.severity)}
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                    {alert.pipeline_name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {alert.alert_id} &bull; {alert.pipeline_id}
                  </span>
                </div>

                {/* Status and Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`badge badge-${alert.status === "active" ? "critical" : alert.status === "resolved" ? "healthy" : "warning"}`}>
                    {alert.status.toUpperCase()}
                  </span>

                  {alert.status === "active" && (
                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== "resolved" && (
                    <button
                      onClick={() => handleResolve(alert.alert_id)}
                      className="btn btn-success btn-sm"
                    >
                      <CheckCircle size={13} />
                      Resolve Alert
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.25)",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "#e2e8f0",
                marginBottom: "0.75rem",
                lineHeight: 1.4
              }}>
                {alert.message}
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span>Failure Category: <strong style={{ color: "#93c5fd" }}>{alert.failure_type}</strong></span>
                  <span>Detected At: {alert.created_at}</span>
                  {alert.resolved_at && <span>Resolved At: {alert.resolved_at}</span>}
                </div>

                {alert.auto_recovery_triggered ? (
                  <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                    <ShieldCheck size={14} /> Auto-Recovery Engine Invoked ({alert.recovery_id})
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>
                    Manual Operator Resolution Mode
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
