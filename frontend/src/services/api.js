import axios from "axios";
import {
  INITIAL_PIPELINES,
  INITIAL_ALERTS,
  INITIAL_RECOVERY_POLICIES,
  INITIAL_RECOVERY_LOGS,
  INITIAL_EXECUTIONS,
  HEALTH_TRENDS
} from "./mockData";

// Environment check: in Phase 1 or when backend is offline, use rich interactive local simulation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Storage helper to persist simulation changes locally during demo
const STORAGE_KEYS = {
  PIPELINES: "sh_pipelines",
  ALERTS: "sh_alerts",
  POLICIES: "sh_policies",
  RECOVERIES: "sh_recoveries",
  EXECUTIONS: "sh_executions",
  SETTINGS: "sh_settings"
};

function getStored(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// Initialize mock store if not present
function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.PIPELINES)) {
    setStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    setStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POLICIES)) {
    setStored(STORAGE_KEYS.POLICIES, INITIAL_RECOVERY_POLICIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECOVERIES)) {
    setStored(STORAGE_KEYS.RECOVERIES, INITIAL_RECOVERY_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXECUTIONS)) {
    setStored(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
  }
}

initializeStore();

// ======================== API SERVICES ========================

export const pipelineApi = {
  // Get all pipelines
  getAll: async () => {
    if (USE_MOCK) {
      const data = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      return { data };
    }
    return apiClient.get("/pipelines");
  },

  // Get single pipeline
  getById: async (id) => {
    if (USE_MOCK) {
      const list = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const pipe = list.find((p) => p.pipeline_id === id);
      if (!pipe) throw new Error("Pipeline not found");
      return { data: pipe };
    }
    return apiClient.get(`/pipelines/${id}`);
  },

  // Create pipeline
  create: async (payload) => {
    if (USE_MOCK) {
      const list = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const newPipeline = {
        pipeline_id: `PIPE-${Math.floor(100 + Math.random() * 900)}`,
        status: "healthy",
        last_run_duration: 120,
        records_processed: 0,
        error_count: 0,
        throughput_rps: 0,
        last_successful_run: new Date().toISOString().replace("T", " ").substring(0, 19),
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        ...payload,
      };
      const updated = [newPipeline, ...list];
      setStored(STORAGE_KEYS.PIPELINES, updated);
      return { data: newPipeline };
    }
    return apiClient.post("/pipelines", payload);
  },

  // Update pipeline
  update: async (id, payload) => {
    if (USE_MOCK) {
      const list = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const index = list.findIndex((p) => p.pipeline_id === id);
      if (index === -1) throw new Error("Pipeline not found");
      list[index] = { ...list[index], ...payload, updated_at: new Date().toISOString().replace("T", " ").substring(0, 19) };
      setStored(STORAGE_KEYS.PIPELINES, list);
      return { data: list[index] };
    }
    return apiClient.put(`/pipelines/${id}`, payload);
  },

  // Delete pipeline
  delete: async (id) => {
    if (USE_MOCK) {
      const list = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const updated = list.filter((p) => p.pipeline_id !== id);
      setStored(STORAGE_KEYS.PIPELINES, updated);
      return { data: { success: true, message: `Pipeline ${id} deleted.` } };
    }
    return apiClient.delete(`/pipelines/${id}`);
  },

  // Trigger self-healing recovery manually
  recover: async (id) => {
    if (USE_MOCK) {
      const pipelines = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const alerts = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      const recoveries = getStored(STORAGE_KEYS.RECOVERIES, INITIAL_RECOVERY_LOGS);
      const executions = getStored(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);

      const pipeIndex = pipelines.findIndex((p) => p.pipeline_id === id);
      if (pipeIndex === -1) throw new Error("Pipeline not found");

      // Mark pipeline as recovering
      pipelines[pipeIndex].status = "recovering";
      setStored(STORAGE_KEYS.PIPELINES, pipelines);

      const recoveryId = `REC-${Math.floor(400 + Math.random() * 500)}`;
      const executionId = `EXEC-${Math.floor(8800 + Math.random() * 100)}`;
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);

      const newRecovery = {
        recovery_id: recoveryId,
        pipeline_id: id,
        pipeline_name: pipelines[pipeIndex].name,
        execution_id: executionId,
        policy_id: "POL-001",
        action: "task_retry_with_exponential_backoff",
        attempt_number: 1,
        max_retries: 3,
        status: "recovery_successful",
        verification_result: "PASS - Pipeline health verified by verification engine",
        error_message: null,
        created_at: now,
        completed_at: now
      };

      setStored(STORAGE_KEYS.RECOVERIES, [newRecovery, ...recoveries]);

      // Resolve alerts for this pipeline
      const updatedAlerts = alerts.map((alt) =>
        alt.pipeline_id === id && alt.status !== "resolved"
          ? { ...alt, status: "resolved", resolved_at: now }
          : alt
      );
      setStored(STORAGE_KEYS.ALERTS, updatedAlerts);

      // Simulate recovery completion back to healthy
      setTimeout(() => {
        const currentPipes = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
        const pIdx = currentPipes.findIndex((p) => p.pipeline_id === id);
        if (pIdx !== -1) {
          currentPipes[pIdx].status = "healthy";
          currentPipes[pIdx].error_count = 0;
          currentPipes[pIdx].last_successful_run = new Date().toISOString().replace("T", " ").substring(0, 19);
          setStored(STORAGE_KEYS.PIPELINES, currentPipes);
        }
      }, 1500);

      return {
        data: {
          success: true,
          message: `Self-healing recovery triggered for ${id}`,
          recovery: newRecovery
        }
      };
    }
    return apiClient.post(`/pipelines/${id}/recover`);
  }
};

