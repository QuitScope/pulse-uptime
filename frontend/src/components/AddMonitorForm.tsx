import { useState, type FormEvent } from "react";
import { Plus } from "@phosphor-icons/react";
import { createMonitor } from "../lib/api";

export function AddMonitorForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState("300");
  const [expectedStatusCode, setExpectedStatusCode] = useState("200");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline dark:text-brand-dark"
      >
        <Plus weight="bold" size={16} />
        Dienst hinzufügen
      </button>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createMonitor({
        url,
        intervalSeconds: Number(intervalSeconds),
        expectedStatusCode: Number(expectedStatusCode),
      });
      setUrl("");
      setIntervalSeconds("300");
      setExpectedStatusCode("200");
      setOpen(false);
      onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border p-5 dark:border-border-dark"
    >
      <div className="space-y-2">
        <label
          htmlFor="url"
          className="block text-sm font-medium text-ink dark:text-ink-dark"
        >
          URL
        </label>
        <input
          id="url"
          type="url"
          required
          placeholder="https://beispiel.de"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-brand-dark"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="interval"
            className="block text-sm font-medium text-ink dark:text-ink-dark"
          >
            Intervall (Sek.)
          </label>
          <input
            id="interval"
            type="number"
            min={5}
            required
            value={intervalSeconds}
            onChange={(event) => setIntervalSeconds(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-brand-dark"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="statusCode"
            className="block text-sm font-medium text-ink dark:text-ink-dark"
          >
            Erwarteter Status
          </label>
          <input
            id="statusCode"
            type="number"
            min={100}
            max={599}
            required
            value={expectedStatusCode}
            onChange={(event) => setExpectedStatusCode(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-brand-dark"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-down dark:text-down-dark">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-60 dark:bg-brand-dark dark:text-canvas-dark"
        >
          {submitting ? "Wird hinzugefügt..." : "Dienst hinzufügen"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted hover:underline dark:text-muted-dark"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
