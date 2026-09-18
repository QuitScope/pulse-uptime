import { AppDataSource } from "../db/data-source.js";

// Initialisiert (falls noetig) und leert alle Tabellen per CASCADE, damit
// Testdaten sich nicht in der Dev-DB ansammeln. Vor jedem Test aufrufen.
export async function resetDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.query(
    'TRUNCATE TABLE "check", "incident", "monitor" RESTART IDENTITY CASCADE',
  );
}
