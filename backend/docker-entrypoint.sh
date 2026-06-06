#!/bin/sh
set -e

echo "[backend] Aguardando MySQL e aplicando migrações..."
npm run db:migrate

echo "[backend] Iniciando API..."
exec npm run dev
