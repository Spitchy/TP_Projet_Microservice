# Library Management Microservice

A clean architecture Express.js microservice for managing a library system with PostgreSQL as the database. Built with best practices in mind.

## Features

- 📚 Book management (CRUD operations)
- 👥 User management with role-based access control
- 📖 Book borrowing and return functionality
- 🔐 JWT-based authentication
- 🏥 Health check endpoint
- 📊 Prometheus metrics endpoint
- 🐘 PostgreSQL 15 (Alpine) for data persistence
- 📦 Docker & Docker Compose support
- 📝 Structured logging with Morgan
- 🏗️ Clean Architecture pattern

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 15 (Alpine)
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Logging**: Morgan
- **Environment**: dotenv
- **Dev Tools**: nodemon

## Quick Start

### Prerequisites

- Node.js v14+ 
- Docker & Docker Compose
- npm or yarn

### Installation & Setup

1. **Navigate to project directory**:
   ```bash
   cd TP_Projet_Microservice
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

   Verify container is running:
   ```bash
   docker ps
   ```

4. **Configure environment**:
   - Copy `.env.example` to `.env` (already included)
   - Update variables if needed

5. **Start the application**:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Verify it's running**:
   ```bash
   curl http://localhost:3000/health
   ```
   Expected response: `{ "status": "UP" }`

## API Endpoints

### Health & Metrics
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics endpoint

### Book Management
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/search/query` - Search books
- `POST /api/books` - Create new book (protected)
- `PUT /api/books/:id` - Update book (protected)
- `DELETE /api/books/:id` - Delete book (protected)
- `POST /api/books/:id/borrow` - Borrow a book (protected)
- `POST /api/books/:id/return` - Return a book (protected)

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
│   ├── config/
│   │   └── database.js          # Sequelize configuration
│   ├── controllers/
│   │   └── bookController.js    # Book business logic
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorMiddleware.js   # Global error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Livre.js             # Book model
│   │   └── Emprunt.js           # Borrow record model
│   ├── routes/
│   │   └── bookRoutes.js        # API routes
│   ├── services/                # Business logic layer (empty)
│   ├── utils/                   # Utility functions (empty)
│   └── server.js                # Express app entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

## Environment Variables

```
# PostgreSQL Connection
POSTGRES_USER=libraryuser
POSTGRES_PASSWORD=librarypassword
POSTGRES_DB=library_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Application
NODE_ENV=development
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Logging
LOG_LEVEL=info
```

## Docker Commands

**Start services**:
```bash
docker-compose up -d
```

**View logs**:
```bash
docker-compose logs -f postgres
```

**Stop services** (keep volumes):
```bash
docker-compose stop
```

**Stop and remove everything**:
```bash
docker-compose down
```

**Stop and remove data**:
```bash
docker-compose down -v
```

## npm Scripts

```bash
npm start       # Run production server
npm run dev     # Run with nodemon (auto-reload)
npm test        # Run tests (not implemented)
```

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Get All Books
```bash
curl http://localhost:3000/api/books
```

### Get Metrics
```bash
curl http://localhost:3000/metrics
```

## Database Connection

- **Host**: localhost
- **Port**: 5432
- **User**: libraryuser
- **Password**: librarypassword
- **Database**: library_db

To connect via psql:
```bash
psql -h localhost -U libraryuser -d library_db
```

## Architecture Notes

This project follows **Clean Architecture** principles:

1. **Separation of Concerns**: Controllers, services, models, and routes are separated
2. **Middleware Layer**: Authentication and error handling are decoupled
3. **Configuration**: Environment-based configuration via .env
4. **Scalability**: Easy to add new features without affecting existing code
5. **Testability**: Business logic is separated from HTTP layer

## Next Steps

1. Implement service layer methods
2. Add input validation middleware
3. Implement authentication endpoints (login/register)
4. Add comprehensive error handling
5. Write unit and integration tests
6. Add API documentation (Swagger/OpenAPI)
7. Implement request/response logging
8. Add database migrations
9. Deploy to production environment
10. Set up CI/CD pipeline

## Troubleshooting

### PostgreSQL connection refused
- Ensure Docker container is running: `docker ps`
- Check PostgreSQL is accessible: `docker logs library_postgres_db`
- Verify `.env` contains correct credentials

### Port already in use
- Check if port 3000 is available: `netstat -ano | findstr :3000` (Windows)
- Change PORT in `.env` if needed

### Models not syncing
- Ensure PostgreSQL is running and accessible
- Check database credentials in `.env`
- Verify logs in console for detailed error messages

## Contributing

This is a learning project. Feel free to expand and improve!

## License

ISC

## Support

For issues or questions, check the logs and ensure:
1. Docker container is running
2. Environment variables are set correctly
3. Node.js and npm are updated
4. Database migrations (if any) are applied
