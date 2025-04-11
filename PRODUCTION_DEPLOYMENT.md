# PackLite Production Deployment Guide

This document provides instructions on how to deploy the PackLite application in a production environment using Docker.

## Prerequisites

- Docker and Docker Compose installed on your production server
- Git installed on your production server
- Basic knowledge of Linux server management
- Domain name (optional, but recommended for production)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://your-repository-url/packlite.git
cd packlite
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following required variables:

```bash
# Create and secure this file, it contains sensitive data
touch .env
chmod 600 .env
```

Add the following variables to the `.env` file:

```
NEXTAUTH_SECRET=your-secure-random-string
AUTH_TRUST_HOST=true
# Add other sensitive environment variables here
```

You can generate a secure random string with:

```bash
openssl rand -base64 32
```

### 3. Update Configuration (if needed)

- Update `NEXTAUTH_URL` in `.env.production` to match your domain
- Update the Nginx configuration in `nginx/conf/default.conf` if you're using a custom domain
- Modify `docker-compose.yml` if you need to change ports or add more services

### 4. Build and Start the Containers

```bash
docker-compose up -d --build
```

This command:
- Builds the Docker images
- Creates and starts the containers in detached mode
- Sets up the MongoDB database with the required schema
- Starts the Nginx reverse proxy

### 5. Verify the Deployment

Check if all containers are running:

```bash
docker-compose ps
```

You should see all three services (nextjs, mongodb, nginx) running.

### 6. Seed the Database (Optional)

If you want to populate the database with sample data:

```bash
docker-compose exec nextjs npx ts-node scripts/seed-db.ts
```

### 7. Monitor Logs

```bash
# View all logs
docker-compose logs

# Follow logs for a specific service
docker-compose logs -f nextjs
```

### 8. Accessing the Application

The application should now be accessible:

- Without a domain: http://server-ip
- With a domain: http://your-domain.com (after configuring DNS)

## Database Management

### Backup MongoDB Data

```bash
docker-compose exec mongodb mongodump --out=/data/db/backup
```

The backup will be stored in the MongoDB data volume.

### Restore MongoDB Data

```bash
docker-compose exec mongodb mongorestore /data/db/backup
```

## Updating the Application

To update the application to a new version:

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## SSL/TLS Configuration

For production, it's recommended to enable HTTPS. You can use Certbot with Nginx:

1. Install Certbot on the host
2. Obtain certificates
3. Update the Nginx configuration to use SSL

Example Certbot command:

```bash
certbot --nginx -d yourdomain.com
```

## Troubleshooting

### MongoDB Connection Issues

Test the MongoDB connection:

```bash
docker-compose exec nextjs node scripts/test-mongo-connection.js
```

### Application Not Starting

Check the logs for errors:

```bash
docker-compose logs nextjs
```

### Nginx Errors

Check the Nginx logs:

```bash
docker-compose logs nginx
```

## Performance Considerations

- For high-traffic deployments, consider scaling the application using Docker Swarm or Kubernetes
- Add a CDN for static content delivery
- Configure MongoDB replication for data redundancy
- Implement regular database backups

---

For additional support, refer to the project documentation or reach out to the development team.