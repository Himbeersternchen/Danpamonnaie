# Self-Hosting Deployment Guide

> **Note:** This guide is for deploying on a **Linux server** (Debian/Ubuntu-based). Windows and macOS servers are not covered.

This guide covers deploying Danpamonnaie on any always-on local Linux server (Raspberry Pi, old laptop, mini PC, NAS, etc.).

## Architecture

```
[Phone/PC] --Tailscale VPN--> [Your Server]
                                  ├── Tailscale  (secure remote access, autostart)
                                  ├── Caddy      (reverse proxy + automatic HTTPS)
                                  │     ├── /          → React static files
                                  │     ├── /dinoapi/  → Gunicorn :8000
                                  │     ├── /dinoauth/ → Gunicorn :8000
                                  │     └── /static/   → Django static files
                                  ├── Gunicorn   (Django WSGI server)
                                  ├── PostgreSQL (database)
                                  └── systemd    (manages all services on boot)
```

**Why Tailscale?** It creates a private VPN between your devices so you can access your server securely from anywhere — no ports need to be opened on your router. Free for up to 100 devices.

---

## Prerequisites

- A server running Debian/Ubuntu-based Linux (64-bit)
- A [Tailscale account](https://tailscale.com) (free)
- Git, Python 3.12.3+, Node.js 18+ installed on your **development machine** (for building the frontend)

---

## Phase 1: Install Dependencies on the Server

```bash
sudo apt update && sudo apt upgrade -y

# Python, PostgreSQL, Git
sudo apt install -y python3 python3-pip python3-venv python3-dev libpq-dev \
                   postgresql postgresql-contrib git

# Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

---

## Phase 2: Tailscale VPN Setup

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up    # opens a browser link to authorize
```

After authorization:
1. Note your server's Tailscale hostname — find it with `tailscale status` or in the [Tailscale admin console](https://login.tailscale.com/admin/machines). It looks like `your-server.your-tailnet.ts.net`.
2. In the [Tailscale DNS settings](https://login.tailscale.com/admin/dns), enable **MagicDNS** and **HTTPS certificates**.
3. Install the Tailscale client on your phone/PC and sign in with the same account.

---

## Phase 3: PostgreSQL Setup

```bash
sudo -u postgres psql
```

```sql
CREATE USER danpa WITH PASSWORD 'your_secure_password';
CREATE DATABASE danpamonnaie OWNER danpa;
GRANT ALL PRIVILEGES ON DATABASE danpamonnaie TO danpa;
\q
```

---

## Phase 4: Backend Deployment

### 4.1 Python environment & dependencies

```bash
cd /path/to/Danpamonnaie/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -e parse_invoice_letter/
pip install gunicorn
```

### 4.2 Configure environment variables

Create `backend/.env.prod`:

```env
DEBUG=False
DJANGO_ENV=production
SECRET_KEY=    # see below
DATABASE_NAME=danpamonnaie
DATABASE_USER=danpa
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
TAILSCALE_HOST=your-server.your-tailnet.ts.net
```

Generate a secret key and paste it into `SECRET_KEY`:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Tell Django to use this env file (create inside `backend/`):

```bash
echo 'ENV_FILE = ".env.prod"' > active_env.py
```

### 4.3 Initialize Django

```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

### 4.4 Gunicorn systemd service

Create `/etc/systemd/system/danpamonnaie-backend.service`:

```ini
[Unit]
Description=Danpamonnaie Django Backend
After=network.target postgresql.service

[Service]
User=<your-server-username>
Group=www-data
WorkingDirectory=/path/to/Danpamonnaie/backend
ExecStart=/path/to/Danpamonnaie/backend/venv/bin/gunicorn backend.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 300
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable danpamonnaie-backend
sudo systemctl start danpamonnaie-backend
```

---

## Phase 5: Frontend Build & Deploy

Build on your **development machine** (faster than building on the server):

```bash
cd frontend
npm install
npm run build
# dist/ contains the built static files
```

Copy to the server:

```bash
scp -r frontend/dist <user>@<server-ip>:/path/to/Danpamonnaie/frontend/dist
```

---

## Phase 6: Caddy Setup (Reverse Proxy + HTTPS)

### 6.1 Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### 6.2 Allow Caddy to use Tailscale certificates

Add the following line to `/etc/default/tailscaled`:

```
TS_PERMIT_CERT_UID=caddy
```

Then restart Tailscale:

```bash
sudo systemctl restart tailscaled
```

### 6.3 Configure Caddyfile

Replace `/etc/caddy/Caddyfile` with:

```caddyfile
your-server.your-tailnet.ts.net {

    handle /dinoapi/* {
        reverse_proxy localhost:8000
    }

    handle /dinoauth/* {
        reverse_proxy localhost:8000
    }

    handle /admin* {
        reverse_proxy localhost:8000
    }

    handle_path /static/* {
        root * /path/to/Danpamonnaie/backend/staticfiles
        file_server
    }

    handle_path /media/* {
        root * /path/to/Danpamonnaie/backend/media
        file_server
    }

    handle {
        root * /path/to/Danpamonnaie/frontend/dist
        file_server
        try_files {path} /index.html
    }
}
```

> Replace `your-server.your-tailnet.ts.net` with your actual Tailscale hostname.

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

Caddy automatically obtains a valid HTTPS certificate from Tailscale — no self-signed certificates, no browser warnings.

---

## Phase 7: Verify Autostart

```bash
sudo systemctl is-enabled tailscaled            # → enabled
sudo systemctl is-enabled postgresql            # → enabled
sudo systemctl is-enabled danpamonnaie-backend  # → enabled
sudo systemctl is-enabled caddy                 # → enabled
```

Reboot the server and confirm everything comes back up:

```bash
sudo reboot
# Then open https://your-server.your-tailnet.ts.net on your phone/PC
```

---

## Updating the App

**Frontend update:**
```bash
# On your dev machine:
npm run build
scp -r frontend/dist <user>@<server-ip>:/path/to/Danpamonnaie/frontend/dist
# No service restart needed
```

**Backend update:**
```bash
# On the server:
git pull
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
sudo systemctl restart danpamonnaie-backend
```

---

## Tips

- **Backup your database regularly:**
  ```bash
  pg_dump danpamonnaie > backup_$(date +%F).sql
  ```
- **Security:** No router ports need to be opened — all access goes through the Tailscale VPN tunnel.
- **Tailscale ACLs:** Optionally restrict which devices can access the server via the Tailscale admin console.
