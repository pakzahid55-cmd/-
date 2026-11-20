import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createStore } from "./db/create-store.js";

async function main(): Promise<void> {
  const store = await createStore();
  const app = createApp(store);
  app.listen(env.port, env.hostedPreview ? "127.0.0.1" : "0.0.0.0", () => {
    console.log(`[kujuk-server] KUJUK API listening on http://${env.hostedPreview ? "127.0.0.1" : "0.0.0.0"}:${env.port}`);
    console.log(`[kujuk-server] Store: ${store.kind} | Env: ${env.nodeEnv}`);
    console.log(`[kujuk-server] Payment: COD only`);
  });
}

main().catch((err) => {
  console.error("[kujuk-server] Fatal startup error:", err);
  process.exit(1);
});
