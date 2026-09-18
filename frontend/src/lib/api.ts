const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Monitor {
  id: string;
  url: string;
  intervalSeconds: number;
  expectedStatusCode: number;
  createdAt: string;
}

export interface Check {
  id: string;
  httpStatus: number | null;
  responseTimeMs: number;
  success: boolean;
  errorMessage: string | null;
  checkedAt: string;
}

export interface Incident {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
}

export interface UptimeStats {
  totalChecks: number;
  successfulChecks: number;
  uptimePercentage: number | null;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export interface CreateMonitorInput {
  url: string;
  intervalSeconds: number;
  expectedStatusCode: number;
}

export async function createMonitor(
  input: CreateMonitorInput,
): Promise<Monitor> {
  const response = await fetch(`${API_URL}/monitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? `Anfrage fehlgeschlagen (${response.status})`,
    );
  }

  return response.json() as Promise<Monitor>;
}

export function fetchMonitors(): Promise<Monitor[]> {
  return getJson("/monitors");
}

export function fetchChecks(monitorId: string): Promise<Check[]> {
  return getJson(`/monitors/${monitorId}/checks`);
}

export function fetchIncidents(monitorId: string): Promise<Incident[]> {
  return getJson(`/monitors/${monitorId}/incidents`);
}

export function fetchUptime(monitorId: string): Promise<UptimeStats> {
  return getJson(`/monitors/${monitorId}/uptime`);
}

export async function deleteMonitor(monitorId: string): Promise<void> {
  const response = await fetch(`${API_URL}/monitors/${monitorId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Löschen fehlgeschlagen (${response.status})`);
  }
}
