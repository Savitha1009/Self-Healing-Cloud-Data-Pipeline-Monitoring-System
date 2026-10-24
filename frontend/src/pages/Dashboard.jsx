import React, { useState, useEffect } from "react";
import { 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  Zap, 
  Timer,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import HealthChart from "../components/HealthChart";
import PipelineTable from "../components/PipelineTable";
import AlertPanel from "../components/AlertPanel";
import RecoveryTimeline from "../components/RecoveryTimeline";
import { dashboardApi, pipelineApi, alertApi, recoveryApi } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, pipesRes, alertsRes, recsRes] = await Promise.all([
        dashboardApi.getStats(),
        pipelineApi.getAll(),
        alertApi.getAll(),
        recoveryApi.getHistory()
      ]);
      setStats(statsRes.data);
      setPipelines(pipesRes.data);
      setAlerts(alertsRes.data);
      setRecoveries(recsRes.data);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper">
      {/* Simulation Banner */}
      <div className="simulation-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="simulation-tag">
            <Zap size={14} /> Local Simulation Mode
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Running autonomous health checks, threshold anomaly detection, and self-healing policies without requiring active AWS credentials.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary btn-sm"
            title="Refresh monitoring state"
          >
            <RotateCcw size={13} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={28} color="#3b82f6" />
            Pipeline Health & Self-Healing Monitor
          </h1>
          <p>
            Continuous real-time observability, SLA latency tracking, and automated failure remediation across cloud ETL workloads.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Pipelines"
          value={stats ? stats.total_pipelines : "--"}
          icon={GitBranch}
          accentColor="#3b82f6"
          subtext="Configured ETL & streaming jobs"
          badgeText="Operational"
          badgeType="info"
        />
        <MetricCard
          title="Healthy Pipelines"
          value={stats ? stats.healthy_pipelines : "--"}
          icon={CheckCircle2}
          accentColor="#10b981"
          subtext="Executing within SLA thresholds"
          badgeText={stats ? `${Math.round((stats.healthy_pipelines / (stats.total_pipelines || 1)) * 100)}%` : ""}
          badgeType="healthy"
        />
        <MetricCard
          title="Pipelines Failed"
          value={stats ? stats.failed_pipelines : "--"}
          icon={XCircle}
          accentColor="#ef4444"
          subtext="Awaiting auto-healing or manual action"
          badgeText={stats && stats.failed_pipelines > 0 ? "Action Needed" : "Clean"}
          badgeType={stats && stats.failed_pipelines > 0 ? "failed" : "healthy"}
        />
        <MetricCard
          title="Auto-Recovering"
          value={stats ? stats.recovering_pipelines : "--"}
          icon={RotateCw}
          accentColor="#f59e0b"
          subtext="Self-healing policies executing"
          badgeText="Active Remediation"
          badgeType="recovering"
        />
        <MetricCard
          title="Active Incidents"
          value={stats ? stats.active_alerts : "--"}
          icon={AlertOctagon}
          accentColor="#f87171"
          subtext="Pending acknowledgement"
          badgeText={stats ? `${stats.active_alerts} Alerts` : ""}
          badgeType="critical"
        />
        <MetricCard
          title="Healing Success Rate"
          value={
            stats && stats.successful_recoveries + stats.failed_recoveries > 0
              ? `${Math.round(
                  (stats.successful_recoveries /
                    (stats.successful_recoveries + stats.failed_recoveries)) *
                    100
                )}%`
              : "100%"
          }
          icon={Sparkles}
          accentColor="#8b5cf6"
          subtext={`${stats ? stats.successful_recoveries : 0} resolved autonomously`}
          badgeText="Verified Pass"
          badgeType="healthy"
        />
      </div>

      {/* Main Trends Chart */}
      <HealthChart data={stats ? stats.health_trends : []} />

      {/* Two Column Layout for Alerts & Recovery Activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
        gap: "1.5rem",
        marginBottom: "1.75rem"
      }}>
        <AlertPanel alerts={alerts} onAlertUpdated={loadDashboardData} />
        <RecoveryTimeline recoveries={recoveries} />
      </div>

      {/* Registered Pipelines Master Table */}
      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Data Pipeline Fleet Status
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Click any pipeline to inspect detailed metrics, runtime logs, and attached recovery policies.
            </p>
          </div>
        </div>

        <PipelineTable pipelines={pipelines} onRefresh={loadDashboardData} />
      </div>
    </div>
  );
}
