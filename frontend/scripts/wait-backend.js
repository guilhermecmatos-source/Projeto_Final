const url = (process.env.BACKEND_URL || "http://backend:3001").replace(/\/$/, "");
const maxRetries = Number(process.env.WAIT_RETRIES || 90);
const intervalMs = Number(process.env.WAIT_INTERVAL || 2) * 1000;

async function isHealthy() {
  const res = await fetch(`${url}/health`);
  const body = await res.json();
  return body.status === "ok";
}

(async () => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (await isHealthy()) {
        console.log(`[frontend] API pronta (tentativa ${attempt}).`);
        process.exit(0);
      }
    } catch {
      /* retry */
    }
    console.log(`[frontend] Aguardando API em ${url}/health (${attempt}/${maxRetries})...`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error(`[frontend] ERRO: API não respondeu em ${url}`);
  process.exit(1);
})();
