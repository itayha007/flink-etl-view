
# Docker Setup for Flink ETL Test Dashboard

This setup provides containerized deployment for the React frontend with placeholders for your backend services.

## Quick Start

### Production Build
```bash
# Build and run the production setup
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Setup
```bash
# Run development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## Available Services

- **Frontend**: http://localhost:3000 (production) or http://localhost:5173 (development)
- **Backend**: http://localhost:8080 (placeholder for your service)
- **MongoDB**: mongodb://localhost:27017

## Manual Docker Commands

### Build the image
```bash
docker build -t flink-test-dashboard .
```

### Run the container
```bash
docker run -p 3000:80 flink-test-dashboard
```

### Development build
```bash
docker build -f Dockerfile.dev -t flink-test-dashboard:dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules flink-test-dashboard:dev
```

## Backend Integration

When your MongoDB-backed service is ready:

1. Update the `backend` service in `docker-compose.yml`
2. Replace `your-backend-image:latest` with your actual image
3. Update environment variables as needed
4. The frontend will automatically connect to your backend API

## Environment Variables

- `VITE_API_URL`: Backend API URL (defaults to http://localhost:8080)

## Notes

- The frontend uses Nginx in production for optimal performance
- MongoDB data is persisted using Docker volumes
- Development setup includes hot reload for faster development
- API requests are proxied through Nginx in production
