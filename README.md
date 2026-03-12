# Library Management Microservice

A production-ready Express.js microservice for managing a library system with PostgreSQL, full observability stack (Prometheus + Grafana), CI/CD, Kubernetes deployment, and performance testing.

## Features

- 📚 Book management (CRUD operations)
- 👥 User management with role-based access control
- 📖 Book borrowing and return functionality
- 🔐 JWT-based authentication
- 🏥 Health check endpoint
- 📊 Prometheus metrics & monitoring (Phase 6)
- 📈 Grafana dashboards with 20 panels
- 🚨 Prometheus alerting rules (6 alerts)
- ⚡ k6 performance testing (100 req/s load tests)
- 🐘 PostgreSQL 15 (Alpine) for data persistence
- 📦 Docker & Docker Compose support
- ☸️ Kubernetes deployment manifests
- 🔄 CI/CD pipeline configuration
- 📝 Structured logging with Morgan & Winston
- 🏗️ Clean Architecture pattern
- 🧪 Unit & integration tests with Jest

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | PostgreSQL 15 (Alpine) |
| **ORM** | Sequelize |
| **Authentication** | JWT (jsonwebtoken) |
| **Metrics** | prom-client (Prometheus) |
| **Monitoring** | Prometheus + Grafana |
| **Load Testing** | k6 |
| **Logging** | Morgan + Winston |
| **Testing** | Jest |
| **Containerization** | Docker & Docker Compose |
| **Orchestration** | Kubernetes (Kustomize) |
| **Environment** | dotenv |

## Quick Start

### Prerequisites

- Node.js v14+
- Docker & Docker Compose
- npm or yarn

### Option A: Development Mode

```bash
cd TP_Projet_Microservice
npm install
docker-compose up -d          # Start PostgreSQL
npm run dev                   # Start app with auto-reload
```

### Option B: Full Monitoring Stack (Recommended)

```bash
cd TP_Projet_Microservice/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts **PostgreSQL + App + Prometheus + Grafana** together.

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Library API | http://localhost:3001 | — |
| Health Check | http://localhost:3001/health | — |
| Prometheus Metrics | http://localhost:3001/metrics | — |
| Prometheus UI | http://localhost:9091 | — |
| Grafana | http://localhost:3002 | admin / admin |

> Ports are configurable via `.env` file. See `.env.example` for all port variables.

## API Endpoints

### Health & Metrics
- `GET /health` — Health check endpoint
- `GET /metrics` — Prometheus metrics (prom-client format)

### Authentication (v1)
- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive JWT token

### Book Management (v1)
- `GET /api/v1/books` — Get all books
- `GET /api/v1/books/:id` — Get book by ID
- `GET /api/v1/books?search=term` — Search books
- `POST /api/v1/books` — Create new book (protected)
- `PUT /api/v1/books/:id` — Update book (protected)
- `DELETE /api/v1/books/:id` — Delete book (protected)
- `POST /api/v1/books/:id/borrow` — Borrow a book (protected)
- `POST /api/v1/books/:id/return` — Return a book (protected)

> Legacy routes (`/api/books`, `/api/auth`) are also supported for backward compatibility.

## Database Schema

### Users Table
```sql
id (INTEGER, Primary Key, Auto-increment)
nom (STRING, Not Null)
email (STRING, Unique, Not Null)
role (ENUM: 'admin' | 'user', Default: 'user')
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

### Livres Table
```sql
id (INTEGER, Primary Key, Auto-increment)
titre (STRING, Not Null)
auteur (STRING, Not Null)
isbn (STRING, Unique, Not Null)
disponibilite (BOOLEAN, Default: true)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

### Emprunts Table
```sql
id (INTEGER, Primary Key, Auto-increment)
UserId (INTEGER, Foreign Key to Users)
LivreId (INTEGER, Foreign Key to Livres)
dateEmprunt (DATE, Default: NOW)
dateRetourPrevue (DATE, Not Null)
dateRetourEffective (DATE, Nullable)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

