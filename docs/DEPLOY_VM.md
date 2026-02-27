# Deploy em VM (Docker)

Este guia usa o mesmo fluxo que voce ja fazia com `docker run`, so atualizado para a versao refatorada.

Observacao:

- mantenha tokens e secrets entre aspas no `docker run`.

## 1) Criar rede (uma vez)

```bash
docker network create logbook-net || true
```

## 2) Subir MongoDB (com autenticacao)

```bash
docker stop mongo || true
docker rm mongo || true

docker run -d \
  --name mongo \
  --network logbook-net \
  --restart unless-stopped \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=root \
  -e MONGO_INITDB_DATABASE=logbook \
  -v mongo_data:/data/db \
  mongo:7
```

## 3) Build e deploy do backend

```bash
cd ~/apps/logbook-back
docker build -t logbook-back .

docker stop logbook-back || true
docker rm logbook-back || true

docker run -d \
  --name logbook-back \
  --network logbook-net \
  --restart unless-stopped \
  -p 4010:4010 \
  -e PORT=4010 \
  -e DB_NAME=logbook \
  -e MONGO_URI="mongodb://root:root@mongo:27017/logbook?authSource=admin" \
  -e FRONT_ORIGIN="http://SEU_IP_OU_DOMINIO_FRONT:3000" \
  -e WRITE_TOKEN="SEU_TOKEN_FORTE" \
  -e LOG_TTL_SECONDS=3600 \
  logbook-back
```

## 4) Build e deploy do frontend (opcional)

```bash
cd ~/apps/logbook-front
docker build -t logbook-front .

docker stop logbook-front || true
docker rm logbook-front || true

docker run -d \
  --name logbook-front \
  --network logbook-net \
  --restart unless-stopped \
  -p 3000:80 \
  -e NUXT_PUBLIC_API_BASE="http://SEU_IP_OU_DOMINIO_BACK:4010" \
  -e NUXT_PUBLIC_WRITE_TOKEN="SEU_TOKEN_FORTE" \
  logbook-front
```

## 5) Validar

```bash
docker ps
docker logs --tail 100 logbook-back
docker logs --tail 100 logbook-front
```

Teste API:

```bash
curl "http://localhost:4010/logs/getList?page=1&search="
```

## Observacoes importantes

- `WRITE_TOKEN` e obrigatorio nas rotas de escrita.
- `JWT_SECRET` so e necessario se voce ativar rotas autenticadas com JWT.
- `LOG_TTL_SECONDS=3600` remove logs automaticamente apos 1 hora (TTL no Mongo).
- Se voce mudar credenciais do Mongo, ajuste `MONGO_URI`.
- Se existir outro processo usando `4010`, pare ele antes do `docker run`.
- Se mudar env do frontend em projeto Nuxt buildado, faca rebuild/restart do container para refletir os valores novos.
