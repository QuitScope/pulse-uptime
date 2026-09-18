import type { Incident } from "../lib/api";
import { formatDateTime, formatDuration } from "../lib/format";

export interface IncidentWithService extends Incident {
  serviceName: string;
}

const VISIBLE_LIMIT = 10;

export function IncidentTimeline({
  incidents,
}: {
  incidents: IncidentWithService[];
}) {
  if (incidents.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted dark:text-muted-dark">
        Keine Vorfälle in der Historie.
      </p>
    );
  }

  const sorted = [...incidents].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return (
    <ul className="divide-y divide-border dark:divide-border-dark">
      {sorted.slice(0, VISIBLE_LIMIT).map((incident) => (
        <li
          key={incident.id}
          className="flex items-start justify-between gap-4 py-4"
        >
          <div>
            <p className="text-sm font-medium text-ink dark:text-ink-dark">
              {incident.serviceName}
            </p>
            <p className="text-sm text-muted dark:text-muted-dark">
              {formatDateTime(incident.startedAt)}
              {incident.resolvedAt === null
                ? " - läuft noch"
                : ` - ${formatDateTime(incident.resolvedAt)}`}
            </p>
          </div>
          <p className="shrink-0 font-mono text-sm text-muted dark:text-muted-dark">
            {formatDuration(incident.startedAt, incident.resolvedAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