## Project Structure

```
TP_Projet_Microservice/
├── src/
│   ├── server.js                          # Express app + /metrics endpoint
│   ├── config/
│   │   └── database.js                    # Sequelize configuration
│   ├── controllers/
│   │   ├── bookController.js              # Book business logic
│   │   └── userController.js              # User/auth logic
│   ├── middlewares/
│   │   ├── authMiddleware.js              # JWT verification
│   │   ├── errorMiddleware.js             # Global error handling
│   │   └── metricsMiddleware.js           # Prometheus metrics collection
│   ├── models/
│   │   ├── User.js                        # User model
│   │   └── Livre.js                       # Book model
│   ├── routes/
│   │   ├── authRoutes.js                  # Auth endpoints
│   │   └── bookRoutes.js                  # Book endpoints
│   ├── services/
│   │   └── bookService.js                 # Book business logic layer
│   └── utils/
│       ├── AppError.js                    # Custom error class
│       ├── logger.js                      # Winston logger
│       ├── responseHelper.js              # Response formatting
│       └── seed.js                        # Database seeding
├── monitoring/
│   ├── docker-compose.monitoring.yml      # Full stack (App + Prometheus + Grafana)
│   ├── prometheus/
│   │   ├── prometheus.yml                 # Scrape configuration
│   │   └── alerts.yml                     # 6 alert rules
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   └── library-dashboard.json     # Pre-built dashboard (20 panels)
│   │   └── provisioning/
│   │       ├── datasources/
│   │       │   └── datasources.yml        # Auto-configure Prometheus
│   │       └── dashboards/
│   │           └── dashboards.yml         # Auto-load dashboards
│   └── alertmanager/
│       └── alertmanager.yml               # Alert routing
├── tests/
│   └── load-test.js                       # k6 performance test (100 req/s)
├── src/__tests__/
│   ├── auth.test.js                       # Auth unit tests
│   ├── bookService.test.js                # Service unit tests
│   └── server.test.js                     # Server unit tests
├── k8s/                                   # Kubernetes manifests
├── docker-compose.yml                     # Development (PostgreSQL only)
├── Dockerfile                             # Multi-stage Docker build
├── jest.config.js                         # Test configuration
└── package.json
```

## Phase 6 — Monitoring & Performance

### Prometheus Metrics

The service exposes metrics at `/metrics` using `prom-client`:

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_requests_total` | Counter | method, endpoint, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, endpoint | Request latency |
| `books_borrowed_total` | Counter | — | Business metric: books borrowed |
| `db_query_duration_seconds` | Histogram | operation, table | Database query time |

Additional metrics: `books_returned_total`, `books_currently_borrowed`, `db_query_errors_total`, plus Node.js default metrics (CPU, memory, event loop, GC).

### Prometheus Configuration

- Scrape targets: `library-api` (app:3001), `node-exporter` (9100), `postgres-exporter` (9187)
- Scrape interval: 10s for app, 15s global
- 6 alert rules loaded from `alerts.yml`

### Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighErrorRate | Error rate > 5% for 2 min | Critical |
| HighLatency | P99 > 500ms for 2 min | Warning |
| LibraryApiDown | Service down for 1 min | Critical |
| HighMemoryUsage | Memory > 80% for 5 min | Warning |
| HighDatabaseLatency | DB P95 > 100ms for 5 min | Warning |
| NoTraffic | No requests for 10 min | Warning |

### Grafana Dashboard

Auto-provisioned dashboard with 20 panels across 4 sections:

- **Overview**: Service Status, RPS, Error Rate, Books Borrowed, Uptime
- **HTTP Metrics**: Request Rate by Endpoint, Latency (P50/P95/P99), Status Codes, Methods
- **Database**: Query Latency P95, DB Errors by Operation
- **System**: Memory Usage, CPU Usage, Event Loop Lag, Active Handles

### Performance Testing (k6)

```powershell
# Using Docker (no install needed)
docker run --rm -i --network=monitoring_monitoring-network grafana/k6 run - < tests/load-test.js

