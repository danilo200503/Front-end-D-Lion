# D-LION — Frontend (Etapa 1)

Sistema SaaS Contábil & Fiscal com Inteligência Artificial.
Frontend em **Angular 18 (standalone components)** + **TypeScript**.

## Como rodar

```bash
npm install
npm start          # http://localhost:4200
```

Login mockado: qualquer e-mail válido + senha com 6+ caracteres já autentica
(o backend real ainda não existe — ver seção "Integração com API").

## Decisões técnicas

**Standalone components ao invés de NgModules.**
Desde o Angular 15+, standalone é a abordagem recomendada: cada componente
declara suas próprias dependências (`imports: [...]`), o que elimina a
necessidade de módulos "guarda-chuva" por feature e deixa o code splitting
mais direto — cada rota carrega só o que precisa.

**Lazy loading por feature (`loadComponent` / `loadChildren`).**
Cada tela (`dashboard`, `upload`, `analise-fiscal`, `relatorios`,
`assistente-ia`) só é baixada quando o usuário navega até ela. Isso mantém o
bundle inicial pequeno, o que importa bastante num SaaS com múltiplas
telas internas.

**Signals para estado local, sem NgRx nesta etapa.**
Para esta primeira fase, o estado (usuário logado, histórico de upload,
mensagens do chat) vive em `signal()` dentro dos próprios serviços
`@Injectable({ providedIn: 'root' })`. É reativo, simples de testar e
suficiente para o tamanho atual do projeto. Se a complexidade crescer
(muitos estados cruzados entre features), migrar para NgRx ou
`@ngrx/signals` é direto, pois a lógica já está isolada em serviços.

**Guards funcionais (`CanActivateFn`).**
`authGuard` protege as rotas privadas e redireciona para `/login` guardando
a URL de destino (`redirectTo`) — exatamente o comportamento pedido:
"usuário deslogado não acessa novamente, o sistema redireciona pro login".
`guestGuard` faz o inverso: usuário já logado não acessa `/login` de novo.

**Interceptors HTTP funcionais.**
- `authInterceptor`: injeta o `Authorization: Bearer <token>` em toda
  chamada para a API.
- `errorInterceptor`: em erro `401`, faz logout automático e redireciona
  para login (sessão expirada).

**Camada de serviços já com "contrato" para API REST.**
Cada feature tem seu próprio `services/*.service.ts` com:
- `baseUrl` montada a partir de `environment.apiUrl`;
- endpoints REST comentados/documentados (verbo + path esperado);
- uma flag `useMock` que, por enquanto, retorna dados simulados via
  `of(...).pipe(delay(...))` — simulando latência de rede.

Quando o backend estiver pronto, o trabalho é: implementar o endpoint real,
trocar `useMock` para `false` e (se necessário) ajustar o `pipe` de
transformação da resposta. Nenhum componente precisa mudar, pois eles só
conhecem o serviço, não a origem do dado.

**Path aliases (`@core/*`, `@shared/*`, `@features/*`, `@env/*`).**
Configurados no `tsconfig.json` para evitar imports relativos longos
(`../../../../core/...`) conforme a árvore de features cresce.

## Estrutura de pastas

```
src/app/
├── core/                     # Transversal a toda a aplicação
│   ├── guards/                auth.guard.ts (authGuard, guestGuard)
│   ├── interceptors/           auth.interceptor.ts, error.interceptor.ts
│   ├── models/                 user.model.ts, api-response.model.ts
│   └── services/                auth.service.ts, storage.service.ts
│
├── shared/                   # Componentes de UI reutilizáveis entre features
│   └── components/
│       ├── sidebar/, header/            (usados no MainLayout)
│       └── stat-card/, loading-spinner/, empty-state/
│
├── layout/
│   ├── auth-layout/            layout das telas públicas (painel do leão)
│   └── main-layout/            layout das telas privadas (sidebar + header)
│
├── features/
│   ├── auth/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── dashboard/               indicadores, docs por status, pendências por tipo
│   ├── upload/                  upload XML/PDF, progresso, histórico
│   ├── fiscal-analysis/         pendências, alertas, sugestões de correção (IA)
│   ├── reports/                 geração de planilhas (Excel) + histórico
│   └── ai-assistant/            chat do assistente tributário com IA
│
├── app.component.ts
├── app.config.ts               providers globais (router, http, interceptors)
└── app.routes.ts                mapa de rotas raiz (lazy loading)
```

