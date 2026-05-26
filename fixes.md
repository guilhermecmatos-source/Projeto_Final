# Log de Correções — FleetAI (Fase 1)

Data: 26/05/2026

## Resumo da arquitetura analisada

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Banco | MySQL 8+ |
| API | REST JWT, proxy `/api` via `next.config.js` |

## Correções implementadas

### 1. Cadastro de Veículo — câmera e upload

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/vehicles/register/page.tsx`, `frontend/src/components/forms/CameraPhotoField.tsx`, `backend/src/routes/upload.routes.ts` |
| **Causa raiz** | Apenas input de galeria; foto ia só para `localStorage` sem API |
| **Solução** | Componente com `capture="environment"` (mobile), preview, validação MIME/tamanho; upload multipart após criar veículo (`POST /api/uploads`) |

### 2. RUV — Autorização Unidade/Transporte (combobox)

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/travels/ruv/page.tsx`, `frontend/src/components/forms/SearchableCombobox.tsx` |
| **Causa raiz** | `<select>` estático sem digitação nem filtro |
| **Solução** | Combobox pesquisável para veículo e motorista; resolução de ID por placa/nome (`lib/form-resolve.ts`) |

### 3. Novo Despacho — veículo e motorista

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/travels/register/page.tsx` |
| **Causa raiz** | Select fixo; IDs demo (`demo-1`) quebravam FK no MySQL |
| **Solução** | `SearchableCombobox` + validação de UUID; cálculo automático de distância via API de geocoding |

### 4. Dashboard Principal — date picker

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/dashboard/page.tsx`, `frontend/src/components/forms/DateRangePicker.tsx`, `backend/src/services/dashboard.service.ts` |
| **Causa raiz** | Botões 30/7/hoje sem efeito na API |
| **Solução** | Intervalo de datas com `type="date"`; KPIs e gráfico reagem ao período (`?dateFrom=&dateTo=`) |

### 5. Relatórios Estratégicos — date picker

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/reports/page.tsx` |
| **Causa raiz** | Botões estáticos sem recálculo |
| **Solução** | `DateRangePicker` com atualização dinâmica de métricas e gráficos |

### 6. Fleet Operational Intelligence — distância e mapas

| Item | Detalhe |
|------|---------|
| **Arquivos** | `backend/src/services/geocoding.service.ts`, `backend/src/routes/geocoding.routes.ts`, `frontend/src/lib/geocoding/route-distance.ts`, `frontend/src/components/ai/TripCostCalculator.tsx` |
| **Causa raiz** | Heurística por tamanho de string (`estimateDistanceKm`) |
| **Solução** | Cadeia configurável: Google Distance Matrix → Qualp → Mapeia → heurística; variáveis em `backend/.env.example` |

### 7. Cadastro de Motorista — CNH

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/components/forms/FileUploadField.tsx`, `frontend/src/app/drivers/register/page.tsx`, migração `drivers.cnh_*` |
| **Causa raiz** | Upload só local; erros genéricos no save |
| **Solução** | Validação 10MB, preview imagem/PDF, multipart; colunas `cnh_image_url` / `cnh_pdf_url` |

### 8. Uploads gerais

| Item | Detalhe |
|------|---------|
| **Arquivos** | `FileUploadField.tsx`, `upload.controller.ts`, `upload.middleware.ts`, proxy `/uploads` no Next |
| **Causa raiz** | Sem feedback loading/erro consistente |
| **Solução** | Estados loading/erro, MIME whitelist, persistência em `uploads` + disco |

### 9. Gastos e manutenção — máscara BRL

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/lib/currency.ts`, `frontend/src/components/forms/CurrencyField.tsx`, `drivers/register`, `maintenance/register` |
| **Causa raiz** | `type="number"` sem formato brasileiro |
| **Solução** | Máscara `1.250,90`, parse para decimal no `hidden` name |

### 10. IA Sandbox → IA Suporte

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/lib/navigation.ts`, `frontend/src/app/ai-security/page.tsx`, `intelligence/page.tsx` |
| **Solução** | Renomeação em menu e títulos |

### 11. IA Suporte interna — apenas Assistente de Problemas

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/app/ai-security/page.tsx` |
| **Causa raiz** | Página exibia 3 assistentes (custo + manutenção + problemas) |
| **Solução** | Mantido só `ProblemAssistantChat` (IA 1) |

### 12. Sincronizar agora — motorista

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/hooks/useOffline.ts`, `FormActions.tsx`, `OfflineIndicator.tsx` |
| **Causa raiz** | Retorno booleano ambíguo; sem loading; fila não validava campos obrigatórios |
| **Solução** | `SyncResult` com mensagens; spinner; retry por item com falha |

### 13. Erro ao salvar motorista

| Item | Detalhe |
|------|---------|
| **Arquivos** | `drivers/register/page.tsx`, `backend/src/routes/driver.routes.ts` |
| **Causa raiz** | 401/403 tratados como erro genérico; role `client` bloqueada; fallback sempre como “erro” |
| **Solução** | Mensagens por status HTTP; `client` pode criar motorista; rascunho local separado da mensagem de sucesso |

### 14. Controle de Viagens — gráfico de rota

| Item | Detalhe |
|------|---------|
| **Arquivos** | `frontend/src/components/map/RouteTrackerMap.tsx`, `frontend/src/lib/geo.ts` |
| **Causa raiz** | Gráfico usava coordenadas brutas distorcidas |
| **Solução** | Polyline por distância acumulada (Haversine); exibe km percorridos |

## Melhorias estruturais

- Componentes reutilizáveis: `SearchableCombobox`, `DateRangePicker`, `CurrencyField`, `CameraPhotoField`
- Serviço de geocoding desacoplado com fallback em cadeia
- API de uploads centralizada (`/api/uploads`)
- Build TypeScript corrigido em `connection.ts` (parâmetro `pool.execute`)
- Proxy Next para `/uploads`

## Variáveis de ambiente novas

Ver `backend/.env.example`: `GOOGLE_MAPS_API_KEY`, `QUALP_*`, `MAPEIA_*`, `GEO_PROVIDER_ORDER`

## Como validar

```bash
# Backend
cd backend && npm run db:migrate && npm run dev

# Frontend
cd frontend && npm run dev
```

1. Login: `admin@fleetplatform.com` / `Admin@123`
2. Cadastrar veículo com foto (câmera ou galeria)
3. Cadastrar motorista com CNH PDF/imagem
4. Novo despacho com busca de veículo/motorista
5. Dashboard/Relatórios: alterar intervalo de datas
6. Inteligência: calcular rota SP → Curitiba
7. Piloto: “Sincronizar agora” com fila offline

## Próximo passo (Fase 2)

Estratégia TDD, Vitest/Playwright, cobertura ≥90%, CI/CD — ver `testing.md` (a gerar na Fase 2).
