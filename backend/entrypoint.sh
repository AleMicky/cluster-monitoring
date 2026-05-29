#!/bin/bash
set -e

echo "Esperando PostgreSQL..."
until python -c "
import psycopg
import os
conn = psycopg.connect(os.environ['DATABASE_URL'].replace('postgresql+psycopg://', 'postgresql://'))
conn.close()
print('PostgreSQL listo')
" 2>/dev/null; do
  sleep 2
done

echo "Ejecutando migraciones Alembic..."
alembic upgrade head

echo "Iniciando servidor FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${BACKEND_PORT:-8000}"
