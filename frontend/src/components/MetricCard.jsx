import React from "react";

export default function MetricCard({
  title,
  value,
  icon: Icon,
  subtext,
  accentColor = "#3b82f6",
  badgeText,
  badgeType = "info"
}) {
  return (
    <div className="glass-panel metric-card" style={{
      borderTop: `2px solid ${accentColor}`
    }}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-wrap" style={{
            background: `${accentColor}20`,
            color: accentColor
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {badgeText && (
          <span className={`badge badge-${badgeType}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}
