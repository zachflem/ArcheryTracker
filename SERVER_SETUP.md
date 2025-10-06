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

## Step 2: Run the Application

The application is containerized with Docker, and can be deployed with a single command using the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script handles everything automatically:
- Creates and configures the backend `.env` file if it doesn't exist
- Generates a secure random JWT_SECRET
- Guides you through email configuration setup
- Builds the Docker images for frontend and backend
- Starts the containers with Docker Compose
- Sets up the NGINX reverse proxy
- Initializes the MongoDB database

The deploy.sh script is interactive and will prompt you for any required configuration. You can simply accept the default values by pressing Enter, or provide your own settings.

## Step 3: Access the Application

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
