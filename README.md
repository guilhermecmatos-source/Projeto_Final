# FleetAI — Plataforma Inteligente de Mobilidade e Gestão de Frotas

Sistema completo para gestão operacional, logística e administrativa de frotas empresariais com módulos de IA baseados em regras inteligentes.

## Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Banco:** MySQL 8+
- **Infra:** Docker & Docker Compose

## Estrutura

```
/backend   → API RESTful
/frontend  → Interface web
```

## Início rápido

### Com Docker

```bash
docker compose up -d
docker compose exec backend npm run db:migrate
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Local (sem Docker)

1. Configure o MySQL em `backend/.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
2. Backend:
   ```bash
   cd backend
   npm install
   npm run db:migrate
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## Administrador padrão

| Campo | Valor |
|-------|-------|
| E-mail | `admin@fleetplatform.com` |
| Senha | `Admin@123` |

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login JWT |
| GET | `/api/vehicles` | Listar veículos |
| GET | `/api/drivers` | Listar motoristas |
| GET | `/api/travels` | Listar viagens |
| GET | `/api/fuel/report` | Relatório de combustível |
| GET | `/api/maintenance/alerts` | Alertas preventivos |
| GET | `/api/dashboard` | KPIs e alertas IA |

## Papéis de usuário

- **admin** — controle total
- **attendant** — registro operacional
- **client** — autocadastro e consulta
