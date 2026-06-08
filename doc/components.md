# FleetAI — Documentação de Componentes Frontend

Referência dos componentes reutilizáveis em `frontend/src/components/`.

---

## Layout (`components/layout/`)

### AppShell

Shell principal para páginas autenticadas.

| Prop | Tipo | Descrição |
|------|------|-----------|
| `children` | `ReactNode` | Conteúdo da página |
| `headerTitle` | `string?` | Título no header mobile |
| `searchPlaceholder` | `string?` | Placeholder de busca no header |
| `headerAction` | `ReactNode?` | Ações extras no header |
| `showOfflineForPilot` | `boolean` | Força indicador offline |

**Comportamento:** gate de auth via `useAuth`; guarda de rota via `canAccessRoute`; `#main-content` como alvo do skip link.

### Sidebar / TopHeader / MobileBottomNav

Navegação responsiva filtrada por perfil (`filterNavByRole`).

---

## UI (`components/ui/`)

### PageHeader

Cabeçalho de página com breadcrumb e slot de ações.

```tsx
<PageHeader
  breadcrumb="Fleet"
  title="Inventário de Frota"
  subtitle="Descrição opcional"
  actions={<ActionButton>...</ActionButton>}
/>
```

Breadcrumb usa `<nav aria-label="Trilha de navegação">`.

### LoadingState

Feedback de carregamento padronizado.

```tsx
<LoadingState message="Carregando frota..." />
```

- `role="status"`
- `aria-live="polite"`
- Spinner Material (`progress_activity`)

### ErrorState

Exibe erro com retry opcional.

```tsx
<ErrorState message={error} onRetry={load} />
```

- `role="alert"`
- Botão "Tentar novamente" quando `onRetry` definido

### EmptyState

Ausência de dados com CTA opcional.

```tsx
<EmptyState
  title="Nenhum veículo"
  description="Cadastre o primeiro veículo."
  icon="directions_car"
  action={<ActionLink href="/vehicles/register">Cadastrar</ActionLink>}
/>
```

### ListPageStates

Orquestra loading → erro → empty → conteúdo.

```tsx
<ListPageStates
  loading={loading}
  error={fetchError}
  isEmpty={items.length === 0}
  onRetry={load}
  emptyTitle="Nenhum registro"
  emptyAction={<ActionButton>...</ActionButton>}
>
  {/* conteúdo da listagem */}
</ListPageStates>
```

**Prioridade:** `loading` > `error` > `isEmpty` > `children`.

### AccessDenied

Tela exibida quando perfil não tem acesso à rota.

### FormModal

Modal acessível para formulários.

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Escape fecha
- Overlay clicável fecha

### ActionButton / ActionLink

CTAs primários e links de ação.

### KpiCard

Tile de KPI para dashboard.

### Icon

Wrapper Material Symbols. Sempre `aria-hidden` — o controle pai deve ter texto ou `aria-label`.

---

## Formulários (`components/forms/`)

### FormShell

Wrapper padrão para páginas de cadastro.

```tsx
<FormShell
  title="Cadastrar Veículo"
  backHref="/vehicles"
  onSubmit={async (form) => { await vehiclesApi.create(...); }}
  redirectOnSuccess="/vehicles"
>
  <FormField label="Placa" name="plate" required />
</FormShell>
```

### FormField

Campo com label vinculado (`htmlFor`/`id`). Suporta `input`, `textarea`, `select`, `checkbox`.

---

## Utilitários relacionados

### `extractApiError(err, fallback?)`

Localização: `frontend/src/lib/api-errors.ts`

Extrai mensagem amigável de erros Axios (conexão, timeout, 5xx, `response.data.error`).

---

## Classes CSS globais

Ver `frontend/src/app/globals.css`:

- `.raised-card`, `.input-fleet`, `.btn-primary`, `.btn-secondary`
- `.chip-active/warning/error/pending`
- `.touch-target`, `.sticky-mobile-actions`
- `.table-responsive`, `.zebra-table`
