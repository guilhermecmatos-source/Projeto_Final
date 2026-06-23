# FleetAI — Gestão Inteligente de Frotas

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

## Sobre o Projeto

Plataforma **Full Stack** de gestão de frotas com interface operacional (FleetAI), API REST e persistência em MySQL. O frontend é Next.js 14 com App Router; o backend é Node.js + Express + TypeScript.

### Equipe

- **Guilherme Matos** — [GitHub](https://github.com/guilhermecmatos-source)
- **Jeovana** — [GitHub](https://github.com/Jeovanalopesvalente)
- **Wanderson** — [GitHub](https://github.com/rodrigues123321)
- **Marco Túlio** — [GitHub](https://github.com/MarcoTuliops22)

---

## Arquitetura

| Camada | Pasta | Stack |
|--------|-------|-------|
| Frontend | `frontend/` | Next.js 14, React 18, TypeScript, Tailwind CSS, Axios |
| Backend | `backend/` | Node.js, Express, TypeScript, MySQL |

### Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`specs.md`](specs.md) | Especificação frontend (requisitos, design system, estados, acessibilidade) |
| [`doc/03-specs.md`](doc/03-specs.md) | Resumo da especificação frontend |
| [`doc/testing.md`](doc/testing.md) | Plano de testes (unitários, componentes, E2E, a11y) |
| [`doc/components.md`](doc/components.md) | Documentação de componentes reutilizáveis |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado)
- Ou Node.js 20+ e MySQL 8 para desenvolvimento local

---

## Execução com Docker (recomendado)

```bash
git clone https://github.com/guilhermecmatos-source/Projeto_Final.git
cd Projeto_Final
cp .env.example .env
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API (health) | http://localhost:3001/health |
| Login padrão | `admin@fleetai.com` / `admin123` |

O frontend aguarda o backend ficar saudável antes de iniciar.

---

## Desenvolvimento local

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run dev

# Frontend (outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Variáveis de ambiente

### Raiz (`.env.example`)

Variáveis Docker/MySQL compartilhadas.

### Frontend (`frontend/.env.example`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL da API no browser (proxy Next.js) |
| `BACKEND_URL` | `http://127.0.0.1:3001` | URL do backend para rewrites (dev local) |

### Backend (`backend/.env.example`)

Configuração MySQL, JWT e porta da API.

---

## Comandos — Frontend

```bash
cd frontend

npm run dev          # Servidor de desenvolvimento (porta 3000)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint (next lint)
npm run test:unit    # Testes unitários e de componentes (Vitest)
npm run test:unit:watch
npm run test:e2e     # Testes E2E (Playwright — requer app rodando)
```

## Comandos — Backend

```bash
cd backend

npm run dev          # API em modo desenvolvimento
npm run build        # Compilação TypeScript
npm run db:migrate   # Migrações do banco
npm run db:seed      # Dados iniciais
```

---

## Funcionalidades principais

- Dashboard operacional com KPIs, mapa e alertas
- Gestão de veículos, motoristas e usuários (RBAC)
- Viagens, logística, manutenção, abastecimento e inspeção
- IA de suporte, inteligência e relatórios
- Interface responsiva (mobile, tablet, desktop)
- Temas acessíveis (alto contraste, baixa visão, daltônico)
- Estados padronizados: loading, erro com retry, empty state

---

## Testes

Após alterações no frontend, execute:

```bash
cd frontend && npm run test:unit && npm run lint
```

Detalhes em [`doc/testing.md`](doc/testing.md).
