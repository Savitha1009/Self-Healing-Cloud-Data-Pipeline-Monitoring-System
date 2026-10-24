import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity, Clock, Zap } from "lucide-react";

export default function HealthChart({ data }) {
  const [activeTab, setActiveTab] = useState("latency");

  const chartData = data && data.length > 0 ? data : [
    { time: "08:00", healthy: 6, failed: 0, recovering: 0, avgLatency: 28, throughput: 38200 },
    { time: "09:00", healthy: 5, failed: 0, recovering: 1, avgLatency: 45, throughput: 36100 },
    { time: "10:00", healthy: 6, failed: 0, recovering: 0, avgLatency: 29, throughput: 39500 },
    { time: "11:00", healthy: 6, failed: 0, recovering: 0, avgLatency: 31, throughput: 41200 },
    { time: "12:00", healthy: 6, failed: 0, recovering: 0, avgLatency: 33, throughput: 42800 },
    { time: "13:00", healthy: 4, failed: 1, recovering: 1, avgLatency: 52, throughput: 34900 },
    { time: "14:00", healthy: 4, failed: 1, recovering: 1, avgLatency: 46, throughput: 37100 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          boxShadow: "var(--shadow-md)",
          fontSize: "0.8rem",
          color: "var(--text-primary)"
        }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
            Time: {label}
          </div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: entry.color }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                {entry.value.toLocaleString()} {entry.dataKey === "avgLatency" ? "sec" : entry.dataKey === "throughput" ? "rec/s" : ""}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.75rem" }}>
      {/* Chart Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.25rem",
        flexWrap: "wrap",
        gap: "0.75rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity size={18} color="var(--color-primary)" />
            Continuous Pipeline Health & Performance Trends
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            Real-time metric telemetry collected from AWS CloudWatch & Step Functions simulation
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: "flex",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          padding: "0.25rem",
          border: "1px solid var(--border-subtle)"
        }}>
          <button
            onClick={() => setActiveTab("latency")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.775rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "latency" ? "var(--color-primary)" : "transparent",
              color: activeTab === "latency" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease"
            }}
          >
            Latency & SLA
          </button>
          <button
            onClick={() => setActiveTab("throughput")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.775rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "throughput" ? "var(--color-primary)" : "transparent",
              color: activeTab === "throughput" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease"
            }}
          >
            Throughput (RPS)
          </button>
          <button
            onClick={() => setActiveTab("pipelines")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.775rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "pipelines" ? "var(--color-primary)" : "transparent",
              color: activeTab === "pipelines" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease"
            }}
          >
            Pipeline States
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: "100%", height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "latency" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgLatency"
                name="Avg Latency (s)"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          ) : activeTab === "throughput" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-healthy)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-healthy)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="throughput"
                name="Processing Throughput"
                stroke="var(--color-healthy)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#throughputGrad)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
              <Line type="monotone" dataKey="healthy" name="Healthy" stroke="var(--color-healthy)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="failed" name="Failed" stroke="var(--color-failed)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="recovering" name="Recovering" stroke="var(--color-recovering)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