Cada feature segue o mesmo padrão interno:

```
feature/
├── feature.routes.ts
├── feature.component.ts / .html / .scss
├── models/*.model.ts
└── services/*.service.ts
```

## Rotas

| Rota                  | Layout      | Guard      | Componente               |
|------------------------|-------------|------------|---------------------------|
| `/login`               | AuthLayout  | guestGuard | LoginComponent            |
| `/esqueci-senha`       | AuthLayout  | guestGuard | ForgotPasswordComponent   |
| `/dashboard`           | MainLayout  | authGuard  | DashboardComponent        |
| `/upload`              | MainLayout  | authGuard  | UploadComponent           |
| `/analise-fiscal`      | MainLayout  | authGuard  | FiscalAnalysisComponent   |
| `/relatorios`          | MainLayout  | authGuard  | ReportsComponent          |
| `/assistente-ia`       | MainLayout  | authGuard  | AiAssistantComponent      |

## Integração com a API (próxima etapa)

1. Definir `environment.apiUrl` para a URL real do backend.
2. Em cada `*.service.ts`, trocar `private readonly useMock = true` para
   `false` — os métodos já chamam o `HttpClient` no bloco `else` mockado.
3. Ajustar o parsing conforme o envelope real de resposta da API
   (o contrato sugerido está em `core/models/api-response.model.ts`).
4. Backend precisa expor, no mínimo:
   - `POST /auth/login`, `POST /auth/forgot-password`
   - `GET /dashboard/summary`, `/documentos-por-status`, `/pendencias-por-tipo`
   - `POST /documentos/upload` (multipart), `GET /documentos/historico`
   - `GET /analise-fiscal/pendencias`, `GET /analise-fiscal/nota/:id`
   - `POST /relatorios/gerar`
   - `POST /assistente-ia/mensagens`

## Identidade visual

Paleta baseada no mockup de referência: fundo branco (`#FFFFFF`), dourado
(`#D4AF37`) como cor de destaque/ação, tipografia `Poppins` (display) +
`Inter` (corpo). Tokens centralizados em `src/styles.scss` como CSS
variables (`--dl-gold`, `--dl-black`, `--dl-radius` etc.) para manter
consistência entre todas as telas.

## Próximos passos sugeridos

- Tela de cadastro/onboarding de escritório e clientes.
- Tela de Termos de Uso (presente no mockup) com controle de aceite.
- Tela de Cobrança via WhatsApp (seleção de cliente/documentos/mensagem).
- Testes unitários dos serviços (mock → real) e guards.
- Internacionalização (i18n) caso haja plano de expansão.

---

## Atualização — Integração real, IA Fiscal, Clientes e Cobranças

As seções acima descrevem o estado inicial do projeto (mockado). Desde então,
o frontend passou a consumir a API real do backend (nenhum serviço usa mais
`useMock`, exceto o `AuthService`, documentado no próprio arquivo) e novas
telas foram adicionadas:

```
src/app/features/
  clientes/      # CRUD de clientes (Angular Material: tabela, dialog)
  cobrancas/     # CRUD de cobranças, envio por e-mail/WhatsApp, histórico de envios
```

Novas rotas (protegidas pelo mesmo `authGuard` já existente):
- `/clientes` — cadastro e listagem de clientes
- `/cobrancas` — cobranças, com filtros por status/cliente e botões de envio
- `/cobrancas/historico` — histórico de envios (filtros por cliente, período e tipo)

