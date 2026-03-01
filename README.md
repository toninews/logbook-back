# Logbook API

## Português

API backend para gestão de logs/tarefas com foco em cenários próximos de produção: segurança, manutenção e testabilidade.

### Destaques

- Operações de CRUD para logs com paginação e busca
- Estratégia de exclusão lógica (`isDeleted`, `deletedAt`)
- Proteção por token para rotas de escrita
- Middleware de rate limit por IP
- Contrato HTTP padronizado (`success/data/error`)
- Validação de entrada na borda HTTP (query/body/params)
- Arquitetura modular com influência de Clean/Hexagonal
- Testes unitários e de integração com Node test runner

### Arquitetura

Estrutura atual dos módulos `logs` e `auth`:

- `src/modules/*/domain`: regras de negócio puras
- `src/modules/*/application/useCases`: orquestração da aplicação
- `src/modules/*/application/ports`: contratos (portas)
- `src/modules/*/infra`: adaptadores de infraestrutura (Mongo)
- `src/modules/*/interfaces/http`: controllers e middlewares HTTP
- `src/shared`: contratos/utilitários compartilhados (`AppError`, `errorCodes`, helpers HTTP)
- `app/*.js`: composição de rotas e injeção de dependências
- Módulos de rota podem exportar factories para DI (`{ db }`)

Essa organização mantém a regra de negócio fora da camada HTTP e facilita testes sem depender de servidor/banco real.

### Endpoints da API

#### Logs

- `GET /logs/getList?page=1&search=`
- `POST /logs/insertTask`
- `DELETE /logs/:id`

Exemplo de body para `POST /logs/insertTask`:

```json
{
  "title": "Título de exemplo",
  "content": "Conteúdo de exemplo",
  "tags": ["docker", "node", "mongodb"]
}
```

### Contrato de Resposta

Sucesso:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Mensagem legível"
  }
}
```

### Variáveis de Ambiente

Crie o `.env` a partir do `.env.example` e ajuste os valores:

```bash
cp .env.example .env
```

| Variável          | Descrição                                                               | Exemplo                                                    |
| ----------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `PORT`            | Porta do servidor da API                                                | `4010`                                                     |
| `MONGO_URI`       | String de conexão do MongoDB                                            | `mongodb://root:root@mongo:27017/logbook?authSource=admin` |
| `DB_NAME`         | Nome do banco                                                           | `logbook`                                                  |
| `FRONT_ORIGIN`    | Origem permitida no CORS                                                | `http://localhost:3000`                                    |
| `WRITE_TOKEN`     | Token exigido nas rotas de escrita                                      | `replace-with-strong-token`                                |
| `JWT_SECRET`      | Segredo para validação JWT (opcional se nenhuma rota JWT estiver ativa) | `replace-with-strong-jwt-secret`                           |
| `LOG_TTL_SECONDS` | Tempo de vida do log no Mongo (TTL)                                     | `3600`                                                     |

Sem autenticação local, também pode usar: `mongodb://localhost:27017`.
Logs expiram automaticamente via índice TTL em `createdAt`.
No estado atual, `JWT_SECRET` é preparação para rotas autenticadas com sessão/JWT; a API de logs funciona sem ele enquanto esse middleware não estiver em uso.

### Executar Localmente

Se for rodar a API fora do Docker, o `MONGO_URI` precisa apontar para um Mongo acessível pelo host, por exemplo:

```env
MONGO_URI=mongodb://localhost:27017/logbook
```

Se for usar `docker compose`, o `MONGO_URI` pode continuar como `mongo:27017` porque a API e o Mongo estarão na mesma rede Docker.

```bash
npm install
npm start
```

Servidor padrão: `http://localhost:4010`

### Executar com Docker Compose

```bash
docker compose up --build
```

Serviços:

- API: `http://localhost:4010`
- MongoDB: `localhost:27017` (usuário: `root`, senha: `root`)

Observação:

- em `docker run` e em variáveis de ambiente do frontend/backend, mantenha tokens e secrets entre aspas para evitar problemas com caracteres especiais.

Parar:

```bash
docker compose down
```

Parar e remover volume do Mongo:

```bash
docker compose down -v
```

### Deploy em VM

Checklist completo de deploy manual com `docker run`:

- `docs/DEPLOY_VM.md`

### Testes

Rodar todos os testes:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Formatar código:

```bash
npm run format
```

Somente checagem de formatação:

```bash
npm run format:check
```

Cobertura atual inclui:

- Regras de domínio (`buildLogEntity`)
- Use cases (`logs`, `auth`)
- Contrato do controller HTTP (`logsController`)
- Helpers de resposta compartilhados
- Fluxo de rota `/logs` em modo integração
- Cenários de middleware de token (`requireWriteToken`)
- Contrato de dependência (`assertRepositoryContract`)

