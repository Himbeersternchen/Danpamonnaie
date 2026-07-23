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
                                  ├── Caddy      (reverse proxy + HTTPS)  ← runs on host, owns :80/:443
                                  └── Docker Compose
                                        ├── frontend  (Nginx: React + API proxy)  127.0.0.1:8080 → :80
                                        ├── backend   (Django + Gunicorn)          internal
                                        └── db        (PostgreSQL)                 internal
```

> **Why `127.0.0.1:8080` and not `80:80`?** Caddy needs ports 80/443 on the host for
> itself (443 for TLS, 80 for the automatic HTTP→HTTPS redirect). If `frontend` also
> binds host port 80 directly, Caddy fails to start with "address already in use".
> Binding `frontend` to loopback-only `127.0.0.1:8080` also means it can't be reached
> by anything except Caddy — no way to accidentally hit the app over plain HTTP from
> the LAN/tailnet, bypassing TLS. This is why `docker-compose.yml` maps
> `"127.0.0.1:8080:80"` instead of `"80:80"` for `frontend` — make sure your checkout
> has this before wiring up Caddy below.

### Prerequisites

- Tailscale set up on the server (see [DEPLOY.md — Phase 2](DEPLOY.md))
- Caddy installed on the host (see [DEPLOY.md — Phase 6](DEPLOY.md))
- Docker installed (see [Install Docker](#install-docker) above) — if the machine's
  root filesystem is small/slow storage (e.g. an SD card on a Raspberry Pi) with a
  larger/faster disk mounted elsewhere (e.g. an SSD on `/home`), consider relocating
  Docker's data root before starting any containers — see
  [Relocating Docker's data directory](#relocating-dockers-data-directory-optional) below.

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

> **Confirming your Tailscale hostname:** `tailscale status --json | python3 -c
> "import json,sys; print(json.load(sys.stdin)['Self']['DNSName'])"` shows the DNS
> name actually assigned to this machine — that's what `TAILSCALE_HOST` (and the
> Caddyfile hostname below) must match. If you rename the device with `tailscale set
> --hostname=<name>`, the local preference updates immediately but the DNS name
> shown above does not always follow automatically — if it doesn't update within
> ~30s, rename the device manually in the
> [Tailscale admin console](https://login.tailscale.com/admin/machines) instead.

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
    reverse_proxy localhost:8080
}
```

> Replace `your-server.your-tailnet.ts.net` with your actual Tailscale hostname, and
> note the port is **8080**, matching the `127.0.0.1:8080:80` mapping on `frontend`
> in `docker-compose.yml` — not 80 (see the architecture note above for why).

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

## Running a Test Environment Alongside Production

You can run a second, fully isolated copy of the stack on the same server — separate
containers, separate database volume, separate superuser — reachable at the same
Tailscale hostname but a different port, e.g. `https://your-server.your-tailnet.ts.net:8443`.

### Step 1: Create `docker-compose.test.yml`

Only the `frontend` port needs overriding. Use the `!override` merge tag — without
it, Compose *appends* to the base file's `ports` list instead of replacing it, and
you'll get a "port already allocated" conflict against the production stack:

```yaml
services:
  frontend:
    ports: !override
      - "8443:80"
```

### Step 2: Create `.env.docker.test`

Copy `.env.docker.example` to `.env.docker.test` and fill it in like the production
`.env.docker`, but with a different `DATABASE_NAME` (e.g. `danpamonnaie_test`) so the
two Postgres containers don't collide if you ever point them at the same volume by
mistake. **Add `.env.docker.test` to `.gitignore`** — it isn't covered by the
existing `.env.docker` entry.

### Step 3: Start it under a separate project name

The `-p`/`--project-name` flag namespaces the containers, network, and volumes so
they don't collide with the production stack (which uses the default project name
derived from the directory):

```bash
docker compose -p danpamonnaie-test --env-file .env.docker.test \
  -f docker-compose.yml -f docker-compose.test.yml up -d
```

```bash
docker compose -p danpamonnaie-test exec backend python manage.py createsuperuser
```

Test environment is reachable directly at `http://your-server.your-tailnet.ts.net:8443`
— no Caddy/HTTPS in front of it, since it's for internal use only. All the usual
commands (`ps`, `logs`, `down`, etc.) need the same `-p danpamonnaie-test` flag to
target the test stack instead of production.

### Changing the test database password after the fact

Postgres only reads `POSTGRES_PASSWORD` (from `DATABASE_PASSWORD` in the env file)
the **first time** it initializes an empty data volume. Editing `.env.docker.test`
later and restarting won't change the password Postgres actually enforces — you'll
need to update it inside the running container too:

```bash
docker compose -p danpamonnaie-test exec db psql -U danpa -d danpamonnaie_test \
  -c "ALTER ROLE danpa WITH PASSWORD 'new_password_here';"
```

---

## Relocating Docker's Data Directory (optional)

Relevant if the machine's root filesystem is on slower/smaller storage (e.g. a
Raspberry Pi booting from an SD card) with a larger/faster disk mounted elsewhere
(e.g. an SSD mounted at `/home`). By default Docker stores all images, containers,
and volumes — including your Postgres data — under `/var/lib/docker`, which lives on
the root filesystem regardless of where `/home` is mounted.

Do this **before** starting any containers if possible; moving existing data works
too but takes an extra rsync step:

```bash
sudo systemctl stop docker docker.socket

# Only needed if Docker has already created data under /var/lib/docker:
sudo mkdir -p /path/to/your/ssd/docker-data
sudo rsync -aP /var/lib/docker/ /path/to/your/ssd/docker-data/

echo '{
  "data-root": "/path/to/your/ssd/docker-data"
}' | sudo tee /etc/docker/daemon.json

sudo systemctl start docker
sudo docker info | grep "Docker Root Dir"   # should show the new path
```

Once you've confirmed everything (`docker ps -a`, `docker volume ls`) came back up
correctly on the new path, the old `/var/lib/docker` copy can be removed to reclaim
space on the root filesystem.

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
