import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Play, 
  RotateCw, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Search,
  Filter
} from "lucide-react";
import { pipelineApi } from "../services/api";

export default function PipelineTable({ pipelines, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recoveringIds, setRecoveringIds] = useState([]);

  const filtered = pipelines.filter((pipe) => {
    const matchesSearch =
      pipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipe.pipeline_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipe.engine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pipe.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelfHeal = async (pipelineId) => {
    setRecoveringIds((prev) => [...prev, pipelineId]);
    try {
      await pipelineApi.recover(pipelineId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Recovery trigger failed: " + err.message);
    } finally {
      setTimeout(() => {
        setRecoveringIds((prev) => prev.filter((id) => id !== pipelineId));
        if (onRefresh) onRefresh();
      }, 1600);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "healthy":
        return (
          <span className="badge badge-healthy">
            <span className="pulsing-dot" style={{ backgroundColor: "#10b981" }}></span>
            Healthy
          </span>
        );
      case "failed":
        return (
          <span className="badge badge-failed">
            <span className="pulsing-dot" style={{ backgroundColor: "#ef4444" }}></span>
            Failed
          </span>
        );
      case "recovering":
        return (
          <span className="badge badge-recovering">
            <RotateCw size={12} className="animate-spin-slow" />
            Auto-Recovering
          </span>
        );
      case "running":
        return (
          <span className="badge badge-running">
            <Clock size={12} />
            Running
          </span>
        );
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "1.25rem" }}>
      {/* Search and Filter Row */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search pipeline name, ID, or engine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            <Filter size={14} />
            Status:
          </div>
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({pipelines.length})</option>
            <option value="healthy">Healthy</option>
            <option value="recovering">Auto-Recovering</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Pipeline</th>
              <th>Status</th>
              <th>Engine</th>
              <th>Duration</th>
              <th>Records</th>
              <th>Throughput</th>
              <th>Errors</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No data pipelines found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((pipe) => {
                const isRecovering = recoveringIds.includes(pipe.pipeline_id);
                return (
                  <tr key={pipe.pipeline_id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link
                          to={`/pipelines/${pipe.pipeline_id}`}
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            textDecoration: "none"
                          }}
                        >
                          {pipe.name}
                        </Link>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {pipe.pipeline_id} &bull; {pipe.source.split("://")[0].toUpperCase()} &rarr; {pipe.destination.split("://")[0].toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td>{getStatusBadge(pipe.status)}</td>

                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {pipe.engine}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                        {pipe.last_run_duration ? `${pipe.last_run_duration}s` : "--"}
                      </span>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Max: {pipe.execution_threshold_seconds}s
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {pipe.records_processed ? pipe.records_processed.toLocaleString() : "0"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#60a5fa" }}>
                        {pipe.throughput_rps ? `${pipe.throughput_rps.toLocaleString()} rps` : "--"}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: pipe.error_count > 0 ? "var(--color-failed)" : "var(--text-muted)"
                        }}
                      >
                        {pipe.error_count}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        {pipe.status === "failed" && (
                          <button
                            onClick={() => handleSelfHeal(pipe.pipeline_id)}
                            disabled={isRecovering}
                            className="btn btn-warning btn-sm"
                            style={{
                              background: "rgba(245, 158, 11, 0.2)",
                              color: "#fbbf24",
                              border: "1px solid rgba(245, 158, 11, 0.4)"
                            }}
                            title="Execute approved auto-recovery policy"
                          >
                            <RotateCw size={12} className={isRecovering ? "animate-spin-slow" : ""} />
                            {isRecovering ? "Healing..." : "Self-Heal"}
                          </button>
                        )}

                        <Link
                          to={`/pipelines/${pipe.pipeline_id}`}
                          className="btn btn-secondary btn-sm"
                          title="View pipeline details, metrics & policies"
                        >
                          <ExternalLink size={13} />
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
