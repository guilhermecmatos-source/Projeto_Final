# FleetAI — Plano de Testes Frontend

Estratégia de testes alinhada a [`specs.md`](../specs.md) e [`03-specs.md`](./03-specs.md).

---

## 1. Ferramentas e comandos

| Comando | Descrição |
|---------|-----------|
| `cd frontend && npm run test:unit` | Testes unitários e de componentes (Vitest) |
| `cd frontend && npm run test:unit:watch` | Modo watch |
| `cd frontend && npm run test:e2e` | Testes E2E (Playwright) |
| `cd frontend && npm run lint` | ESLint via Next.js |
| `cd frontend && npm run build` | Build de produção |

**Configuração:** `frontend/vitest.config.ts` (jsdom, alias `@`, cobertura mínima 90% lines/functions).

---

## 2. Testes unitários

### 2.1 Utilitários (`src/lib/`)

| Arquivo | Cenários |
|---------|----------|
| `currency.test.ts` | Formatação BRL, máscara, parse |
| `api-errors.test.ts` | Mensagem de conexão, timeout, 5xx, erro da API, fallback |
| `validators.test.ts` | CPF, e-mail, placa (quando implementado) |
| `permissions.test.ts` | `canAccessRoute`, `filterNavByRole`, normalização de perfis |

### 2.2 Componentes de estado (`src/components/ui/`)

| Arquivo | Cenários |
|---------|----------|
| `LoadingState.test.tsx` | Renderiza mensagem; `role="status"`; `aria-live="polite"` |
| `ErrorState.test.tsx` | Exibe mensagem; botão retry chama `onRetry`; `role="alert"` |
| `EmptyState.test.tsx` | Título, descrição, ação opcional renderizados |
| `ListPageStates.test.tsx` | Prioridade: loading > erro > empty > children |

---

## 3. Testes de componentes (React Testing Library)

### 3.1 Formulários

| Componente | Cenários |
|------------|----------|
| `FormField` | Label associado ao input via `htmlFor`; campo obrigatório |
| `FormShell` | Submit com loading; exibe erro da API; exibe sucesso |
| `FormModal` | Escape fecha; `role="dialog"`; `aria-modal="true"` |

### 3.2 Layout

| Componente | Cenários |
|------------|----------|
| `PageHeader` | Breadcrumb com `aria-label`; título e ações |
| `AccessDenied` | Mensagem e link para dashboard |

---

## 4. Testes de renderização condicional

| Página | Estados a validar |
|--------|-------------------|
| `vehicles/page.tsx` | Loading → erro+retry → empty → grid de cards |
| `users/page.tsx` | Loading → erro+retry → empty → tabela |
| `drivers/page.tsx` | Loading → erro+retry → empty → lista |
| `fuel/page.tsx` | Loading → erro+retry → empty → registros |
| `dashboard/page.tsx` | Loading → erro+retry → KPIs e gráficos |

**Critério:** em estado de erro, lista não deve ser apresentada como "vazia".

---

## 5. Testes de integração com APIs

Testados via mocks do Axios em testes de componente ou páginas:

| Cenário | Comportamento esperado |
|---------|------------------------|
| Resposta 200 com array | Dados renderizados |
| Resposta 200 com não-array | Lista vazia (fallback seguro) |
| Resposta 401 | Interceptor redireciona (teste de módulo `api.ts`) |
| Resposta 500 | `ErrorState` com mensagem de servidor |
| Sem resposta (rede) | Mensagem de conexão |
| Timeout (>30s) | Mensagem de timeout |

---

## 6. Testes responsivos

Validação manual ou E2E com viewports:

| Viewport | Largura | Verificações |
|----------|---------|--------------|
| Mobile | 375px | Bottom nav visível; sidebar oculta; touch targets ≥ 44px |
| Tablet | 768px | Grid 2 colunas; drawer funcional |
| Desktop | 1280px | Sidebar fixa; sem bottom nav; grid 3–4 colunas |

**CSS crítico:** `.table-responsive`, `.sticky-mobile-actions`, `pb-24` no mobile.

---

