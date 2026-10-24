# System Architecture: Self-Healing Cloud Data Pipeline Monitoring System

## 1. System Overview
The Self-Healing Cloud Data Pipeline Monitoring System provides end-to-end observability, deterministic and machine-learning-driven anomaly detection, bounded automated recovery, and post-remediation health verification across distributed data pipelines (such as AWS Glue ETL and AWS Step Functions).

## 2. Core Modules Architecture

### 2.1 Continuous Monitoring Engine
- Periodically queries CloudWatch metrics (or local simulation telemetries) for active pipelines.
- Collects:
  - Execution runtime duration (seconds)
  - Processing throughput (records/second)
  - Latency SLA breach indicators
  - Error counts and exception classifications
- Evaluates metrics against pre-configured pipeline thresholds.

### 2.2 Failure & Anomaly Detection Engine
- **Deterministic Threshold Detection**: Compares observed execution durations against `execution_threshold_seconds` and micro-batch latencies against `latency_threshold_seconds`.
- **Intelligent Anomaly Detection (Phase 6)**: Employs scikit-learn's Isolation Forest model to detect multi-dimensional outliers in latency, throughput, and error rate combinations.
- Generates structured incidents with severity tags (`critical`, `warning`, `info`) and triggers recovery policies.

### 2.3 Self-Healing Recovery Engine
- **Policy Selection**: Matches the failure type (e.g., `execution_timeout`, `out_of_memory`, `connection_timeout`) to approved remediation rules.
- **Safety Enforcement**:
  - Enforces `maximum_retries` bounded limit (default &le; 3) to prevent runaway execution costs or infinite loops.
  - Enforces `cooldown_seconds` to allow distributed state and connection pools to stabilize.
  - Requires manual approval for risky or destructive operations.
- **Remediation Actions**:
  - `task_retry_with_exponential_backoff`: Re-submits timed-out jobs after backoff.
  - `scale_dpu_and_retry`: Boosts AWS Glue Worker DPUs from 2 to 4 DPUs for memory-intensive jobs.
  - `scale_concurrency_units`: Scales Lambda concurrency to relieve backlogged stream consumers.
  - `quarantine_to_dlq_and_resume`: Diverts malformed schema records to Dead Letter Queues (DLQ).
- **Post-Recovery Verification**: Checks pipeline health after remediation to verify that latency and throughput have normalized before closing the incident.

## 3. Technology Stack & API Protocols
- **Frontend**: React 18, Vite, React Router, Recharts, Lucide React, Axios, CSS3 Glassmorphism.
- **Backend (Phase 2)**: Python 3.10+, FastAPI, Uvicorn, Pydantic, APScheduler.
- **Database (Phase 3)**: MongoDB / PyMongo (`pipelines`, `metrics`, `executions`, `alerts`, `recovery_policies`, `recovery_logs`).
- **Cloud Connectors (Phase 7)**: Boto3 for AWS CloudWatch, AWS Glue, AWS Step Functions, and S3.
