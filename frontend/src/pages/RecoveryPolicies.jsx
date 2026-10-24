import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Clock, 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Lock,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { recoveryApi } from "../services/api";

export default function RecoveryPolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    failure_type: "execution_timeout",
    scope: "Global (All Pipelines)",
    enabled: true,
    maximum_retries: 3,
    retry_delay_seconds: 60,
    cooldown_seconds: 300,
    require_manual_approval: false,
    action: "task_retry_with_exponential_backoff",
    description: ""
  });

  const loadPolicies = async () => {
    try {
      const res = await recoveryApi.getPolicies();
      setPolicies(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleToggle = async (policy) => {
    try {
      const updated = { ...policy, enabled: !policy.enabled };
      await recoveryApi.savePolicy(updated);
      loadPolicies();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setFormData({
      name: "",
      failure_type: "execution_timeout",
      scope: "Global (All Pipelines)",
      enabled: true,
      maximum_retries: 3,
      retry_delay_seconds: 60,
      cooldown_seconds: 300,
      require_manual_approval: false,
      action: "task_retry_with_exponential_backoff",
      description: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPolicy(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recoveryApi.savePolicy(formData);
      setShowModal(false);
      loadPolicies();
    } catch (err) {
      alert("Error saving policy: " + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldAlert size={26} color="#3b82f6" />
            Self-Healing Recovery Policies
          </h1>
          <p>
            Deterministic automated remediation rules, bounded retry limits, safety cooldown periods, and authorization guardrails.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Define Recovery Policy
        </button>
      </div>

      {/* Safety Guardrails Banner */}
      <div className="glass-panel" style={{
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        background: "rgba(16, 185, 129, 0.05)",
        border: "1px solid rgba(16, 185, 129, 0.25)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#34d399", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
          <ShieldCheck size={18} />
          Autonomous Engine Safety Protocol
        </div>
        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", margin: 0 }}>
          To prevent infinite retry cascades, cost explosion, or data corruption, all recovery policies are strictly bounded by Maximum Retries (&le; 5), Cooldown Deadband (&ge; 60s), and Post-Remediation Verification.
        </p>
      </div>

      {/* Policies List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "1.25rem" }}>
        {policies.map((policy) => (
          <div
            key={policy.policy_id}
            className="glass-panel"
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              opacity: policy.enabled ? 1 : 0.65,
              borderTop: policy.enabled ? "3px solid #3b82f6" : "3px solid #64748b"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>
                    {policy.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {policy.policy_id} &bull; Target: {policy.scope}
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(policy)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: policy.enabled ? "#34d399" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}
                >
                  {policy.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {policy.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "0.85rem" }}>
                {policy.description}
              </p>

              {/* Action and Failure Trigger details */}
              <div style={{
                background: "rgba(0,0,0,0.25)",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.775rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                marginBottom: "0.85rem"
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Trigger Incident: </span>
                  <span style={{ color: "#f87171", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{policy.failure_type}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Remediation Action: </span>
                  <span style={{ color: "#60a5fa", fontFamily: "var(--font-mono)" }}>{policy.action}</span>
                </div>
              </div>

              {/* Safety metrics */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.5rem",
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                padding: "0.6rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Max Retries</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    {policy.maximum_retries} attempts
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Delay</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#93c5fd" }}>
                    {policy.retry_delay_seconds}s
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Cooldown</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fbbf24" }}>
                    {policy.cooldown_seconds}s
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Edit Bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "0.75rem"
            }}>
              <div>
                {policy.require_manual_approval ? (
                  <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Lock size={12} /> Requires Operator Approval
                  </span>
                ) : (
                  <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <ShieldCheck size={12} /> Full Autonomous Execution
                  </span>
                )}
              </div>

              <button onClick={() => handleOpenEdit(policy)} className="btn btn-secondary btn-sm">
                Edit Parameters
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating / editing policy */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPolicy ? "Edit Recovery Policy" : "Define Recovery Policy"}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Policy Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Failure Trigger</label>
                    <select
                      className="form-select"
                      value={formData.failure_type}
                      onChange={(e) => setFormData({ ...formData, failure_type: e.target.value })}
                    >
                      <option value="execution_timeout">Execution Timeout</option>
                      <option value="high_latency">High Latency SLA Breach</option>
                      <option value="out_of_memory">Out of Memory (OOM)</option>
                      <option value="connection_timeout">Connection Timeout / Network Drop</option>
                      <option value="corrupt_records">Corrupt Records / Schema Deviation</option>
                      <option value="database_deadlock">Database Lock / Deadlock</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remediation Action</label>
                    <select
                      className="form-select"
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    >
                      <option value="task_retry_with_exponential_backoff">Task Retry (Exponential Backoff)</option>
                      <option value="scale_concurrency_units">Scale Lambda / Step Functions Concurrency</option>
                      <option value="scale_dpu_and_retry">Boost Worker DPUs (AWS Glue)</option>
                      <option value="quarantine_to_dlq_and_resume">Quarantine Bad Batch to DLQ</option>
                      <option value="flush_connection_pool_and_retry">Flush Pool & Restart Service</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Max Retries Bound (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="form-input"
                      value={formData.maximum_retries}
                      onChange={(e) => setFormData({ ...formData, maximum_retries: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Retry Delay (seconds)</label>
                    <input
                      type="number"
                      min={10}
                      className="form-input"
                      value={formData.retry_delay_seconds}
                      onChange={(e) => setFormData({ ...formData, retry_delay_seconds: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cooldown Deadband (seconds)</label>
                  <input
                    type="number"
                    min={60}
                    className="form-input"
                    value={formData.cooldown_seconds}
                    onChange={(e) => setFormData({ ...formData, cooldown_seconds: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Rationale</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
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
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
