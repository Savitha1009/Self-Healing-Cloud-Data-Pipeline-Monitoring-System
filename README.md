# Self-Healing Cloud Data Pipeline Monitoring System

## Overview
**CloudHeal** is an autonomous cloud data pipeline observability and self-healing recovery platform. It provides real-time SLA latency tracking, failure and anomaly detection, automated policy-governed remediation actions (bounded retries, backoff delays, and auto-scaling), post-recovery verification, and comprehensive audit history.

---

## High-Level Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (React + Vite)                           |
|  - Real-time Observability Dashboard        - Pipeline Fleet Management           |
|  - Continuous Health & Throughput Charts    - Deterministic & ML Anomaly Alerts   |
|  - Self-Healing Policy Editor               - Execution & Recovery Audit Logs     |
+------------------------------------------+----------------------------------------+
                                           | REST APIs (/api/v1)
                                           v
+-----------------------------------------------------------------------------------+
|                                 BACKEND (FastAPI - Phase 2)                       |
|  - Health Checker & Metric Collector        - Failure & Anomaly Detection Engine  |
|  - Self-Healing Policy Engine               - Recovery Verification Engine        |
|  - Background Scheduler (APScheduler)       - Cloud Connector Layer               |
+--------------------+-------------------------------------+------------------------+
                     |                                     |
                     v                                     v
+-----------------------------+       +---------------------------------------------+
|    DATABASE (MongoDB)       |       |       AWS CLOUD SERVICES (Local / Live)     |
| - pipelines                 |       | - AWS CloudWatch (Metrics & Alarms)         |
| - metrics                   |       | - AWS Glue (ETL Job Monitoring & Workers)   |
| - alerts                    |       | - AWS Step Functions (State Orchestration)  |
| - recovery_policies         |       | - Amazon S3 (Raw & Lakehouse Partitions)    |
| - executions & recovery_logs|       | - AWS Lambda (Recovery Remediations)        |
+-----------------------------+       +---------------------------------------------+
```

---

## Project Structure

```
proj 10/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top nav with simulation controls & alerts
│   │   │   ├── Sidebar.jsx          # Primary SPA navigation
│   │   │   ├── MetricCard.jsx       # Observability statistic cards
│   │   │   ├── PipelineTable.jsx    # Fleet overview with status and actions
│   │   │   ├── HealthChart.jsx      # Recharts latency and throughput graphs
│   │   │   ├── AlertPanel.jsx       # Real-time incident alerts & actions
│   │   │   └── RecoveryTimeline.jsx # Visual audit trail of auto-remediations
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Master operational monitoring view
│   │   │   ├── Pipelines.jsx        # Pipeline registration and management
│   │   │   ├── PipelineDetails.jsx  # Individual pipeline inspection & metrics
│   │   │   ├── ExecutionHistory.jsx # Execution audit logs with CSV export
│   │   │   ├── Alerts.jsx           # Anomaly and SLA violation alarms
│   │   │   ├── RecoveryPolicies.jsx # Configurable bounded healing rules
│   │   │   ├── RecoveryHistory.jsx  # Verification logs with CSV export
│   │   │   └── Settings.jsx         # Telemetry intervals & cloud integration
│   │   ├── services/
│   │   │   ├── mockData.js          # Realistic ETL pipeline sample data
│   │   │   └── api.js               # Storage-backed API client & mock engine
│   │   ├── App.jsx                  # Main routing component
│   │   ├── App.css                  # Modern dark-mode styling & glassmorphism
│   │   ├── index.css                # Global design tokens and typography
│   │   └── main.jsx                 # Vite React entry point
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── backend/                         # (Phase 2 FastAPI implementation)
├── docs/
│   └── architecture.md
└── README.md
```

---

## Phase 1 Deliverables Implemented & Tested

1. **Dashboard (`/`)**:
   - Live metrics: Total Pipelines, Healthy, Failed, Under Recovery, Active Incidents, and Healing Success Rate.
   - Continuous SLA Latency, Throughput (RPS), and Pipeline State trend graphs with Recharts.
   - Fleet Status table with instant search and status filters.
   - Real-time Alert Panel with acknowledgement and resolution workflows.
   - Autonomous Self-Healing Timeline showing policy actions and verification passes.

2. **Pipeline Registry & Management (`/pipelines`)**:
   - Register new data pipelines modal (AWS Glue ETL, Step Functions, EMR Serverless).
   - Set execution timeout SLAs and latency thresholds.
   - Pause or resume continuous monitoring per pipeline.
   - Inline self-healing and failure simulation triggers.

3. **Pipeline Details (`/pipelines/:id`)**:
   - Deep inspection of source and destination storage paths.
   - Configured SLAs vs observed metrics.
   - Associated alert history and recovery actions.

4. **Execution History (`/executions`)**:
   - Complete record of runs with duration, records processed, and throughput.
   - Functional **Export History to CSV** button.

5. **Failure Alerts (`/alerts`)**:
   - Severity tags (Critical, Warning, Info).
   - Acknowledge and Resolve incident actions.

6. **Recovery Policies (`/recovery-policies`)**:
   - Configurable bounded retries (1-5 attempts), retry delays, and cooldown periods.
   - Enforces safe automated remediations (e.g. exponential backoff, worker boost, DLQ quarantine).

7. **Recovery Audit Logs (`/recovery-history`)**:
   - Comprehensive audit trail of recovery attempts, policies, and formal post-recovery health verifications.
   - Functional **Export Audit Logs to CSV** button.

8. **Settings & Cloud Integration (`/settings`)**:
   - Configurable background monitoring intervals.
   - Local simulation mode vs Live AWS integration switcher.
   - One-click demo state reset and failure injection.
