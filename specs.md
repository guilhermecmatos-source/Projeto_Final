# FleetAI — Especificação Frontend

Documento de requisitos funcionais, regras de negócio, arquitetura, fluxos, contratos de API, modelos de dados, componentes de interface, comportamento visual, critérios de aceite e restrições técnicas do frontend.

> Versão alinhada à implementação em `frontend/`. Não descreve requisitos além do que está implementado ou explicitamente padronizado neste documento.

---

## 1. Visão geral

**FleetAI** é uma plataforma web de gestão de frotas com interface operacional escura, mobile-first e suporte a múltiplos perfis de usuário. O frontend é uma aplicação **Next.js 14 (App Router)** com React 18 e TypeScript.

### 1.1 Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14, App Router |
| UI | React 18, TypeScript 5.6 |
| Estilos | Tailwind CSS 3.4 + tokens em `globals.css` |
| HTTP | Axios (`frontend/src/services/api.ts`) |
| Mapas | Leaflet |
| Ícones | Google Material Symbols Outlined |
| Fonte | Inter (`next/font/google`) |
| Testes | Vitest + jsdom; Playwright (E2E configurado) |

### 1.2 Variáveis de ambiente

| Variável | Escopo | Padrão | Uso |
|----------|--------|--------|-----|
| `NEXT_PUBLIC_API_URL` | Browser | `/api` | Base URL da API no cliente |
| `BACKEND_URL` | Server/build | `http://127.0.0.1:3001` | Proxy de rewrites Next.js |
| `INTERNAL_API_URL` | Server | alias de `BACKEND_URL` | Fallback SSR |

---

## 2. Arquitetura frontend

### 2.1 Estrutura de pastas

```
frontend/src/
├── app/           # Rotas (pages) — todas client components
├── components/    # UI reutilizável (layout, forms, maps, ai, profiles)
├── hooks/         # useAuth, useOffline
├── lib/           # Utilitários, permissões, temas, validadores, AI local
├── services/      # Cliente Axios e módulos de API por domínio
└── types/         # Interfaces TypeScript compartilhadas
```

### 2.2 Separação de responsabilidades

| Responsabilidade | Localização |
|------------------|-------------|
| Apresentação | `components/`, `app/**/page.tsx` |
| Estado local | `useState`/`useMemo` por página; `localStorage` para auth/tema |
| Regras de negócio (cliente) | `lib/permissions.ts`, `lib/validators.ts`, `lib/ai/*` |
| Acesso a dados | `services/api.ts` |
| Roteamento | App Router (`app/`) + `lib/navigation.ts` |
| Estilos | `globals.css`, `tailwind.config.ts`, classes utilitárias |

### 2.3 Autenticação

- Token JWT em `localStorage.token`.
- Usuário em `localStorage.user` (JSON).
- Hook `useAuth`: redireciona para `/login` se não houver token.
- Interceptor Axios: em resposta `401`, limpa storage e redireciona para `/login`.
- Rotas públicas: `/login`, `/register`, `/forgot-password`.

### 2.4 Controle de acesso (RBAC)

Perfis normalizados em `lib/permissions.ts`:

- `administrador` (alias `admin`)
- `gestor` (alias `attendant`)
- `motorista`
- `solicitante` (alias `client`)

**Regra:** itens de navegação são filtrados por perfil via `filterNavByRole()`. Acesso direto por URL a rotas restritas exibe tela **Acesso negado** (componente `AccessDenied`), sem redirecionamento automático.

Rotas com restrição explícita:

| Rota | Perfis permitidos |
|------|-------------------|
| `/users`, `/comercial`, `/perfis`, `/settings` | administrador |
| `/vehicles`, `/drivers`, `/maintenance`, `/ai-security`, `/intelligence`, `/reports`, `/partners`, `/cockpit`, `/command-center`, `/bi`, `/documents`, `/copilot` | administrador, gestor |
| `/logistics`, `/fuel`, `/inspection` | administrador, gestor, motorista |
| `/travels`, `/dashboard`, `/profile`, `/mobile`, `/notifications`, `/chat` | todos os perfis autenticados |

---

## 3. Design system

### 3.1 Tokens visuais

Paleta Material-inspired definida em `tailwind.config.ts`:

- **Primary:** `#ff9f00` (laranja operacional)
- **Secondary:** azul corporativo
- **Surface:** tons escuros (`#0b0e14` background)
- **Error:** vermelho para falhas e alertas críticos

