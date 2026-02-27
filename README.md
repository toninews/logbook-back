# Logbook API

API backend para gestão de logs/tarefas com foco em cenários próximos de produção: segurança, manutenção e testabilidade.

## Destaques

- Operações de CRUD para logs com paginação e busca
- Estratégia de exclusão lógica (`isDeleted`, `deletedAt`)
- Proteção por token para rotas de escrita
- Middleware de rate limit por IP
- Contrato HTTP padronizado (`success/data/error`)
- Validação de entrada na borda HTTP (query/body/params)
- Arquitetura modular com influência de Clean/Hexagonal
- Testes unitários e de integração com Node test runner

## Arquitetura

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

## Endpoints da API

### Logs

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

## Contrato de Resposta

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

## Variáveis de Ambiente

Crie o `.env` a partir do `.env.example` e ajuste os valores:

```bash
cp .env.example .env
```

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta do servidor da API | `4010` |
| `MONGO_URI` | String de conexão do MongoDB | `mongodb://root:root@mongo:27017/logbook?authSource=admin` |
| `DB_NAME` | Nome do banco | `logbook` |
| `FRONT_ORIGIN` | Origem permitida no CORS | `http://localhost:3000` |
| `WRITE_TOKEN` | Token exigido nas rotas de escrita | `replace-with-strong-token` |
| `JWT_SECRET` | Segredo para validação JWT (opcional se nenhuma rota JWT estiver ativa) | `replace-with-strong-jwt-secret` |
| `LOG_TTL_SECONDS` | Tempo de vida do log no Mongo (TTL) | `3600` |

Sem autenticação local, também pode usar: `mongodb://localhost:27017`.
Logs expiram automaticamente via índice TTL em `createdAt`.
No estado atual, `JWT_SECRET` é preparação para rotas autenticadas com sessão/JWT; a API de logs funciona sem ele enquanto esse middleware não estiver em uso.

## Executar Localmente

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

## Executar com Docker Compose

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

## Deploy em VM

Checklist completo de deploy manual com `docker run`:

- `docs/DEPLOY_VM.md`

## Testes

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

## CI

Workflow do GitHub Actions incluído:

- Arquivo: `.github/workflows/ci.yml`
- Gatilhos: `push` e `pull_request`
- Matrix: Node `20.x` e `22.x`
- Etapas: `npm ci` + `npm run lint` + `npm run format:check` + `npm test`

## Notas de Estudo

Anotações detalhadas locais da refatoração:

- `docs/ESTUDO_REFATORACAO.txt`
- `docs/REFATORACAO_CLEAN_LOGBOOK_FASES.txt`
