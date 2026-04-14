#!/bin/bash

# Script de déploiement TimePro - Staging
# Usage: ./deploy-staging.sh

set -e

echo "🚀 Déploiement TimePro - Staging"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Répertoires
BACKEND_DIR="/var/www/timepro/backend"
FRONTEND_DIR="/var/www/timepro/frontend"

# Commandes
echo -e "${YELLOW}1. Mise à jour du code...${NC}"
cd $BACKEND_DIR
git pull origin main

echo -e "${YELLOW}2. Installation des dépendances PHP...${NC}"
composer install --no-dev --optimize-autoloader

echo -e "${YELLOW}3. Migration de la base de données...${NC}"
php artisan migrate --force

echo -e "${YELLOW}4. Cache des config...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo -e "${YELLOW}5. Build frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

echo -e "${YELLOW}6. Nettoyage cache...${NC}"
cd $BACKEND_DIR
php artisan cache:clear
php artisan optimize

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