### CI

Workflow do GitHub Actions incluído:

- Arquivo: `.github/workflows/ci.yml`
- Gatilhos: `push` e `pull_request`
- Matrix: Node `20.x` e `22.x`
- Etapas: `npm ci` + `npm run lint` + `npm run format:check` + `npm test`

---

## English

Backend API for log/task management with a production-oriented focus on security, maintainability, and testability.

### Highlights

- Log CRUD operations with pagination and search
- Soft delete strategy (`isDeleted`, `deletedAt`)
- Token-based protection for write routes
- IP-based rate limiting middleware
- Standardized HTTP contract (`success/data/error`)
- Edge input validation (query/body/params)
- Modular architecture influenced by Clean/Hexagonal principles
- Unit and integration tests using the Node test runner

### Architecture

Current structure for the `logs` and `auth` modules:

- `src/modules/*/domain`: pure business rules
- `src/modules/*/application/useCases`: application orchestration
- `src/modules/*/application/ports`: contracts (ports)
- `src/modules/*/infra`: infrastructure adapters (Mongo)
- `src/modules/*/interfaces/http`: HTTP controllers and middlewares
- `src/shared`: shared contracts/utilities (`AppError`, `errorCodes`, HTTP helpers)
- `app/*.js`: route composition and dependency injection
- Route modules may export DI factories (`{ db }`)

This organization keeps business rules out of the HTTP layer and makes testing easier without depending on a real server or database.

### API Endpoints

#### Logs

- `GET /logs/getList?page=1&search=`
- `POST /logs/insertTask`
- `DELETE /logs/:id`

Example body for `POST /logs/insertTask`:

```json
{
  "title": "Sample title",
  "content": "Sample content",
  "tags": ["docker", "node", "mongodb"]
}
```

### Response Contract

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Readable message"
  }
}
```

### Environment Variables

Create `.env` from `.env.example` and adjust the values:

```bash
cp .env.example .env
```

| Variable          | Description                                                           | Example                                                    |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `PORT`            | API server port                                                       | `4010`                                                     |
| `MONGO_URI`       | MongoDB connection string                                             | `mongodb://root:root@mongo:27017/logbook?authSource=admin` |
| `DB_NAME`         | Database name                                                         | `logbook`                                                  |
| `FRONT_ORIGIN`    | Allowed CORS origin                                                   | `http://localhost:3000`                                    |
| `WRITE_TOKEN`     | Token required on write routes                                        | `replace-with-strong-token`                                |
| `JWT_SECRET`      | Secret used for JWT validation (optional if no JWT routes are active) | `replace-with-strong-jwt-secret`                           |
| `LOG_TTL_SECONDS` | Log lifetime in MongoDB (TTL)                                         | `3600`                                                     |

For local runs without auth, you can also use `mongodb://localhost:27017`.
Logs expire automatically through a TTL index on `createdAt`.
In the current state, `JWT_SECRET` is kept as preparation for authenticated JWT/session routes; the logs API works without it while that middleware is not in use.

### Run Locally

If you run the API outside Docker, `MONGO_URI` must point to a Mongo instance reachable from the host, for example:

```env
MONGO_URI=mongodb://localhost:27017/logbook
```

If you use `docker compose`, `MONGO_URI` can stay as `mongo:27017` because the API and Mongo run on the same Docker network.

```bash
npm install
npm start
```

Default server: `http://localhost:4010`

### Run with Docker Compose

```bash
docker compose up --build
```

Services:

- API: `http://localhost:4010`
- MongoDB: `localhost:27017` (user: `root`, password: `root`)

Note:

- in `docker run` commands and frontend/backend environment variables, keep tokens and secrets quoted to avoid issues with special characters.

Stop:

```bash
docker compose down
```

Stop and remove Mongo volume:

```bash
docker compose down -v
```

### VM Deployment

Full manual deployment checklist with `docker run`:

- `docs/DEPLOY_VM.md`

### Tests

Run all tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

Format check only:

```bash
npm run format:check
```

Current coverage includes:

- Domain rules (`buildLogEntity`)
- Use cases (`logs`, `auth`)
- HTTP controller contract (`logsController`)
- Shared response helpers
- `/logs` route flow in integration mode
- Token middleware scenarios (`requireWriteToken`)
- Dependency contract validation (`assertRepositoryContract`)

### CI

Included GitHub Actions workflow:

- File: `.github/workflows/ci.yml`
- Triggers: `push` and `pull_request`
- Matrix: Node `20.x` and `22.x`
- Steps: `npm ci` + `npm run lint` + `npm run format:check` + `npm test`