export const dashboardApi = {
  getStats: async () => {
    if (USE_MOCK) {
      const pipelines = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
      const alerts = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      const recoveries = getStored(STORAGE_KEYS.RECOVERIES, INITIAL_RECOVERY_LOGS);

      const totalPipelines = pipelines.length;
      const healthyCount = pipelines.filter((p) => p.status === "healthy").length;
      const failedCount = pipelines.filter((p) => p.status === "failed").length;
      const runningCount = pipelines.filter((p) => p.status === "running").length;
      const recoveringCount = pipelines.filter((p) => p.status === "recovering").length;

      const activeAlerts = alerts.filter((a) => a.status === "active").length;
      const successfulRecoveries = recoveries.filter((r) => r.status === "recovery_successful").length;
      const failedRecoveries = recoveries.filter((r) => r.status === "recovery_failed").length;

      const avgDuration = Math.round(
        pipelines.reduce((acc, p) => acc + (p.last_run_duration || 0), 0) / (totalPipelines || 1)
      );

      return {
        data: {
          total_pipelines: totalPipelines,
          healthy_pipelines: healthyCount,
          failed_pipelines: failedCount,
          running_pipelines: runningCount,
          recovering_pipelines: recoveringCount,
          total_alerts: alerts.length,
          active_alerts: activeAlerts,
          successful_recoveries: successfulRecoveries,
          failed_recoveries: failedRecoveries,
          avg_duration_seconds: avgDuration,
          health_score_pct: Math.round(((healthyCount + runningCount * 0.8) / (totalPipelines || 1)) * 100),
          health_trends: HEALTH_TRENDS,
          is_simulation_mode: true
        }
      };
    }
    return apiClient.get("/dashboard/stats");
  }
};

