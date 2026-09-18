import type { Check } from "../lib/api";
import { formatDateTime } from "../lib/format";

const STRIP_LENGTH = 40;

export function CheckHistoryStrip({ checks }: { checks: Check[] }) {
  const ordered = [...checks].reverse();
  const padding = Math.max(0, STRIP_LENGTH - ordered.length);
  const slots = [
    ...Array.from({ length: padding }, () => null),
    ...ordered.slice(-STRIP_LENGTH),
  ];

  return (
    <div className="flex gap-[3px]">
      {slots.map((check, index) =>
        check === null ? (
          <div
            key={`empty-${index}`}
            className="h-6 flex-1 rounded-sm bg-border dark:bg-border-dark"
          />
        ) : (
          <div
            key={check.id}
            title={`${check.success ? "Erfolgreich" : "Fehlgeschlagen"} - ${formatDateTime(check.checkedAt)}`}
            className={
              check.success
                ? "h-6 flex-1 rounded-sm bg-up dark:bg-up-dark"
                : "h-6 flex-1 rounded-sm bg-down dark:bg-down-dark"
            }
          />
        ),
      )}
    </div>
  );
}
