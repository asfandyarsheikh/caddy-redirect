# Caddy Redirect System

Simple URL redirect system with SQLite storage and Fastify CRUD API.

## Quick Start

```bash
docker-compose up -d
```

## Usage

### Create a path redirect
```bash
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "/github", "to_url": "https://github.com"}'
```

### Create a full URL redirect
```bash
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "https://old.example.com/page", "to_url": "https://new.example.com/page"}'
```

### Create a wildcard redirect
```bash
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "/github/:user/:repo", "to_url": "https://github.com/:user/:repo"}'
```

### Query parameter filtering
```bash
# Allow all query params (null or omit allowed_params)
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "/search", "to_url": "https://example.com/search"}'

# Allow no query params
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "/clean", "to_url": "https://example.com/page", "allowed_params": []}'

# Allow specific params only
curl -X POST http://localhost:3000/redirects \
  -H "Content-Type: application/json" \
  -d '{"from_url": "/filter", "to_url": "https://example.com/page", "allowed_params": ["id", "page"]}'
```

### List all redirects
```bash
curl http://localhost:3000/redirects
```

### Update a redirect
```bash
curl -X PUT http://localhost:3000/redirects/github \
  -H "Content-Type: application/json" \
  -d '{"to_url": "https://github.com/trending", "allowed_params": ["lang"]}'
```

### Delete a redirect
```bash
curl -X DELETE http://localhost:3000/redirects/github
```

## Pattern Syntax

Use `:param` for named wildcards:
- `/user/:id` matches `/user/123` 
- `/github/:org/:repo` matches `/github/facebook/react`
- `https://old.com/:path` matches `https://old.com/anything`

## Query Parameters

- `null` (or omit) - pass all query params through
- `[]` - strip all query params
- `["id", "page"]` - only pass specified params

## Ports

- 8080 - Caddy (public redirects)
- 3000 - API (CRUD operations)

## Local Development

```bash
npm install
node api.js &
node redirect.js &
caddy run
```
