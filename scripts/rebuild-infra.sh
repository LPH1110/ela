#!/bin/bash
set -e

echo "Stopping and removing existing containers and volumes..."
podman-compose down -v

echo "Pruning unused Podman containers, networks, and volumes..."
podman system prune -f
podman volume prune -f

echo "Starting infrastructure containers..."
podman-compose up -d

echo "Waiting for PostgreSQL to be ready..."
until podman exec ela-postgres pg_isready -U admin -d ela_db > /dev/null 2>&1; do
  echo "PostgreSQL is starting up..."
  sleep 1
done

echo "Deploying Prisma migrations..."
cd server
npx prisma migrate dev --name init_db --create-only
npx --no-install prisma migrate deploy
rm -rf prisma/migrations

echo "Infrastructure rebuilt successfully!"
