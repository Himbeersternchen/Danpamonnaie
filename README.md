# Danpamonnaie

A self-hosted, privacy-first money management application for individuals and families. Instead of handing your financial data to a third-party service, Danpamonnaie runs entirely on your own machine — your data never leaves your control.

The philosophy is simple: **objective, non-intrusive financial visibility**. No suggestions, no ads, no cloud sync. Just an honest picture of your actual financial situation, presented through an interactive dashboard you can explore at your own pace.

**Ideal for:** people who care about privacy and want a clear view of their finances without sacrificing data ownership.

**Features:**
- Upload bank transaction CSV files
- Interactive drag-and-drop dashboard — rearrange charts to suit your workflow
- Multiple chart types: Line, Bar, Pie, Sankey, Waterfall, Box Plot, Histogram, Bubble
- Filter all charts simultaneously by date range
- Responsive layout with mobile support

> This guide covers **local development setup** only. For self-hosting and deployment instructions, see [DEPLOY.md](DEPLOY.md).

---

## Prerequisites

- **Python** 3.12.3+
- **Node.js** 18+
- **PostgreSQL** 13+

---

## Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt
pip install -e parse_invoice_letter/

# 3. Configure environment variables
```

Generate a secret key for `SECRET_KEY`:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Create a file `backend/.env.dev` with the following content:

```env
DEBUG=True
DJANGO_ENV=development
SECRET_KEY=paste-generated-key-here
DATABASE_NAME=danpamonnaie
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432  # default PostgreSQL port; adjust if using another relational database
TAILSCALE_HOST=    # leave empty for local-only setup
```

```bash
# 4. Tell Django which env file to use (create this file inside backend/)
echo 'ENV_FILE = ".env.dev"' > active_env.py

# 5. Create the PostgreSQL database
createdb danpamonnaie

# 6. Run migrations
python manage.py migrate

# 7. Create a superuser (for logging in to the app)
python manage.py createsuperuser

# 8. Start the backend server
python manage.py runserver 0.0.0.0:8002
```

The backend API is now running at `http://localhost:8002`.

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app is now running at `http://localhost:5173`.

---

## Project Structure

```
Danpamonnaie/
├── backend/                    # Django REST API
│   ├── dinoapi/                # Core API (transactions, charts)
│   ├── dinoauth/               # JWT authentication
│   └── parse_invoice_letter/   # CSV parsing library
└── frontend/                   # React + TypeScript app
    └── src/
        ├── features/
        │   ├── dashboard/      # Charts and drag-and-drop grid
        │   └── auth/           # Login and CSV upload
        └── components/         # Shared UI components
```
