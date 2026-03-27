# Docker Deployment Guide

This guide covers two scenarios:

| Scenario                     | Access                                             | Tailscale + Caddy needed? |
| ---------------------------- | -------------------------------------------------- | ------------------------- |
| **A — Local testing**        | `http://localhost` on the same machine             | No                        |
| **B — Self-hosted (remote)** | `https://your-server.tailnet.ts.net` from anywhere | Yes                       |

All dependencies (Python, Node.js, PostgreSQL) are handled by Docker in both cases.

---

## Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

---

## Scenario A — Local Testing (localhost)

Use this to try out the app on your own machine without any remote access setup.

### Architecture

```
[Your Browser] --> http://localhost:80
                        └── Docker Compose
                              ├── frontend  (Nginx: React + API proxy)  :80
                              ├── backend   (Django + Gunicorn)          internal
                              └── db        (PostgreSQL)                 internal
```

### Step 1: Configure environment

```bash
git clone <your-repo-url>
cd Danpamonnaie

cp .env.docker.example .env.docker
nano .env.docker
```

Fill in `SECRET_KEY`, `DATABASE_USER`, and `DATABASE_PASSWORD`.
Leave `TAILSCALE_HOST` empty.

> `DATABASE_HOST` does not need to be set — Docker handles this automatically via the
> internal service name `db`.

For instructions on generating a secret key, see [DEPLOY.md — Phase 4.2](DEPLOY.md).

### Step 2: Start the app

```bash
# Option A: use pre-built images (fastest)
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up -d

# Option B: build from source
docker compose --env-file .env.docker up -d --build
```

Check that everything started correctly:

```bash
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f
```

### Step 3: Create a superuser

```bash
docker compose --env-file .env.docker exec backend python manage.py createsuperuser
```

### Step 4: Open the app

Open `http://localhost` in your browser.

---

## Scenario B — Self-Hosted with Tailscale (remote access)

Use this for a permanently running server you can access securely from anywhere.

### Architecture

```
[Phone/PC] --Tailscale VPN--> [Your Server]
                                  ├── Tailscale  (secure remote access)
                                  ├── Caddy      (reverse proxy + HTTPS)  ← runs on host
                                  └── Docker Compose
                                        ├── frontend  (Nginx: React + API proxy)  :80
                                        ├── backend   (Django + Gunicorn)          internal
                                        └── db        (PostgreSQL)                 internal
```

### Prerequisites

- Tailscale set up on the server (see [DEPLOY.md — Phase 2](DEPLOY.md))
- Caddy installed on the host (see [DEPLOY.md — Phase 6](DEPLOY.md))

### Step 1: Configure environment

```bash
git clone <your-repo-url>
cd Danpamonnaie

cp .env.docker.example .env.docker
nano .env.docker
```

Fill in all values including `TAILSCALE_HOST` (e.g. `my-server.my-tailnet.ts.net`).

> `DATABASE_HOST` does not need to be set — Docker handles this automatically via the
> internal service name `db`.

For a detailed explanation of each variable and how to generate a secret key, see
[DEPLOY.md — Phase 4.2](DEPLOY.md).

### Step 2: Start the app

```bash
# Option A: use pre-built images (fastest)
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up -d

# Option B: build from source
docker compose --env-file .env.docker up -d --build
```

Check that everything started correctly:

```bash
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f
```

### Step 3: Create a superuser

```bash
docker compose --env-file .env.docker exec backend python manage.py createsuperuser
```

### Step 4: Configure Caddy

Replace your `/etc/caddy/Caddyfile` with this much simpler version than the manual setup —
Nginx handles all internal routing, so Caddy only needs one rule:

```caddyfile
your-server.your-tailnet.ts.net {
    reverse_proxy localhost:80
}
```

> Replace `your-server.your-tailnet.ts.net` with your actual Tailscale hostname.

```bash
sudo systemctl reload caddy
```

### Step 5: Open the app

Open `https://your-server.your-tailnet.ts.net` on any device in your Tailscale network.

---

## Updating the App

**With pre-built images:**

```bash
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up -d
```

**Built from source:**

```bash
git pull
docker compose --env-file .env.docker up -d --build
```

Migrations and static file collection run automatically on startup.

---

## pgAdmin (optional)

Create you pgadmin login password in .env.docker.example to `PGADMIN_PASSWORD`.

To inspect the database visually, start pgAdmin alongside the app:

```bash
docker compose --env-file .env.docker --profile tools up -d
```

- **Scenario A (local):** open `http://localhost:5050`
- **Scenario B (remote):** open `http://your-server:5050` (only reachable inside the Tailscale network)

Connect to the database with:

- **Host:** `db`
- **Port:** `5432`
- **Username / Password:** as set in `.env.docker`

To stop pgAdmin without affecting the app:

```bash
docker compose --env-file .env.docker --profile tools stop pgadmin
```

---

## Useful Commands

```bash
# View logs for all services
docker compose --env-file .env.docker logs -f

# View logs for a specific service
docker compose --env-file .env.docker logs -f backend

# Open a Django shell
docker compose --env-file .env.docker exec backend python manage.py shell

# Backup the database
docker compose --env-file .env.docker exec db pg_dump -U $DATABASE_USER danpamonnaie > backup_$(date +%F).sql

# Stop everything
docker compose --env-file .env.docker down

# Stop and delete all data (irreversible!)
docker compose --env-file .env.docker down -v
```
