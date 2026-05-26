# Estratégia de Testes Automatizados — FleetAI (Fase 2)

## Princípio: TDD First

1. **Red** — escrever teste que falha descrevendo o comportamento esperado  
2. **Green** — implementar o mínimo para passar  
3. **Refactor** — melhorar código mantendo testes verdes  

Fluxos críticos priorizados (ordem):

1. Máscara monetária BRL (`lib/currency.ts`)
2. Resolução de combobox / IDs (`lib/form-resolve.ts`)
3. Cálculo de distância e fallback geocoding
4. Fila offline / sincronização (`hooks/useOffline.ts`)
5. Upload (validação MIME, tamanho)
6. APIs REST (supertest)
7. E2E: login → motorista → despacho → dashboard

## Arquitetura de testes

```
frontend/
  src/**/*.test.ts(x)     → Vitest + Testing Library
  e2e/*.spec.ts           → Playwright

backend/
  src/**/*.test.ts        → Vitest + Supertest
```

## Mocks

| Dependência | Estratégia |
|-------------|------------|
| Google Maps | Mock de `fetch` / MSW em `geocoding.service` |
| Qualp / Mapeia | Fixtures JSON + fallback heuristic |
| `navigator.geolocation` | Stub em testes de mapa |
| Upload disco | Diretório temp + cleanup |
| JWT | Token fixture no header |

## Metas de cobertura (CI)

| Métrica | Meta |
|---------|------|
| lines | ≥ 90% |
| functions | ≥ 90% |
| branches | ≥ 85% |

## Scripts (após `npm install` em cada pacote)

```bash
cd frontend && npm run test:unit && npm run test:e2e
cd backend && npm run test
```

## CI/CD (GitHub Actions)

Workflow `.github/workflows/ci.yml`:

- `lint` (frontend `next lint`)
- `test` backend + frontend unit
- `build` ambos
- Bloqueio de merge se qualquer job falhar
- Upload de cobertura (opcional: Codecov)

## Anti-regressão

- PRs exigem testes para bugs corrigidos (teste que reproduz o bug primeiro)
- Smoke E2E em `main` após deploy
- Snapshot apenas para componentes estáveis (evitar fragilidade)

## Riscos técnicos

| Risco | Mitigação |
|-------|-----------|
| MySQL indisponível em CI | Container service `mysql:8` ou mocks de `query()` |
| Flaky E2E | `data-testid`, waits explícitos, sem `sleep` fixo |
| Uploads em disco | Volume efêmero no job |
| Chaves Google reais em CI | Sempre mock; testes de integração opcionais nightly |

## Referência

- Correções Fase 1: `fixes.md`
- Especificações: `doc/03-especs.md` (quando disponível no repositório)
