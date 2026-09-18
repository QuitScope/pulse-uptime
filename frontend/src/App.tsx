import { useCallback, useEffect, useRef, useState } from "react";
import { Pulse } from "@phosphor-icons/react";
import {
  fetchChecks,
  fetchIncidents,
  fetchMonitors,
  fetchUptime,
  type Check,
  type Incident,
  type Monitor,
  type UptimeStats,
} from "./lib/api";
import { serviceName } from "./lib/format";
import { StatusBanner } from "./components/StatusBanner";
import { ServiceStatusCard } from "./components/ServiceStatusCard";
import {
  IncidentTimeline,
  type IncidentWithService,
} from "./components/IncidentTimeline";
import { AddMonitorForm } from "./components/AddMonitorForm";

const POLL_INTERVAL_MS = 30_000;

interface MonitorData {
  monitor: Monitor;
  checks: Check[];
  incidents: Incident[];
  uptime: UptimeStats;
}

async function loadData(): Promise<MonitorData[]> {
  const monitors = await fetchMonitors();
  return Promise.all(
    monitors.map(async (monitor) => {
      const [checks, incidents, uptime] = await Promise.all([
        fetchChecks(monitor.id),
        fetchIncidents(monitor.id),
        fetchUptime(monitor.id),
      ]);
      return { monitor, checks, incidents, uptime };
    }),
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-14 rounded-lg bg-border dark:bg-border-dark" />
      <div className="space-y-4">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-20 rounded-lg bg-border dark:bg-border-dark"
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState<MonitorData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const dataRef = useRef<MonitorData[] | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await loadData();
      dataRef.current = result;
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      if (dataRef.current === null) {
        setError("Status konnte nicht geladen werden. Läuft das Backend?");
      } else {
        setError(
          "Aktualisierung fehlgeschlagen, zeige letzten bekannten Stand.",
        );
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const allOperational =
    data?.every(
      (item) =>
        !item.incidents.some((incident) => incident.resolvedAt === null),
    ) ?? true;

  const allIncidents: IncidentWithService[] =
    data?.flatMap((item) =>
      item.incidents.map((incident) => ({
        ...incident,
        serviceName: serviceName(item.monitor.url),
      })),
    ) ?? [];

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex items-center gap-2">
        <span className="text-brand dark:text-brand-dark">
          <Pulse weight="fill" size={24} />
        </span>
        <span className="text-lg font-semibold text-ink dark:text-ink-dark">
          Pulse
        </span>
      </header>

      {error && data === null && (
        <div className="rounded-lg border border-border px-5 py-4 text-sm text-muted dark:border-border-dark dark:text-muted-dark">
          {error}
        </div>
      )}

      {data === null && !error && <LoadingSkeleton />}

      {data !== null && data.length === 0 && (
        <p className="py-12 text-center text-sm text-muted dark:text-muted-dark">
          Keine überwachten Dienste vorhanden.
        </p>
      )}

      {data !== null && data.length > 0 && (
        <>
          {error && (
            <p className="mb-4 text-sm text-degraded dark:text-degraded-dark">
              {error}
            </p>
          )}

          <StatusBanner allOperational={allOperational} />

          <section className="mt-10">
            <h2 className="mb-2 text-sm font-medium text-muted dark:text-muted-dark">
              Dienste
            </h2>
            <div>
              {data.map((item) => (
                <ServiceStatusCard
                  key={item.monitor.id}
                  monitor={item.monitor}
                  checks={item.checks}
                  incidents={item.incidents}
                  uptime={item.uptime}
                  onDeleted={refresh}
                />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-2 text-sm font-medium text-muted dark:text-muted-dark">
              Vorfälle
            </h2>
            <IncidentTimeline incidents={allIncidents} />
          </section>
        </>
      )}

      {data !== null && (
        <section className="mt-10">
          <AddMonitorForm onCreated={refresh} />
        </section>
      )}

      <footer className="mt-12 text-xs text-muted dark:text-muted-dark">
        {lastUpdated
          ? `Zuletzt aktualisiert um ${lastUpdated.toLocaleTimeString("de-DE")}`
          : ""}
      </footer>
    </div>
  );
}

export default App;
