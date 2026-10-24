import React from "react";
import { 
  ShieldCheck, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Cpu, 
  ArrowRight
} from "lucide-react";

export default function RecoveryTimeline({ recoveries }) {
  const getStatusDisplay = (status) => {
    switch (status) {
      case "recovery_successful":
        return {
          badge: <span className="badge badge-healthy"><CheckCircle2 size={12} /> Healed Successfully</span>,
          dotColor: "#10b981"
        };
      case "recovery_failed":
        return {
          badge: <span className="badge badge-failed"><XCircle size={12} /> Recovery Limit Exceeded</span>,
          dotColor: "#ef4444"
        };
      case "recovery_pending":
        return {
          badge: <span className="badge badge-recovering"><RotateCw size={12} className="animate-spin-slow" /> Retry in Cooldown</span>,
          dotColor: "#f59e0b"
        };
      default:
        return {
          badge: <span className="badge badge-neutral">{status}</span>,
          dotColor: "#94a3b8"
        };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "1.25rem" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.25rem"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={18} color="#10b981" />
          Autonomous Self-Healing Activity & Verification
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {recoveries.length} total events logged
        </span>
      </div>

      <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
        {/* Vertical line connecting events */}
        <div style={{
          position: "absolute",
          top: "10px",
          bottom: "10px",
          left: "6px",
          width: "2px",
          background: "rgba(255, 255, 255, 0.08)"
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {recoveries.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No recovery activity recorded yet.
            </div>
          ) : (
            recoveries.slice(0, 5).map((rec) => {
              const { badge, dotColor } = getStatusDisplay(rec.status);
              return (
                <div key={rec.recovery_id} style={{ position: "relative" }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: "absolute",
                    left: "-1.75rem",
                    top: "4px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: dotColor,
                    boxShadow: `0 0 10px ${dotColor}`
                  }} />

                  <div style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.45rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                          {rec.pipeline_name}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          ({rec.pipeline_id})
                        </span>
                      </div>
                      {badge}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.775rem", color: "#60a5fa" }}>
                      <Cpu size={13} />
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        Action: {rec.action.replace(/_/g, " ")}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>&bull;</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Attempt {rec.attempt_number} of {rec.max_retries}
                      </span>
                    </div>

                    {rec.verification_result && (
                      <div style={{
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        background: rec.status === "recovery_successful" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: rec.status === "recovery_successful" ? "#34d399" : "#fca5a5",
                        fontFamily: "var(--font-mono)"
                      }}>
                        Verification: {rec.verification_result}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      <span>Triggered: {rec.created_at}</span>
                      {rec.completed_at && <span>Completed: {rec.completed_at}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
