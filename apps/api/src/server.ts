import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { PostgresCascadiaStore } from "./postgres-store.js";
import { InMemoryCascadiaStore } from "./store.js";

const config = loadConfig();
const store = config.DATA_STORE === "postgres" ? new PostgresCascadiaStore(config.DATABASE_URL!) : new InMemoryCascadiaStore();
const app = buildApp(config, store);

app.addHook("onClose", async () => {
  if (store instanceof PostgresCascadiaStore) await store.close();
});

const address = await app.listen({ port: config.PORT, host: config.HOST });
app.log.info({ address }, "Cascadia API listening");

let closing = false;
async function shutdown(signal: string): Promise<void> {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, "Graceful shutdown started");
  const deadline = setTimeout(() => process.exit(1), 10_000);
  deadline.unref();
  try { await app.close(); process.exitCode = 0; }
  catch (error) { app.log.error(error, "Graceful shutdown failed"); process.exitCode = 1; }
  finally { clearTimeout(deadline); }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
