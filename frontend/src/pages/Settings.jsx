import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Cloud, 
  ShieldCheck, 
  RotateCw, 
  Database, 
  Cpu, 
  Bell, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { simulationApi } from "../services/api";

export default function Settings() {
  const [pollInterval, setPollInterval] = useState("10");
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [detectionMode, setDetectionMode] = useState("hybrid");
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  const [cloudMode, setCloudMode] = useState("simulation");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemoData = async () => {
    if (window.confirm("Reset all pipeline data, incident alerts, and recovery logs to initial factory demo state?")) {
      setResetting(true);
      try {
        await simulationApi.resetDefaults();
        alert("Demo store reset successfully!");
      } catch (e) {
        alert("Error resetting: " + e.message);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <SettingsIcon size={26} color="#3b82f6" />
            System & Cloud Observability Settings
          </h1>
          <p>
            Configure background monitoring cycles, AWS telemetry connectors, intelligent anomaly models, and demo states.
          </p>
        </div>

        {savedSuccess && (
          <span className="badge badge-healthy" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            <CheckCircle2 size={16} /> Configuration Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
          {/* Continuous Monitoring Settings */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RotateCw size={18} color="#3b82f6" />
              Monitoring Engine Parameters
            </h3>

            <div className="form-group">
              <label className="form-label">Background Health Polling Interval</label>
              <select
                className="form-select"
                value={pollInterval}
                onChange={(e) => setPollInterval(e.target.value)}
              >
                <option value="5">Every 5 seconds (High Frequency Testing)</option>
                <option value="10">Every 10 seconds (Standard Demo)</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 60 seconds (Production Recommended)</option>
              </select>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Controls how frequently telemetry is collected from CloudWatch & local pipelines.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Self-Healing Execution Authority</label>
              <select
                className="form-select"
                value={autonomousMode ? "auto" : "manual"}
                onChange={(e) => setAutonomousMode(e.target.value === "auto")}
              >
                <option value="auto">Autonomous (Auto-executes safe approved recovery policies)</option>
                <option value="manual">Manual Approval Required (Operator must acknowledge before healing)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Anomaly Detection Engine</label>
              <select
                className="form-select"
                value={detectionMode}
                onChange={(e) => setDetectionMode(e.target.value)}
              >
                <option value="rules">Deterministic SLA Rules Only (Threshold-based)</option>
                <option value="hybrid">Hybrid Engine: SLA Thresholds + scikit-learn Isolation Forest</option>
              </select>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Isolation Forest automatically flags multidimensional outlier combinations of latency and throughput.
              </div>
            </div>
          </div>

          {/* Cloud Integration Mode */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Cloud size={18} color="#60a5fa" />
              Cloud Infrastructure Mode
            </h3>

            <div className="form-group">
              <label className="form-label">Operational Mode</label>
              <select
                className="form-select"
                value={cloudMode}
                onChange={(e) => setCloudMode(e.target.value)}
              >
                <option value="simulation">Local Simulation Mode (No AWS credentials needed)</option>
                <option value="aws">Live AWS Integration (CloudWatch + Glue + Step Functions)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default AWS Region</label>
              <select
                className="form-select"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
              >
                <option value="us-east-1">US East (N. Virginia) [us-east-1]</option>
                <option value="us-west-2">US West (Oregon) [us-west-2]</option>
                <option value="eu-west-1">Europe (Ireland) [eu-west-1]</option>
                <option value="ap-south-1">Asia Pacific (Mumbai) [ap-south-1]</option>
              </select>
            </div>

            <div style={{
              background: "rgba(0,0,0,0.25)",
              padding: "0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.4
            }}>
              <strong style={{ color: "var(--text-primary)" }}>Safety & Security Notice:</strong>
              <br />
              All AWS IAM roles follow strict least-privilege principles (`glue:GetJobRun`, `cloudwatch:GetMetricData`). Destructive commands are strictly prohibited by policy.
            </div>
          </div>
        </div>

        {/* Demo State Control & Save Bar */}
        <div className="glass-panel" style={{
          marginTop: "1.5rem",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              Demonstration & Factory Reset
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Reset local pipeline states, alerts, and recovery activity back to the initial sample state.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={handleResetDemoData}
              disabled={resetting}
              className="btn btn-secondary"
            >
              <RotateCcw size={15} /> Reset Demo State
            </button>

            <button type="submit" className="btn btn-primary">
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