O Dashboard (`/dashboard`) ganhou 4 novos indicadores (Total de cobranças,
Pendentes, Pagas, Em atraso), carregados de forma independente do resumo
fiscal já existente, então nenhuma funcionalidade anterior foi alterada.

### Variáveis de ambiente / apiUrl

`src/environments/environment.ts` (desenvolvimento) e
`environment.prod.ts` (produção) definem `apiUrl`. Antes do deploy, garanta
que `environment.prod.ts` aponte para a URL pública do backend.

### Build de produção

```bash
npm install
npm run build
```

O bundle final fica em `dist/d-lion-frontend/browser`.

### Deploy no Vercel

1. Importe o repositório no [Vercel](https://vercel.com/new).
2. Framework preset: **Angular** (o Vercel detecta automaticamente via `angular.json`).
3. Build command: `npm run build`
4. Output directory: `dist/d-lion-frontend/browser`
5. Configure a variável de ambiente do build, se necessário, ou ajuste
   `environment.prod.ts` antes do commit com a URL do backend em produção
   (ex.: backend hospedado no Render).
6. Após o deploy, adicione o domínio gerado pelo Vercel na variável
   `ALLOWED_ORIGINS` do backend, para que o CORS em produção libere as
   requisições desse domínio.

---

## D-LION v1.0 — Finalização (Prompt 4.2)

Última etapa antes da apresentação: revisão geral, padronização visual,
responsividade, UX e páginas de erro. Nenhuma funcionalidade das etapas
anteriores foi alterada — apenas adicionada ou embelezada por cima.

### Novidades desta etapa

- **Tema Angular Material personalizado** (`src/styles/material-theme.scss`),
  substituindo o tema pré-fabricado `indigo-pink` por uma paleta dourada
  alinhada à identidade visual do D-LION. Botões, campos, tabelas e diálogos
  do Material agora seguem a marca.
- **Menu lateral responsivo**: em telas ≤900px, a sidebar passa a funcionar
  como um drawer deslizante (aberto pelo botão ☰ no cabeçalho), em vez de
  simplesmente desaparecer como antes.
- **Diálogo de confirmação padronizado** (`shared/components/confirm-dialog`),
  substituindo os `confirm()` nativos do navegador nas exclusões de
  Clientes e Cobranças.
- **Páginas de erro**: `/404` (rota não encontrada, fallback do `**`),
  `/403` (acesso negado), `/500` (erro interno) e `/sessao-expirada`
  (nova página amigável para quando o token expira, no lugar do redirect
  direto e silencioso para `/login`).
- **Tela "Meu Perfil"** (`/perfil`, acessível clicando no nome do usuário no
  cabeçalho): editar nome/cargo/telefone e trocar senha, usando os
  endpoints `GET/PUT /users/me` e `PUT /users/change-password` que já
  existiam no backend. O e-mail é somente leitura nesta versão (é a chave
  de login; alterá-lo ficará para uma etapa futura, com mais cuidado).
- **Dashboard**: cards com animação de entrada sutil, e duas novas listas —
  "Últimos Documentos Enviados" e "Últimas Cobranças" — complementando os
  indicadores e gráficos já existentes.
- **Acessibilidade**: `aria-label` em todos os botões de ícone sem texto
  visível, foco visível (`:focus-visible`) nos elementos interativos novos,
  e `prefers-reduced-motion` respeitado nas animações.

### Build de produção validado

```bash
npm run build
```

Testado nesta etapa com sucesso (bundle inicial ~190KB minificado, dentro
do orçamento de 1MB configurado em `angular.json`). O único erro encontrado
durante a validação foi a inlining de Google Fonts falhando por bloqueio de
rede do ambiente sandbox usado para gerar este código — no seu ambiente,
com acesso normal à internet, isso funciona automaticamente.