Escala tipográfica: `headline-lg/md/sm`, `body-lg/md`, `label-md`.

### 3.2 Classes de componente (`globals.css`)

| Classe | Uso |
|--------|-----|
| `.raised-card` | Cartão principal de conteúdo |
| `.fleet-form-card` | Seções de formulário |
| `.input-fleet` | Campos de texto/select/textarea |
| `.btn-primary` / `.btn-secondary` | Botões de ação |
| `.chip-active/warning/error/pending` | Chips de status |
| `.zebra-table` + `.table-responsive` | Tabelas responsivas |
| `.touch-target` | Alvo mínimo 44×44px (mobile) |
| `.sticky-mobile-actions` | Rodapé fixo de formulários no mobile |
| `.badge-admin/gestor/solicitante` | Badges de perfil |

### 3.3 Temas

Oito temas via `data-theme` em `<html>`, persistidos em `localStorage` (`fleet_theme`):

`corporate-blue`, `corporate-white`, `corporate-yellow`, `light`, `dark` (padrão), `high-contrast`, `colorblind`, `low-vision`.

Componente: `ThemeSwitcher.tsx`.

### 3.4 Breakpoints responsivos

| Breakpoint | Comportamento |
|------------|---------------|
| `< 640px` (mobile) | Sidebar em drawer; bottom nav fixa; tabelas viram cards; inputs 16px (evita zoom iOS) |
| `640px–1023px` (tablet) | Grids 2 colunas; sidebar ainda em drawer |
| `≥ 1024px` (desktop) | Sidebar fixa 256px; sem bottom nav; grids até 4 colunas |

Safe-area: classes `safe-bottom`, `safe-top`, `min-h-screen-safe`, `safe-area-padding`.

---

## 4. Componentes de interface

### 4.1 Layout

| Componente | Responsabilidade |
|------------|------------------|
| `AppShell` | Shell autenticado: sidebar, header mobile, bottom nav, gate de auth, indicador offline, guarda de rota |
| `Sidebar` | Navegação lateral filtrada por perfil |
| `TopHeader` | Cabeçalho mobile com slot de busca |
| `MobileBottomNav` | 4 atalhos + menu |
| `ProfileSwitcher` | Troca de perfis múltiplos |

### 4.2 UI primitivos

| Componente | Responsabilidade |
|------------|------------------|
| `PageHeader` | Título, breadcrumb, ações; `nav` com `aria-label="Trilha de navegação"` |
| `ActionButton` / `ActionLink` | CTAs padronizados |
| `KpiCard` | Tiles de KPI no dashboard |
| `FormModal` | Modal acessível (`role="dialog"`, `aria-modal`, Escape fecha) |
| `Icon` | Material Symbols (`aria-hidden`) — botões devem ter texto ou `aria-label` |
| `LoadingState` | Feedback de carregamento com `role="status"` e `aria-live="polite"` |
| `ErrorState` | Mensagem de erro com botão **Tentar novamente** |
| `EmptyState` | Ausência de dados com título, descrição e ação opcional |
| `ListPageStates` | Orquestra loading → erro → vazio → conteúdo em listagens |
| `AccessDenied` | Tela de acesso negado por perfil |
| `OfflineIndicator` | Banner de status online/offline |
| `ChecklistToggle` | Toggle com `aria-pressed` |

### 4.3 Formulários

| Componente | Responsabilidade |
|------------|------------------|
| `FormShell` | Wrapper padrão de páginas de cadastro: voltar, submit, loading, erro/sucesso |
| `FormField` | Campo com `htmlFor`/`id` vinculados |
| `FormActions` | Linha submit/cancel com estado de loading |
| `SearchableCombobox` | Select filtrável |
| `AddressAutocomplete` | Endereço com geocoding |
| `CurrencyField` | Input BRL |
| `DateRangePicker` | Filtro de período |
| `FileUploadField` / `CameraPhotoField` | Upload de arquivos/foto |

### 4.4 Comportamento de formulários

1. Submit desabilita botão e exibe texto de loading (`Salvando...`).
2. Erros da API exibidos em banner vermelho; mensagem extraída de `response.data.error` quando disponível.
3. Sucesso exibido em banner verde; redirecionamento opcional via `redirectOnSuccess`.
4. Validação visual no cliente (ex.: CPF, e-mail) bloqueia submit e exibe mensagem inline.
5. Campos obrigatórios usam atributo HTML `required` e label visível.

---

## 5. Estados de tela

Toda página que consome API deve tratar explicitamente os estados abaixo.