export const alertApi = {
  getAll: async () => {
    if (USE_MOCK) {
      const data = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      return { data };
    }
    return apiClient.get("/alerts");
  },

  acknowledge: async (alertId) => {
    if (USE_MOCK) {
      const alerts = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      const index = alerts.findIndex((a) => a.alert_id === alertId);
      if (index === -1) throw new Error("Alert not found");
      alerts[index].status = "acknowledged";
      setStored(STORAGE_KEYS.ALERTS, alerts);
      return { data: alerts[index] };
    }
    return apiClient.patch(`/alerts/${alertId}/acknowledge`);
  },

  resolve: async (alertId) => {
    if (USE_MOCK) {
      const alerts = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      const index = alerts.findIndex((a) => a.alert_id === alertId);
      if (index === -1) throw new Error("Alert not found");
      alerts[index].status = "resolved";
      alerts[index].resolved_at = new Date().toISOString().replace("T", " ").substring(0, 19);
      setStored(STORAGE_KEYS.ALERTS, alerts);
      return { data: alerts[index] };
    }
    return apiClient.patch(`/alerts/${alertId}/resolve`);
  }
};

export const recoveryApi = {
  getPolicies: async () => {
    if (USE_MOCK) {
      const data = getStored(STORAGE_KEYS.POLICIES, INITIAL_RECOVERY_POLICIES);
      return { data };
    }
    return apiClient.get("/recovery/policies");
  },

  savePolicy: async (policy) => {
    if (USE_MOCK) {
      const policies = getStored(STORAGE_KEYS.POLICIES, INITIAL_RECOVERY_POLICIES);
      const index = policies.findIndex((p) => p.policy_id === policy.policy_id);
      if (index !== -1) {
        policies[index] = { ...policies[index], ...policy };
      } else {
        policies.unshift({
          policy_id: `POL-${Math.floor(100 + Math.random() * 900)}`,
          ...policy
        });
      }
      setStored(STORAGE_KEYS.POLICIES, policies);
      return { data: policies };
    }
    return apiClient.post("/recovery/policies", policy);
  },

  getHistory: async () => {
    if (USE_MOCK) {
      const data = getStored(STORAGE_KEYS.RECOVERIES, INITIAL_RECOVERY_LOGS);
      return { data };
    }
    return apiClient.get("/recovery/history");
  }
};

export const executionApi = {
  getAll: async () => {
    if (USE_MOCK) {
      const data = getStored(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
      return { data };
    }
    return apiClient.get("/executions");
  }
};

export const simulationApi = {
  // Demo helper: simulate failure injection on a pipeline
  injectFailure: async (pipelineId, failureType = "execution_timeout") => {
    const pipelines = getStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
    const alerts = getStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const pipeIndex = pipelines.findIndex((p) => p.pipeline_id === pipelineId);
    if (pipeIndex === -1) throw new Error("Pipeline not found");

    pipelines[pipeIndex].status = "failed";
    pipelines[pipeIndex].error_count += 1;
    setStored(STORAGE_KEYS.PIPELINES, pipelines);

    const newAlert = {
      alert_id: `ALT-${Math.floor(9100 + Math.random() * 800)}`,
      pipeline_id: pipelineId,
      pipeline_name: pipelines[pipeIndex].name,
      execution_id: `EXEC-${Math.floor(8830 + Math.random() * 50)}`,
      failure_type: failureType,
      severity: "critical",
      message: `Simulated anomaly triggered: ${failureType.replace(/_/g, " ")}. Exceeded threshold limits.`,
      status: "active",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      resolved_at: null,
      auto_recovery_triggered: true,
      recovery_id: `REC-${Math.floor(420 + Math.random() * 80)}`
    };

    setStored(STORAGE_KEYS.ALERTS, [newAlert, ...alerts]);
    return { success: true, message: `Injected failure on ${pipelineId}`, alert: newAlert };
  },

  // Demo helper: reset mock data back to factory defaults
  resetDefaults: async () => {
    setStored(STORAGE_KEYS.PIPELINES, INITIAL_PIPELINES);
    setStored(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    setStored(STORAGE_KEYS.POLICIES, INITIAL_RECOVERY_POLICIES);
    setStored(STORAGE_KEYS.RECOVERIES, INITIAL_RECOVERY_LOGS);
    setStored(STORAGE_KEYS.EXECUTIONS, INITIAL_EXECUTIONS);
    return { success: true, message: "Storage reset to initial state" };
  }
};
