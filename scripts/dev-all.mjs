import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const tsxCli = fileURLToPath(
  new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url),
);

const children = [
  spawn(process.execPath, [tsxCli, "watch", "src/server.ts"], {
    stdio: "inherit",
  }),
  spawn(process.execPath, [tsxCli, "watch", "src/worker-process.ts"], {
    stdio: "inherit",
  }),
];

const shutdown = () => {
  for (const child of children) {
    child.kill();
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

for (const child of children) {
  child.on("exit", shutdown);
}
