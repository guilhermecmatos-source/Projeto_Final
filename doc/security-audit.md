# Relatório de Segurança – FleetAI

## Resumo Executivo

Foi realizada uma revisão de segurança da aplicação frontend, com foco em autenticação, persistência de dados no navegador, exposição de segredos e hardening de resposta HTTP. A interface foi mantida sem alterações visuais.

## Status Geral

- Estado: parcialmente corrigido
- Prioridade: alta
- Escopo: frontend Next.js/TypeScript

## Achados principais

### 1) Persistência de token em localStorage (alto)

- Evidência: o fluxo de login e o hook de autenticação dependiam de localStorage para armazenar token e usuário.
- Impacto: aumenta a superfície de roubo por XSS e scripts maliciosos no navegador.
- Ação aplicada: criado um armazenamento centralizado em sessionStorage via [frontend/src/lib/auth-storage.ts](frontend/src/lib/auth-storage.ts) e integrado em [frontend/src/services/api.ts](frontend/src/services/api.ts), [frontend/src/hooks/useAuth.ts](frontend/src/hooks/useAuth.ts), [frontend/src/app/login/page.tsx](frontend/src/app/login/page.tsx) e [frontend/src/app/register/page.tsx](frontend/src/app/register/page.tsx).

### 2) Exposição de credenciais/segredos em tela (médio)

- Evidência: a página de configurações continha exemplos de tokens e client secrets em texto explícito.
- Impacto: risco de vazamento em demonstrações, captura de tela e inspeção de código.
- Ação aplicada: os valores sensíveis foram substituídos por placeholders redacted em [frontend/src/app/settings/page.tsx](frontend/src/app/settings/page.tsx).

### 3) Ausência de headers de segurança básicos (médio)

- Evidência: o Next.js não configurava headers como X-Frame-Options, X-Content-Type-Options e Referrer-Policy.
- Impacto: reduz a proteção contra clickjacking, MIME sniffing e vazamento de referrer.
- Ação aplicada: adicionados headers de segurança em [frontend/next.config.js](frontend/next.config.js).

## Itens ainda recomendados

1. Implementar CSP estrita (Content-Security-Policy) com hashes/nonce para scripts e estilos.
2. Remover qualquer uso de dados sensíveis em localStorage e garantir limpeza completa em logout.
3. Introduzir rotatividade de tokens e refresh token com HttpOnly cookies, se a API/backend permitir.
4. Revisar o backend para validar permissões e impedir uso de tokens de outras sessões.

## Evidências de validação

- Verificação de editor: sem erros relatados nos arquivos alterados.
- Teste de regressão adicionado em [frontend/src/lib/auth-storage.test.ts](frontend/src/lib/auth-storage.test.ts).
- O ambiente atual não possui Node/npm instalados, então a execução do teste não foi possível aqui; a verificação foi feita via checagem estática e diagnósticos do editor.

## Prioridade de execução

- P0: mover autenticação para cookies HttpOnly no backend.
- P1: aplicar CSP e revisão de dependências.
- P2: revisar rotas administrativas e permissões no backend.
