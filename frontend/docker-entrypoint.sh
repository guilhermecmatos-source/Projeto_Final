#!/bin/sh
set -e

BACKEND_URL="${BACKEND_URL:-http://backend:3001}"
MAX_RETRIES="${WAIT_RETRIES:-90}"
INTERVAL="${WAIT_INTERVAL:-2}"

echo "[frontend] Aguardando API em ${BACKEND_URL}/health ..."

attempt=0
while [ "$attempt" -lt "$MAX_RETRIES" ]; do
  attempt=$((attempt + 1))
  if node -e "
    fetch('${BACKEND_URL}/health')
      .then((r) => r.json())
      .then((j) => process.exit(j.status === 'ok' ? 0 : 1))
      .catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "[frontend] API pronta (tentativa ${attempt})."
    exec npm run dev
  fi
  echo "[frontend] API indisponível (${attempt}/${MAX_RETRIES})..."
  sleep "$INTERVAL"
done

echo "[frontend] ERRO: API não respondeu em ${BACKEND_URL}"
exit 1