# Or install k6 locally
k6 run tests/load-test.js
```

- **Load**: 100 requests/second (constant arrival rate)
- **Duration**: 2 minutes
- **Endpoints**: /health, /api/v1/books, /api/v1/books/:id, /metrics, search, auth
- **Thresholds**: P50 < 100ms, P95 < 300ms, P99 < 500ms, error rate < 1%

## Environment Variables

```
# PostgreSQL Connection
POSTGRES_USER=libraryuser
POSTGRES_PASSWORD=librarypassword
POSTGRES_DB=library_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# Application
NODE_ENV=development
PORT=3001

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Logging
LOG_LEVEL=info

# Service Ports (host-side, change if occupied)
POSTGRES_HOST_PORT=5433
APP_HOST_PORT=3001
PROMETHEUS_HOST_PORT=9091
GRAFANA_HOST_PORT=3002
NODE_EXPORTER_HOST_PORT=9101
ALERTMANAGER_HOST_PORT=9093
```

## Docker Commands

**Development (PostgreSQL only)**:
```bash
docker-compose up -d
docker-compose down
```

**Full Monitoring Stack**:
```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d    # Start everything
docker-compose -f docker-compose.monitoring.yml down      # Stop
docker-compose -f docker-compose.monitoring.yml down -v   # Stop + remove data
docker-compose -f docker-compose.monitoring.yml logs app  # View app logs
```

## npm Scripts

```bash
npm start       # Run production server
npm run dev     # Run with nodemon (auto-reload)
npm test        # Run Jest unit tests
```

## Testing

### Unit Tests
```bash
npm test
```

### API Testing
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/books
curl http://localhost:3001/metrics
```

### Load Testing
```bash
k6 run tests/load-test.js
```

## Database Connection

- **Host**: localhost
- **Port**: 5433 (configurable via `POSTGRES_HOST_PORT` in `.env`)
- **User**: libraryuser
- **Password**: librarypassword
- **Database**: library_db

To connect via psql:
```bash
psql -h localhost -p 5433 -U libraryuser -d library_db
```

## Architecture Notes

This project follows **Clean Architecture** principles:

1. **Separation of Concerns**: Controllers, services, models, and routes are separated
2. **Middleware Layer**: Authentication, error handling, and metrics collection are decoupled
3. **Configuration**: Environment-based configuration via .env
4. **Observability**: Full monitoring stack with Prometheus metrics, Grafana dashboards, and alerting
5. **Scalability**: Kubernetes-ready with HPA and load testing
6. **Testability**: Business logic separated from HTTP layer, Jest unit tests
7. **CI/CD**: Automated pipeline configuration

## Documentation

| Document | Description |
|----------|-------------|
| [PHASE6_GUIDE.md](../PHASE6_GUIDE.md) | Monitoring & Performance step-by-step guide |
| [CI_CD_SETUP.md](CI_CD_SETUP.md) | CI/CD pipeline setup |
| [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md) | Kubernetes deployment guide |
| [POSTMAN_TESTING.md](POSTMAN_TESTING.md) | API testing with Postman |
| [K8S_QUICKSTART.md](K8S_QUICKSTART.md) | Kubernetes quick start |

## Troubleshooting

### PostgreSQL connection refused
- Ensure Docker container is running: `docker ps`
- Check PostgreSQL logs: `docker logs library_postgres_db`
- Verify `.env` contains correct credentials

### Port already in use
- Check port: `netstat -ano | findstr :3001` (Windows)
- Change PORT in `.env` if needed

### Prometheus not scraping
- Visit http://localhost:9091/targets
- Check `library-api` target shows "UP"
- Verify app container is running

### Grafana dashboard empty
- Generate traffic first (hit the API endpoints)
- Check time range is "Last 15 minutes"
- Verify Prometheus datasource: Settings → Data Sources → Test

## License

ISC
