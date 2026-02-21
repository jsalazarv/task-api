#!/bin/bash

# Script para probar el build de Docker localmente antes de desplegar en Dokploy

set -e

echo "🚀 Testing Docker build for HomeTasks API"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
IMAGE_NAME="hometasks-api"
IMAGE_TAG="test"
CONTAINER_NAME="hometasks-api-test"

# Step 1: Build image
echo -e "\n${YELLOW}Step 1: Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 2: Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load DATABASE_URL from .env
export $(grep -v '^#' .env | xargs)

# Step 3: Run container
echo -e "\n${YELLOW}Step 2: Starting container...${NC}"
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 3001:3000 \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e NODE_ENV=production \
  ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container started${NC}"
else
    echo -e "${RED}✗ Container failed to start${NC}"
    exit 1
fi

# Step 4: Wait for server to start
echo -e "\n${YELLOW}Step 3: Waiting for server to start...${NC}"
sleep 5

# Step 5: Test health endpoint
echo -e "\n${YELLOW}Step 4: Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Health check successful${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed${NC}"
    docker logs ${CONTAINER_NAME}
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
    exit 1
fi

# Step 6: Test register endpoint
echo -e "\n${YELLOW}Step 5: Testing register endpoint...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dockertest@example.com",
    "name": "Docker Test",
    "password": "password123"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ Register endpoint successful${NC}"
    echo "Response: $REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
else
    echo -e "${RED}✗ Register endpoint failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
fi

# Step 7: Show logs
echo -e "\n${YELLOW}Step 6: Container logs:${NC}"
docker logs ${CONTAINER_NAME} --tail 50

# Step 8: Cleanup
echo -e "\n${YELLOW}Step 7: Cleaning up...${NC}"
docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}

echo -e "\n${GREEN}=========================================="
echo "✓ Docker build test completed!"
echo "===========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Push your code to Git repository"
echo "2. Create application in Dokploy"
echo "3. Configure environment variables"
echo "4. Deploy!"
