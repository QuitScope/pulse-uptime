import { useState } from "react";
import { CheckCircle, TrashSimple, WarningCircle } from "@phosphor-icons/react";
import {
  deleteMonitor,
  type Check,
  type Incident,
  type Monitor,
  type UptimeStats,
} from "../lib/api";
import { formatUptime, serviceName } from "../lib/format";
import { CheckHistoryStrip } from "./CheckHistoryStrip";

interface Props {
  monitor: Monitor;
  checks: Check[];
  incidents: Incident[];
  uptime: UptimeStats;
  onDeleted: () => void;
}

export function ServiceStatusCard({
  monitor,
  checks,
  incidents,
  uptime,
  onDeleted,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isDown = incidents.some((incident) => incident.resolvedAt === null);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMonitor(monitor.id);
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="border-t border-border py-6 first:border-t-0 dark:border-border-dark">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isDown ? (
            <span className="shrink-0 text-down dark:text-down-dark">
              <WarningCircle weight="fill" size={20} />
            </span>
          ) : (
            <span className="shrink-0 text-up dark:text-up-dark">
              <CheckCircle weight="fill" size={20} />
            </span>
          )}
          <div>
            <p className="font-medium text-ink dark:text-ink-dark">
              {serviceName(monitor.url)}
            </p>
            <p className="text-sm text-muted dark:text-muted-dark">
              {isDown ? "Nicht erreichbar" : "Erreichbar"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-mono text-sm text-muted dark:text-muted-dark">
            {formatUptime(uptime.uptimePercentage)}
          </p>

          {confirming ? (
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="font-medium text-down disabled:opacity-60 dark:text-down-dark"
              >
                {deleting ? "..." : "Löschen"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-muted hover:underline dark:text-muted-dark"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`${serviceName(monitor.url)} entfernen`}
              className="shrink-0 text-muted hover:text-down dark:text-muted-dark dark:hover:text-down-dark"
            >
              <TrashSimple size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <CheckHistoryStrip checks={checks} />
      </div>
    </div>
  );
}
