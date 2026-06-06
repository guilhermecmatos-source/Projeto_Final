# Projeto Final - Aplicação Full Stack (React + Node.js + SQLite) 🚀

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

## 📋 Sobre o Projeto

Este é o nosso projeto final de curso, onde desenvolvemos uma aplicação **Full Stack** completa e integrada. O ecossistema une uma interface rica e dinâmica no Front-end com uma API RESTful estruturada no Back-end, utilizando persistência de dados real com banco de dados.

---

## 👥 Equipe do Projeto

O projeto foi planejado e desenvolvido em conjunto por:

- 💻 **Guilherme Matos** — [GitHub](https://github.com/guilhermecmatos-source)
- 👩‍💻 **Jeovana**
- 👨‍💻 **Wanderson** — [GitHub](https://github.com/rodrigues123321)
- 👨‍💻 **Marco Túlio** — [GitHub](https://github.com/MarcoTuliops22)

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi componentizado e dividido estritamente entre cliente e servidor:

### **Front-end (`/front`)**
- **React**: Biblioteca para construção de uma interface Single Page Application (SPA) moderna e responsiva.

### **Back-end & Banco de Dados (`/backend`)**
- **Node.js & Express**: Framework minimalista para criação das rotas da API e gerenciamento das requisições HTTP.
- **CORS**: Middleware para permitir o compartilhamento de recursos entre o front e o back com segurança.
- **SQLite3**: Banco de dados relacional leve e integrado para persistência de dados local de forma eficiente.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado — funciona em qualquer máquina)
- Ou [Node.js 20+](https://nodejs.org/) + MySQL 8 para desenvolvimento local

### 🐳 Docker (recomendado)

```bash
git clone https://github.com/guilhermecmatos-source/Projeto_Final.git
cd Projeto_Final
cp .env.example .env
docker compose up --build
```

Acesse:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/health
- **Login:** `admin@fleetai.com` / `admin123`

O frontend aguarda o backend ficar saudável antes de iniciar (corrige `ECONNREFUSED`).

**Problema comum no Windows:** scripts `.sh` com CRLF quebram no Docker. Este projeto usa scripts Node (`backend/scripts/docker-start.js` e `frontend/scripts/wait-backend.js`) para evitar isso.

### 💻 Desenvolvimento local (sem Docker)

```bash
# Backend
cd backend && npm install && npm run db:migrate && npm run dev

# Frontend (outro terminal)
cd frontend && npm install && npm run dev
```

Configure `backend/.env` e `frontend/.env` conforme os arquivos `.env.example`.

---
🧠 Aprendizados Consolidados
Desenvolver esta aplicação em equipe nos permitiu dominar conceitos fundamentais do mercado:
Gerenciamento de branches e resolução de conflitos usando Git/GitHub.
Comunicação assíncrona entre Front-end e Back-end.
Criação de endpoints (rotas) e manipulação de requisições HTTP (GET, POST, etc.) com Express.
Modelagem, criação e manipulação de tabelas em banco de dados relacional com SQLite.
Gerenciamento de estado e renderização dinâmica de componentes em React.

### 🚀 Comandos para subir pro GitHub:

Depois de colar e salvar o arquivo, roda isso aqui no seu terminal para atualizar o repositório:

```bash
git add README.md
git commit -m "docs: add team members and official project overview"
git push origin main