## 7. Testes de acessibilidade

| Verificação | Método |
|-------------|--------|
| `lang="pt-BR"` | Inspeção do layout |
| Skip link | Tab no carregamento → link visível |
| Foco visível | Tab através de formulário login |
| Labels em formulários | `getByLabelText` nos testes RTL |
| Botões icônicos | Presença de `aria-label` ou texto visível |
| Modais | `aria-modal`, fechamento com Escape |
| Loading | `aria-live="polite"` |
| Erro | `role="alert"` |

Ferramenta recomendada: axe-core (integração futura com Playwright).

---

## 8. Testes E2E (Playwright)

### 8.1 Configuração

Arquivo: `frontend/playwright.config.ts`  
Base URL: `http://localhost:3000`  
Pré-requisito: backend e frontend em execução.

### 8.2 Cenários prioritários

| ID | Fluxo | Passos |
|----|-------|--------|
| E2E-01 | Login válido | Acessar `/login` → credenciais admin → redireciona `/dashboard` |
| E2E-02 | Login inválido | Credenciais erradas → mensagem de erro visível |
| E2E-03 | Navegação sidebar | Login → clicar Veículos → URL `/vehicles` |
| E2E-04 | Cadastro veículo | Veículos → modal → preencher → sucesso |
| E2E-05 | Acesso negado | Login como solicitante → `/users` → mensagem acesso negado |
| E2E-06 | Logout | Sidebar → sair → `/login` |

### 8.3 Cenários de erro e fallback

| ID | Cenário |
|----|---------|
| E2E-ERR-01 | Backend offline → listagem exibe erro com retry |
| E2E-ERR-02 | Retry após erro → dados carregados |

---

## 9. Testes de regressão visual

| Área | Pontos de verificação |
|------|----------------------|
| Login | Split hero + card centralizado |
| Dashboard | KPIs, gráficos, mapa |
| Veículos | Cards com chips de status |
| Sidebar | Item ativo com `.nav-active` |
| Temas | Alternância não quebra contraste |

Ferramenta recomendada: Playwright `toHaveScreenshot()` (baseline futura).

---

## 10. Testes de usabilidade (checklist manual)

- [ ] Mensagens de erro em português claro
- [ ] Botão de ação principal sempre visível (sticky no mobile)
- [ ] Feedback de loading perceptível em < 300ms
- [ ] Empty state orienta próxima ação (CTA)
- [ ] Breadcrumb indica localização
- [ ] Busca filtra resultados em tempo real

---

## 11. Validação de estados loading/skeleton/error

| Estado | Componente | Atributos ARIA |
|--------|------------|----------------|
| Loading | `LoadingState` | `role="status"`, `aria-live="polite"` |
| Erro | `ErrorState` | `role="alert"` |
| Empty | `EmptyState` | Texto descritivo, sem ARIA alert |
| Retry | `ErrorState` button | Foco retorna ao conteúdo após sucesso |

---

## 12. Ciclo de execução por etapa de implementação

Após cada etapa de desenvolvimento:

1. `npm run test:unit`
2. Corrigir falhas
3. `npm run lint`
4. `npm run build` (etapas que alteram páginas ou layout)
5. Reexecutar até estabilização

---

## 13. Cobertura atual

| Área | Arquivo(s) | Status |
|------|------------|--------|
| `lib/currency` | `currency.test.ts` | ✅ Testado |
| `lib/api-errors` | `api-errors.test.ts` | ✅ Testado |
| `lib/permissions` | `permissions.test.ts` | ✅ Testado |
| `LoadingState` | `LoadingState.test.tsx` | ✅ Testado |
| `ErrorState` | `ErrorState.test.tsx` | ✅ Testado |
| `EmptyState` | `EmptyState.test.tsx` | ✅ Testado |
| `ListPageStates` | `ListPageStates.test.tsx` | ✅ Testado |
| E2E login | `e2e/login.spec.ts` | ✅ Spec inicial |
| Playwright config | `playwright.config.ts` | ✅ Configurado |
| Páginas (RTL) | — | ⏳ Planejado |
