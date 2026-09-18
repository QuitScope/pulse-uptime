export function serviceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDuration(
  startIso: string,
  endIso: string | null,
): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const minutes = Math.max(1, Math.round((end - start) / 60_000));

  if (minutes < 60) {
    return `${minutes} Min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours} Std ${remainingMinutes} Min`
      : `${hours} Std`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0
    ? `${days} Tage ${remainingHours} Std`
    : `${days} Tage`;
}

export function formatUptime(percentage: number | null): string {
  if (percentage === null) {
    return "keine Daten";
  }
  return `${percentage.toFixed(2)} %`;
}
