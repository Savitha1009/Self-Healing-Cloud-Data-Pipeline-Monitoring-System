import React, { useState, useEffect } from "react";
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCw,
  FileSpreadsheet
} from "lucide-react";
import { executionApi } from "../services/api";

export default function ExecutionHistory() {
  const [executions, setExecutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadExecutions = async () => {
    try {
      const res = await executionApi.getAll();
      setExecutions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  const filtered = executions.filter((item) => {
    const matchesSearch =
      item.execution_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pipeline_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Real CSV Export generator
  const exportToCSV = () => {
    if (filtered.length === 0) return alert("No executions to export.");

    const headers = [
      "Execution ID",
      "Pipeline ID",
      "Pipeline Name",
      "Started At",
      "Completed At",
      "Duration (s)",
      "Status",
      "Records Processed",
      "Throughput",
      "Recovery Attempts",
      "Recovery Outcome",
      "Verification Result",
      "Error Message"
    ];

    const rows = filtered.map((e) => [
      e.execution_id,
      e.pipeline_id,
      `"${e.pipeline_name.replace(/"/g, '""')}"`,
      e.started_at,
      e.completed_at || "N/A",
      e.duration_seconds,
      e.status,
      e.records_processed,
      `"${e.throughput}"`,
      e.recovery_attempts,
      e.recovery_outcome,
      `"${e.verification_result}"`,
      `"${(e.error_message || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pipeline_executions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <History size={26} color="#3b82f6" />
            Pipeline Execution & Telemetry History
          </h1>
          <p>
            Audit trail of ETL job runs, runtimes, error root-causes, recovery iterations, and verification outcomes.
          </p>
        </div>

        <button onClick={exportToCSV} className="btn btn-secondary">
          <Download size={15} /> Export History (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search execution ID, pipeline name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <Filter size={14} /> Status:
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Executions ({executions.length})</option>
              <option value="healthy">Healthy (Pass)</option>
              <option value="recovering">Under Recovery</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* Execution Table */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Pipeline</th>
                <th>Started / Completed</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Records & Throughput</th>
                <th>Recovery Attempts</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                    No execution records found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.execution_id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "#60a5fa" }}>
                        {item.execution_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.pipeline_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {item.pipeline_id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.started_at}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {item.completed_at ? item.completed_at : "In Progress..."}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                        {item.duration_seconds}s
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.records_processed.toLocaleString()} records
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {item.throughput}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: item.recovery_attempts > 0 ? "#fbbf24" : "var(--text-muted)"
                      }}>
                        {item.recovery_attempts} retries
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-mono)",
                        color: item.verification_result.includes("PASS") ? "#34d399" : item.verification_result.includes("FAIL") ? "#f87171" : "#fbbf24"
                      }}>
                        {item.verification_result}
                      </span>
                      {item.error_message && (
                        <div style={{ fontSize: "0.7rem", color: "#fca5a5", marginTop: "0.2rem" }}>
                          {item.error_message}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
