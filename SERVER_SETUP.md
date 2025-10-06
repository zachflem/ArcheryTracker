# Server Setup Instructions for Archery Tracker

This document provides detailed steps to clone and run the Archery Tracker application on a new server.

## Prerequisites

Before you begin, ensure that the following software is installed on your server:

- Git
- Docker (version 20.10.0 or later)
- Docker Compose (version 2.0.0 or later)

## Step 1: Clone the Repository

First, clone the repository to your server using one of the following methods:

### Option 1: Clone with HTTPS

```bash
git clone https://github.com/zachflem/ArcheryTracker.git
cd ArcheryTracker
```

### Option 2: Clone with SSH (Recommended if you have SSH keys set up)

```bash
git clone git@github.com:zachflem/ArcheryTracker.git
cd ArcheryTracker
```

## Step 2: Configure Environment Variables

1. Create a `.env` file for the backend by copying the example:

```bash
cp backend/.env.example backend/.env
```

2. Edit the backend `.env` file to set up your environment:

```bash
nano backend/.env
```

Ensure you configure the following values:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token encryption
- `JWT_EXPIRE`: Token expiration time (e.g., '30d' for 30 days)
- `PORT`: The port for the backend server (default: 5000)

## Step 3: Run the Application

The application is containerized with Docker, so you can run it easily using the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Build the Docker images for frontend and backend
- Start the containers with Docker Compose
- Set up the NGINX reverse proxy
- Initialize the MongoDB database

## Step 4: Access the Application

Once the containers are running, you can access the application at:

- **Web Application**: `http://your-server-ip:3000`
- **API**: `http://your-server-ip:5000/api`

## Manual Container Management

If you need to manage the containers manually, you can use the following commands:

### Start the Application

```bash
docker-compose up -d
```

### Stop the Application

```bash
docker-compose down
```

### View Container Logs

```bash
# All containers
docker-compose logs

# Specific container
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild Containers (after code changes)

```bash
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, ensure:
- Your MongoDB URI is correctly configured in `backend/.env`
- The MongoDB container is running: `docker ps | grep mongodb`
- Check MongoDB logs: `docker-compose logs archery-mongodb`

### Network Issues

If services can't communicate:
- Ensure all containers are on the same network: `docker network ls`
- Verify container IPs: `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name`

### Container Startup Issues

If containers fail to start:
- Check container status: `docker ps -a`
- View startup logs: `docker-compose logs`
- Verify ports are not already in use: `netstat -tuln`

## Backup and Restore

### Backup MongoDB Data

```bash
docker exec archery-mongodb mongodump --out=/data/db/backup
docker cp archery-mongodb:/data/db/backup ./mongo-backup
```

### Restore MongoDB Data

```bash
docker cp ./mongo-backup archery-mongodb:/data/db/
docker exec archery-mongodb mongorestore /data/db/mongo-backup
```

## Server Maintenance

### Update the Application

To update to the latest version from the repository:

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Container Resource Monitoring

```bash
docker stats
```

### Cleaning Up Docker Resources

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune
```

## Security Recommendations

1. Set up HTTPS with Let's Encrypt or another SSL certificate provider
2. Configure a firewall to only allow necessary ports (22, 80, 443)
3. Implement regular backups
4. Keep Docker and all system packages updated
