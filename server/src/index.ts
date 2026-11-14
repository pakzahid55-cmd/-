import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createStore } from "./db/create-store.js";

async function main(): Promise<void> {
  const store = await createStore();
  const app = createApp(store);
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`[kajok-server] KAJOK API listening on http://0.0.0.0:${env.port}`);
    console.log(`[kajok-server] Store: ${store.kind} | Env: ${env.nodeEnv}`);
    console.log(`[kajok-server] Online payments: ${env.onlinePaymentsEnabled ? "enabled" : "disabled (COD only)"}`);
  });
}

main().catch((err) => {
  console.error("[kajok-server] Fatal startup error:", err);
  process.exit(1);
});
