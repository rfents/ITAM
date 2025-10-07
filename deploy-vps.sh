#!/bin/bash

# Script de déploiement VPS simple pour GMPI
# Usage: ./deploy-vps.sh

echo "🚀 Déploiement GMPI sur VPS..."

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Cloner le projet
cd /opt
sudo git clone https://github.com/rfents/ITAM.git gmpi
cd gmpi

# Créer le fichier .env
sudo tee .env > /dev/null <<EOF
DATABASE_URL=mysql://gmpi_user:gmpi_password@db:3306/gmpi_db
SECRET_KEY=changez_cette_clé_secrète_jwt_très_longue_et_sécurisée_pour_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=gmpi_db
MYSQL_USER=gmpi_user
MYSQL_PASSWORD=gmpi_password
EOF

# Lancer l'application
sudo docker-compose up -d

echo "✅ Déploiement terminé!"
echo "🌐 Frontend: http://votre-ip:3000"
echo "🔧 Backend: http://votre-ip:8000"
echo "📊 phpMyAdmin: http://votre-ip:8080"