### 5.1 Loading

- Listagens: `ListPageStates` com `LoadingState` (spinner + mensagem configurável).
- `AppShell`: `LoadingState` centralizado enquanto `useAuth` não está `ready`.
- Formulários: botão desabilitado + texto `Salvando...`.
- KPIs durante loading exibem traço (`—`) em vez de zero.

### 5.2 Erro

- Falhas de fetch **não** devem ser silenciadas (não usar `.catch(() => setItems([]))` sem estado de erro).
- Mensagem padrão via `extractApiError()` em `lib/api-errors.ts`:
  - Sem resposta HTTP → "Não foi possível conectar à API..."
  - Timeout → "A requisição expirou..."
  - Status ≥ 500 → mensagem de servidor indisponível
  - Outros → `response.data.error` ou fallback configurável
- `ErrorState` oferece botão **Tentar novamente** que chama `onRetry`.

### 5.3 Ausência de dados (empty)

- Quando `loading=false`, `error=null` e lista vazia (ou filtro sem resultados).
- `EmptyState` com título, descrição opcional e CTA opcional (ex.: link para cadastro).
- Mensagens em português, específicas ao contexto da página.

### 5.4 Timeout e retry

- Timeout Axios: 30 segundos (configurado em `api.ts`).
- Retry manual via botão em `ErrorState`; não há retry automático.

### 5.5 Acesso negado

- Renderizado por `AppShell` quando `canAccessRoute()` retorna `false`.
- Não exibe conteúdo da página; oferece link para `/dashboard`.

---

## 6. Acessibilidade

Requisitos mínimos implementados:

| Requisito | Implementação |
|-----------|---------------|
| Idioma | `lang="pt-BR"` em `<html>` |
| Skip link | Link "Ir para o conteúdo" no `layout.tsx`, visível ao foco |
| Navegação por teclado | Foco visível em inputs/botões (`focus:ring`); Escape fecha modais |
| Labels | `FormField` com `htmlFor`; login com labels explícitos |
| Contraste | Tema `high-contrast` disponível; paleta escura com primary em laranja |
| ARIA | `aria-label` em botões icônicos; `aria-live` em loading/erro; `aria-current` na nav ativa |
| Alvos de toque | `.touch-target` 44px mínimo em controles mobile |
| Imagens decorativas | `alt=""` ou ícones com `aria-hidden` |

---

## 7. Fluxos de navegação

### 7.1 Entrada

```
/ → verifica token → /dashboard (autenticado) ou /login (não autenticado)
```

### 7.2 Navegação autenticada

- Sidebar (desktop) / drawer (mobile) com itens de `NAV_ITEMS`.
- Bottom nav mobile: dashboard, travels, vehicles, drivers + menu.
- Breadcrumb em `PageHeader`: Sede Central › Unidade Operacional › [módulo].

### 7.3 Rotas principais (52)

**Auth:** `/login`, `/register`, `/forgot-password`

**Operação:** `/dashboard`, `/cockpit`, `/profile`, `/users`, `/settings`, `/perfis`

**Frota:** `/vehicles`, `/vehicles/register`, `/drivers`, `/drivers/register`

**Viagens:** `/travels`, `/travels/register`, `/travels/assign`, `/travels/matching`, `/travels/suggestions`, `/travels/ruv`

**Logística:** `/logistics`, `/logistics/dispatch`, `/logistics/movement`

**Manutenção/combustível/inspeção:** `/maintenance`, `/maintenance/register`, `/maintenance/schedule`, `/fuel`, `/fuel/register`, `/inspection`, `/inspection/new`, `/inspection/register`, `/inspection/detail`

**IA/Inteligência/Relatórios:** `/ai-security`, `/ai-security/visual`, `/ai-security/evidence`, `/ai-security/plan`, `/intelligence`, `/reports`, `/reports/export`, `/bi`, `/copilot`

**Comunicação/Notificações:** `/chat`, `/notifications`

**Outros:** `/command-center`, `/documents`, `/mobile`, `/comercial`, `/partners`, `/partners/register`, `/partners/support`, `/partners/docs`

---

## 8. Integração frontend/backend

### 8.1 Cliente HTTP

- Base URL: `NEXT_PUBLIC_API_URL` (padrão `/api`).
- Proxy Next.js reescreve `/api/*` e `/uploads/*` para o backend.
- Header `Authorization: Bearer <token>` em todas as requisições autenticadas.

### 8.2 Módulos de API

