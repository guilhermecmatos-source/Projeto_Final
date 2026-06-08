# FleetAI — Especificação Frontend (doc/03-specs)

Este arquivo espelha a especificação canônica do frontend. Para a versão completa e atualizada, consulte [`../specs.md`](../specs.md).

## Resumo

- **Stack:** Next.js 14, React 18, TypeScript, Tailwind, Axios
- **Arquitetura:** App Router, client components, estado local por página, `localStorage` para auth
- **Design system:** tokens Material-inspired, 8 temas, classes em `globals.css`
- **Estados obrigatórios:** loading, erro (com retry), empty, acesso negado
- **Acessibilidade:** skip link, labels, ARIA, foco visível, touch targets 44px
- **Responsividade:** mobile-first com sidebar drawer, bottom nav e tabelas adaptativas

## Componentes de estado (novos)

| Componente | Arquivo |
|------------|---------|
| `LoadingState` | `frontend/src/components/ui/LoadingState.tsx` |
| `ErrorState` | `frontend/src/components/ui/ErrorState.tsx` |
| `EmptyState` | `frontend/src/components/ui/EmptyState.tsx` |
| `ListPageStates` | `frontend/src/components/ui/ListPageStates.tsx` |
| `AccessDenied` | `frontend/src/components/ui/AccessDenied.tsx` |

## Utilitários

| Utilitário | Arquivo |
|------------|---------|
| `extractApiError` | `frontend/src/lib/api-errors.ts` |

## Critérios de aceite

Ver seção 12 em [`../specs.md`](../specs.md).

## Testes

Ver [`testing.md`](./testing.md).
