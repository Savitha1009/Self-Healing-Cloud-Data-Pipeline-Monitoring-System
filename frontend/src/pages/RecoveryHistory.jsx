import React, { useState, useEffect } from "react";
import { 
  RotateCw, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Cpu 
} from "lucide-react";
import { recoveryApi } from "../services/api";

export default function RecoveryHistory() {
  const [recoveries, setRecoveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    try {
      const res = await recoveryApi.getHistory();
      setRecoveries(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = recoveries.filter((item) => {
    const matchesSearch =
      item.recovery_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) return alert("No recovery logs to export.");

    const headers = [
      "Recovery ID",
      "Pipeline ID",
      "Pipeline Name",
      "Execution ID",
      "Policy ID",
      "Remediation Action",
      "Attempt Number",
      "Max Retries",
      "Status",
      "Verification Result",
      "Error Message",
      "Created At",
      "Completed At"
    ];

    const rows = filtered.map((r) => [
      r.recovery_id,
      r.pipeline_id,
      `"${r.pipeline_name.replace(/"/g, '""')}"`,
      r.execution_id,
      r.policy_id,
      r.action,
      r.attempt_number,
      r.max_retries,
      r.status,
      `"${(r.verification_result || "").replace(/"/g, '""')}"`,
      `"${(r.error_message || "").replace(/"/g, '""')}"`,
      r.created_at,
      r.completed_at || "N/A"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recovery_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "recovery_successful":
        return <span className="badge badge-healthy"><CheckCircle2 size={12} /> Healed</span>;
      case "recovery_failed":
        return <span className="badge badge-failed"><XCircle size={12} /> Exceeded</span>;
      case "recovery_pending":
        return <span className="badge badge-recovering"><RotateCw size={12} className="animate-spin-slow" /> In Cooldown</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <RotateCw size={26} color="#3b82f6" />
            Self-Healing Recovery & Verification Logs
          </h1>
          <p>
            Autonomous remediation attempts, policy executions, parameter adjustments, and formal post-recovery health verifications.
          </p>
        </div>

        <button onClick={exportToCSV} className="btn btn-secondary">
          <Download size={15} /> Export Audit Logs (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search recovery ID, pipeline, action taken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <Filter size={14} /> Outcome:
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Outcomes ({recoveries.length})</option>
              <option value="recovery_successful">Healed (Pass)</option>
              <option value="recovery_pending">Pending / Cooldown</option>
              <option value="recovery_failed">Failed / Escalate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recovery Logs Table */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Recovery ID</th>
                <th>Pipeline</th>
                <th>Action & Policy</th>
                <th>Attempt</th>
                <th>Outcome Status</th>
                <th>Verification Result</th>
                <th>Triggered / Completed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                    No recovery records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.recovery_id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "#60a5fa" }}>
                        {item.recovery_id}
                      </span>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {item.execution_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.pipeline_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {item.pipeline_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#93c5fd" }}>
                        {item.action}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Policy: {item.policy_id}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.attempt_number} of {item.max_retries}
                      </span>
                    </td>

                    <td>{getStatusBadge(item.status)}</td>

                    <td>
                      <div style={{
                        fontSize: "0.775rem",
                        fontFamily: "var(--font-mono)",
                        color: item.status === "recovery_successful" ? "#34d399" : "#fbbf24"
                      }}>
                        {item.verification_result}
                      </div>
                      {item.error_message && (
                        <div style={{ fontSize: "0.7rem", color: "#fca5a5", marginTop: "0.2rem" }}>
                          {item.error_message}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.created_at}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {item.completed_at ? item.completed_at : "Awaiting completion"}
                      </div>
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
