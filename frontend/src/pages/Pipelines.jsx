import React, { useState, useEffect } from "react";
import { 
  GitBranch, 
  Plus, 
  Search, 
  Filter, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Database,
  Cloud
} from "lucide-react";
import { Link } from "react-router-dom";
import { pipelineApi } from "../services/api";

export default function Pipelines() {
  const [pipelines, setPipelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [recoveringIds, setRecoveringIds] = useState([]);

  // New pipeline form state
  const [formData, setFormData] = useState({
    name: "",
    source: "s3://raw-data-bucket/landing/",
    destination: "s3://curated-lakehouse/analytics/",
    engine: "AWS Glue ETL (Spark 3.3)",
    execution_threshold_seconds: 600,
    latency_threshold_seconds: 60,
    description: "",
    monitoring_enabled: true
  });

  const loadPipelines = async () => {
    try {
      const res = await pipelineApi.getAll();
      setPipelines(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Please enter a pipeline name");

    try {
      await pipelineApi.create(formData);
      setShowModal(false);
      setFormData({
        name: "",
        source: "s3://raw-data-bucket/landing/",
        destination: "s3://curated-lakehouse/analytics/",
        engine: "AWS Glue ETL (Spark 3.3)",
        execution_threshold_seconds: 600,
        latency_threshold_seconds: 60,
        description: "",
        monitoring_enabled: true
      });
      loadPipelines();
    } catch (err) {
      alert("Error registering pipeline: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete pipeline "${name}" (${id})?`)) {
      try {
        await pipelineApi.delete(id);
        loadPipelines();
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  const handleToggleMonitoring = async (pipe) => {
    try {
      await pipelineApi.update(pipe.pipeline_id, {
        monitoring_enabled: !pipe.monitoring_enabled
      });
      loadPipelines();
    } catch (err) {
      alert("Error updating monitoring: " + err.message);
    }
  };

  const handleSelfHeal = async (pipelineId) => {
    setRecoveringIds((prev) => [...prev, pipelineId]);
    try {
      await pipelineApi.recover(pipelineId);
      loadPipelines();
    } catch (err) {
      alert("Recovery failed: " + err.message);
    } finally {
      setTimeout(() => {
        setRecoveringIds((prev) => prev.filter((id) => id !== pipelineId));
        loadPipelines();
      }, 1600);
    }
  };

  const filtered = pipelines.filter((pipe) => {
    const matchesSearch =
      pipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipe.pipeline_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipe.engine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pipe.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <GitBranch size={26} color="#3b82f6" />
            Pipeline Registry & Management
          </h1>
          <p>
            Register, configure SLAs, enable autonomous health monitors, and trigger approved self-healing procedures.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Register New Pipeline
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by pipeline name, ID, or cloud engine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <Filter size={14} /> Filter Status:
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All ({pipelines.length})</option>
              <option value="healthy">Healthy</option>
              <option value="recovering">Auto-Recovering</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Pipeline Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: "1.25rem"
      }}>
        {filtered.map((pipe) => {
          const isRecovering = recoveringIds.includes(pipe.pipeline_id);
          return (
            <div
              key={pipe.pipeline_id}
              className="glass-panel"
              style={{
                padding: "1.35rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                borderLeft:
                  pipe.status === "healthy"
                    ? "3px solid #10b981"
                    : pipe.status === "failed"
                    ? "3px solid #ef4444"
                    : pipe.status === "recovering"
                    ? "3px solid #f59e0b"
                    : "3px solid #3b82f6"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <Link
                      to={`/pipelines/${pipe.pipeline_id}`}
                      style={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "var(--text-primary)",
                        textDecoration: "none"
                      }}
                    >
                      {pipe.name}
                    </Link>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {pipe.pipeline_id}
                    </div>
                  </div>

                  <span className={`badge badge-${pipe.status}`}>
                    {pipe.status === "recovering" && <RotateCw size={11} className="animate-spin-slow" />}
                    {pipe.status}
                  </span>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "0.85rem" }}>
                  {pipe.description || "Production cloud pipeline processing streaming and batch events."}
                </p>

                {/* Cloud Engine & I/O specs */}
                <div style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  marginBottom: "0.85rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#60a5fa" }}>
                    <Cloud size={13} />
                    <span>Engine: {pipe.engine}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    SRC: {pipe.source}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    DST: {pipe.destination}
                  </div>
                </div>

                {/* Thresholds and Metrics Summary */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.02)",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)"
                }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Duration</div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{pipe.last_run_duration}s</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Max SLA</div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#93c5fd" }}>{pipe.execution_threshold_seconds}s</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Errors</div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: pipe.error_count > 0 ? "var(--color-failed)" : "var(--color-healthy)" }}>
                      {pipe.error_count}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--border-subtle)"
              }}>
                <button
                  onClick={() => handleToggleMonitoring(pipe)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "transparent",
                    border: "none",
                    color: pipe.monitoring_enabled ? "#34d399" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  title="Toggle continuous monitoring"
                >
                  {pipe.monitoring_enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {pipe.monitoring_enabled ? "Monitored" : "Paused"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {pipe.status === "failed" && (
                    <button
                      onClick={() => handleSelfHeal(pipe.pipeline_id)}
                      disabled={isRecovering}
                      className="btn btn-warning btn-sm"
                      style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        color: "#fbbf24",
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        fontSize: "0.725rem",
                        padding: "0.25rem 0.55rem"
                      }}
                    >
                      <RotateCw size={11} className={isRecovering ? "animate-spin-slow" : ""} />
                      {isRecovering ? "Healing..." : "Heal"}
                    </button>
                  )}

                  <Link to={`/pipelines/${pipe.pipeline_id}`} className="btn btn-secondary btn-sm" style={{ fontSize: "0.725rem" }}>
                    Details
                  </Link>

                  <button
                    onClick={() => handleDelete(pipe.pipeline_id, pipe.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#f87171", padding: "0.3rem 0.5rem" }}
                    title="Delete pipeline"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Pipeline Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Cloud Data Pipeline</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pipeline Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Marketing Campaign Attribution ETL"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cloud Execution Engine</label>
                  <select
                    className="form-select"
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  >
                    <option value="AWS Glue ETL (Spark 3.3)">AWS Glue ETL (Apache Spark 3.3)</option>
                    <option value="AWS Glue (Python Shell)">AWS Glue (Python Shell)</option>
                    <option value="AWS Step Functions + Lambda">AWS Step Functions Orchestrated</option>
                    <option value="Amazon EMR Spark Serverless">Amazon EMR Serverless</option>
                    <option value="AWS Kinesis Data Firehose">AWS Kinesis Firehose Streaming</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Source URI / Stream</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Storage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Execution Timeout SLA (seconds)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.execution_threshold_seconds}
                      onChange={(e) => setFormData({ ...formData, execution_threshold_seconds: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Latency SLA Threshold (seconds)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.latency_threshold_seconds}
                      onChange={(e) => setFormData({ ...formData, latency_threshold_seconds: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pipeline Purpose / Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Describe data volume, transformations, and schema..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
