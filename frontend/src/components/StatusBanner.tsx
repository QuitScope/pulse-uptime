import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

export function StatusBanner({ allOperational }: { allOperational: boolean }) {
  if (allOperational) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-up/10 px-5 py-4 text-up dark:bg-up-dark/10 dark:text-up-dark">
        <span className="shrink-0">
          <CheckCircle weight="fill" size={24} />
        </span>
        <p className="font-medium">Alle Systeme funktionieren</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-down/10 px-5 py-4 text-down dark:bg-down-dark/10 dark:text-down-dark">
      <span className="shrink-0">
        <WarningCircle weight="fill" size={24} />
      </span>
      <p className="font-medium">Beeinträchtigung erkannt</p>
    </div>
  );
}
