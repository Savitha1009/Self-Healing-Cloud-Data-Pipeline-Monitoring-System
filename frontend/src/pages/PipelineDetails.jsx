import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  AlertTriangle, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Play, 
  Layers, 
  Settings,
  Cpu,
  BarChart2
} from "lucide-react";
import { 
  pipelineApi, 
  alertApi, 
  recoveryApi, 
  executionApi, 
  simulationApi 
} from "../services/api";

export default function PipelineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recoveries, setRecoveries] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, aRes, rRes, eRes] = await Promise.all([
        pipelineApi.getById(id),
        alertApi.getAll(),
        recoveryApi.getHistory(),
        executionApi.getAll()
      ]);

      setPipeline(pRes.data);
      setAlerts(aRes.data.filter((a) => a.pipeline_id === id));
      setRecoveries(rRes.data.filter((r) => r.pipeline_id === id));
      setExecutions(eRes.data.filter((e) => e.pipeline_id === id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSimulateFailure = async () => {
    setActionLoading(true);
    try {
      await simulationApi.injectFailure(id, "execution_timeout");
      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfHeal = async () => {
    setActionLoading(true);
    try {
      await pipelineApi.recover(id);
      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setTimeout(() => {
        setActionLoading(false);
        loadData();
      }, 1600);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", padding: "4rem" }}>
        <RotateCw size={24} className="animate-spin-slow" color="#3b82f6" />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading pipeline telemetry...</p>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="page-wrapper">
        <Link to="/pipelines" className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }}>
          <ArrowLeft size={14} /> Back to Pipelines
        </Link>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <h3>Pipeline not found: {id}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back button and Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link to="/pipelines" className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <ArrowLeft size={14} /> Back to Pipelines
        </Link>
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <GitBranch size={28} color="#3b82f6" />
            {pipeline.name}
          </h1>
          <p>
            Pipeline ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{pipeline.pipeline_id}</span> &bull; Engine: {pipeline.engine}
          </p>
        </div>

        {/* Operational Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {pipeline.status === "failed" ? (
            <button
              onClick={handleSelfHeal}
              disabled={actionLoading}
              className="btn btn-warning"
              style={{ background: "#d97706", color: "#fff" }}
            >
              <RotateCw size={15} className={actionLoading ? "animate-spin-slow" : ""} />
              {actionLoading ? "Executing Recovery..." : "Execute Self-Healing"}
            </button>
          ) : (
            <button
              onClick={handleSimulateFailure}
              disabled={actionLoading}
              className="btn btn-danger"
            >
              <AlertTriangle size={15} />
              Simulate Failure
            </button>
          )}
        </div>
      </div>

      {/* Top Details Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
        marginBottom: "1.5rem"
      }}>
        {/* Status card */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Health State</div>
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className={`badge badge-${pipeline.status}`} style={{ fontSize: "0.85rem", padding: "0.35rem 0.85rem" }}>
              {pipeline.status === "recovering" && <RotateCw size={12} className="animate-spin-slow" />}
              {pipeline.status.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Last Successful Run: {pipeline.last_successful_run || "N/A"}
          </div>
        </div>

        {/* SLA Thresholds */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Configured SLA Thresholds</div>
          <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {pipeline.execution_threshold_seconds}s
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Execution SLA Limit</div>
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#60a5fa" }}>
                {pipeline.latency_threshold_seconds}s
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Latency SLA Limit</div>
            </div>
          </div>
        </div>

        {/* Throughput and Records */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Telemetry Metrics</div>
          <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {pipeline.records_processed.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Records Processed</div>
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#34d399" }}>
                {pipeline.throughput_rps ? `${pipeline.throughput_rps} rps` : "--"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Avg Throughput</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Architecture Details */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Cloud size={18} color="#3b82f6" />
          Cloud Architecture & Data Flow Paths
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          background: "rgba(0, 0, 0, 0.2)",
          padding: "1rem",
          borderRadius: "var(--radius-md)"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              Source Ingestion Endpoint
            </div>
            <code style={{ fontSize: "0.85rem", color: "#93c5fd" }}>{pipeline.source}</code>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              Destination Storage / Warehouse
            </div>
            <code style={{ fontSize: "0.85rem", color: "#34d399" }}>{pipeline.destination}</code>
          </div>
        </div>
      </div>

      {/* Pipeline Incidents & Self-Healing History Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Alerts for this pipeline */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={16} color="#ef4444" />
            Active & Past Incidents ({alerts.length})
          </h3>
          {alerts.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
              No incidents on record for this pipeline.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.alert_id}
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "0.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{alt.alert_id}</span>
                  <span className={`badge badge-${alt.severity}`}>{alt.severity}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{alt.message}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                  Status: {alt.status.toUpperCase()} &bull; {alt.created_at}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recovery logs for this pipeline */}
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={16} color="#10b981" />
            Recovery Actions Taken ({recoveries.length})
          </h3>
          {recoveries.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
              No automated recoveries recorded yet.
            </div>
          ) : (
            recoveries.map((rec) => (
              <div
                key={rec.recovery_id}
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "0.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, color: "#60a5fa" }}>{rec.recovery_id}</span>
                  <span className={`badge badge-${rec.status.includes("successful") ? "healthy" : "recovering"}`}>
                    {rec.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  Action: {rec.action} (Attempt {rec.attempt_number}/{rec.max_retries})
                </div>
                {rec.verification_result && (
                  <div style={{ fontSize: "0.72rem", color: "#34d399", marginTop: "0.25rem" }}>
                    &bull; {rec.verification_result}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
