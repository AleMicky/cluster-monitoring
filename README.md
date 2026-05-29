# Storage Cluster Monitoring

Sistema web para monitorear un cluster de almacenamiento distribuido en los 9 departamentos de Bolivia. Recolecta métricas desde Prometheus (Node Exporter), calcula capacidad del cluster y genera alertas básicas.

## Arquitectura

```
Storage Nodes (Node Exporter) → Prometheus → FastAPI → PostgreSQL → Next.js
```

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui, TanStack Query, Recharts |
| Métricas | Prometheus, Node Exporter |
| Visualización | Grafana (opcional) |
| Contenedores | Docker Compose |

## Requisitos

- [Docker](https://www.docker.com/) y Docker Compose
- (Opcional) Node.js 20+ y Python 3.12+ para desarrollo local

## Inicio rápido

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd practica

# Variables de entorno
cp .env.example .env

# Levantar todo el stack
docker compose up -d
```

### URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API (Swagger) | http://localhost:8000/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (`admin` / `admin`) |

## Desarrollo local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Endpoints principales

- `GET /api/dashboard/summary` — Resumen del cluster
- `GET /api/nodes` — Listar nodos
- `GET /api/alerts` — Alertas
- `POST /api/sync/prometheus` — Sincronizar métricas
- `POST /api/seed/departments` — Cargar datos de ejemplo (9 departamentos)

## Nodos de ejemplo

| Nodo | Departamento | IP |
|------|--------------|-----|
| storage-lpz-01 | La Paz | 10.10.1.10 |
| storage-cbb-01 | Cochabamba | 10.10.2.10 |
| storage-scz-01 | Santa Cruz | 10.10.3.10 |
| storage-oru-01 | Oruro | 10.10.4.10 |
| storage-pts-01 | Potosí | 10.10.5.10 |
| storage-chq-01 | Chuquisaca | 10.10.6.10 |
| storage-tja-01 | Tarija | 10.10.7.10 |
| storage-ben-01 | Beni | 10.10.8.10 |
| storage-pan-01 | Pando | 10.10.9.10 |

## Estructura del proyecto

```
.
├── backend/          # API FastAPI
├── frontend/         # App Next.js
├── monitoring/
│   └── prometheus/   # prometheus.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

## Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/storage_cluster
PROMETHEUS_URL=http://prometheus:9090
NEXT_PUBLIC_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
```

## Licencia

MIT
