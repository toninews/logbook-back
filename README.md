# Logbook API

Backend API for log/task management focused on production-like concerns: security, maintainability, and testability.

## Highlights

- CRUD-style operations for logs with pagination and search
- Soft delete strategy (`isDeleted`, `deletedAt`)
- Write-token protection for mutation routes
- Rate limiting middleware (IP-based)
- Global error contract (`success/data/error`)
- Request validation at HTTP boundary (query/body/params)
- Modular architecture with Clean/Hexagonal influence
- Unit and integration-style tests with Node test runner

## Architecture

Current structure for `logs` and `auth` modules:

- `src/modules/*/domain`: pure business rules
- `src/modules/*/application/useCases`: application orchestration
- `src/modules/*/infra`: infrastructure adapters (Mongo)
- `src/modules/*/interfaces/http`: controllers and HTTP middleware
- `src/shared`: shared contracts/utilities (`AppError`, HTTP response helpers)
- `app/*.js`: route composition and dependency wiring
- Route modules can export factory functions for dependency injection (`{ db }`)

This keeps business logic out of route handlers and makes use cases testable without MongoDB.

## API Endpoints

### Logs

- `GET /logs/getList?page=1&search=`
- `POST /logs/insertTask`
- `DELETE /logs/:id`

`POST /logs/insertTask` body example:

```json
{
  "title": "Example title",
  "content": "Example content",
  "tags": ["docker", "node", "mongodb"]
}
```

## Response Contract

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

## Environment Variables

Create `.env` from `.env.example` and adjust values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | API server port | `4010` |
| `MONGO_URI` | MongoDB connection string | `mongodb://root:root@mongo:27017/logbook?authSource=admin` |
| `DB_NAME` | Database name | `logbook` |
| `FRONT_ORIGIN` | Allowed frontend origin (CORS) | `http://localhost:3000` |
| `WRITE_TOKEN` | Token required for write routes | `replace-with-strong-token` |
| `JWT_SECRET` | JWT validation secret | `replace-with-strong-jwt-secret` |
| `CLEANUP_INTERVAL_MS` | Cleanup job interval | `3600000` |
| `CLEANUP_RETENTION_DAYS` | Retention (days) for soft-deleted logs | `30` |

Local without auth can still use: `mongodb://localhost:27017`.

## Run Locally

```bash
npm install
npm start
```

Server default: `http://localhost:4010`

## Run with Docker Compose

```bash
docker compose up --build
```

Services:

- API: `http://localhost:4010`
- MongoDB: `localhost:27017` (user: `root`, password: `root`)

To stop:

```bash
docker compose down
```

To stop and remove Mongo volume:

```bash
docker compose down -v
```

## Tests

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

Check formatting only:

```bash
npm run format:check
```

Coverage currently includes:

- Domain rules (`buildLogEntity`)
- Use cases (`logs`, `auth`)
- HTTP controller contract (`logsController`)
- Shared response helpers
- Integration-style route flow for `/logs` (router stack execution)
- Token middleware scenarios (`requireWriteToken`)

## CI

GitHub Actions workflow included:

- File: `.github/workflows/ci.yml`
- Triggers: `push` and `pull_request`
- Matrix: Node `20.x` and `22.x`
- Steps: `npm ci` + `npm run lint` + `npm run format:check` + `npm test`

## Study Notes

Detailed migration notes are in:

- `docs/ESTUDO_REFATORACAO.txt`
