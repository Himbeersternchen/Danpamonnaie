#!/bin/bash
set -e

echo "Waiting for database..."
until python -c "
import psycopg2, os
psycopg2.connect(
    dbname=os.environ['DATABASE_NAME'],
    user=os.environ['DATABASE_USER'],
    password=os.environ['DATABASE_PASSWORD'],
    host=os.environ['DATABASE_HOST'],
    port=os.environ['DATABASE_PORT'],
)
" 2>/dev/null; do
    sleep 1
done
echo "Database is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 300