`authApi`, `dashboardApi`, `geocodingApi`, `uploadsApi`, `vehiclesApi`, `driversApi`, `travelsApi`, `usersApi`, `ruvApi`, `intelligenceApi`, `reportsApi`, `partnersApi`, `contractsApi`, `fuelApi`, `maintenanceApi`.

### 8.3 Padrão de consumo em páginas

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const load = useCallback(() => {
  setLoading(true);
  setError(null);
  domainApi.list()
    .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
    .catch((err) => {
      setItems([]);
      setError(extractApiError(err, "Mensagem fallback."));
    })
    .finally(() => setLoading(false));
}, []);
```

### 8.4 Contratos preservados

A implementação frontend **não altera** payloads nem endpoints existentes. Formato de erro esperado: `{ error: string }`.

---

## 9. Regras de renderização

1. Dados de API sempre validados como array antes de `.map()` (`Array.isArray(res.data) ? res.data : []`).
2. Chips de status mapeados por dicionário local (ex.: `STATUS_STYLE` em veículos).
3. Filtros por aba/busca aplicados em `useMemo` ou variável derivada, sem mutar lista original.
4. Modais renderizados condicionalmente (`if (!open) return null`).
5. Componentes de mapa carregados apenas em páginas que os utilizam.
6. `OfflineIndicator` visível em contexto piloto (`/drivers`, perfil `attendant`).

---

## 10. Mensagens de erro padronizadas

| Contexto | Mensagem |
|----------|----------|
| Conexão API | "Não foi possível conectar à API. Verifique se o backend está em execução." |
| Credenciais | "Credenciais inválidas." ou mensagem da API |
| Salvar formulário | "Não foi possível salvar. Verifique os dados e tente novamente." |
| Listagem | Mensagem específica por módulo + botão retry |
| Acesso negado | "Você não tem permissão para acessar esta página." |

Erros de validação visual (CPF, e-mail) exibidos inline antes do submit.

---

## 11. Padrões de interação

- Clique em overlay fecha sidebar (mobile) e modais.
- `Escape` fecha modais (`FormModal`).
- Tabs de filtro: botão com borda inferior ativa (`border-primary`).
- Busca em listagens: filtro client-side em tempo real.
- Botões primários: ícone + texto; desabilitados com `opacity-50` durante loading.
- Toast: **não implementado** — feedback via banners inline.

---

## 12. Critérios de aceite (frontend)

- [ ] Responsivo em desktop, tablet e mobile sem overflow horizontal em listagens principais.
- [ ] Todas as listagens principais (`vehicles`, `users`, `drivers`, `fuel`, `dashboard`) tratam loading, erro com retry e empty state.
- [ ] Formulários exibem loading no submit e erro da API.
- [ ] Navegação por teclado funcional em modais e formulários.
- [ ] Rotas restritas exibem `AccessDenied` para perfis não autorizados.
- [ ] Skip link acessível no layout raiz.
- [ ] Testes unitários passam (`npm run test:unit`).
- [ ] Build sem erros (`npm run build`).
- [ ] Lint sem erros (`npm run lint`).

---

## 13. Restrições técnicas

- Não introduzir bibliotecas de estado global (Redux, Zustand, React Query).
- Não criar abstrações além dos componentes de estado documentados.
- As novas rotas e módulos listados acima representam a evolução do projeto; evite implementar rotas inteiramente novas fora desta especificação atualizada sem prévia aprovação.
- Manter compatibilidade com contratos de API atuais.
- Páginas permanecem client components (`"use client"`).
- Evitar arquivos monolíticos; extrair componentes reutilizáveis quando padrão se repete ≥ 3 vezes.

---

## 14. Melhorias implementadas nesta versão

1. **Componentes de estado padronizados:** `LoadingState`, `ErrorState`, `EmptyState`, `ListPageStates`.
2. **Extração de erros de API:** `extractApiError()` com tratamento de conexão, timeout e 5xx.
3. **Guarda de rota visual:** `AccessDenied` integrado ao `AppShell`.
4. **Acessibilidade:** skip link, `aria-label` no breadcrumb, `aria-labelledby` em modais.
5. **Listagens principais:** erro explícito com retry em vez de falha silenciosa.
6. **Empty states com CTA:** link para cadastro quando aplicável.
7. **Timeout Axios:** 30s configurado globalmente.
8. **Documentação de componentes:** `doc/components.md`.
9. **Cobertura de testes ampliada:** componentes de estado e `api-errors`.
