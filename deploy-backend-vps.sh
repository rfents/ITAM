#!/bin/bash

# Script de déploiement backend simple sur VPS
echo "🚀 Déploiement backend GMPI sur VPS..."

# Installer Python et pip
sudo apt update
sudo apt install python3 python3-pip python3-venv -y

# Créer un utilisateur pour l'application
sudo useradd -m -s /bin/bash gmpi
sudo usermod -aG sudo gmpi

# Se connecter en tant que gmpi
sudo -u gmpi bash << 'EOF'
cd /home/gmpi

# Cloner le projet
git clone https://github.com/rfents/ITAM.git
cd ITAM

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cat > .env << 'ENVEOF'
SECRET_KEY=changez_cette_clé_secrète_jwt_très_longue_et_sécurisée_pour_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://votre-frontend.vercel.app
DATABASE_URL=sqlite:///./gmpi.db
ENVEOF

# Créer un service systemd
sudo tee /etc/systemd/system/gmpi-backend.service > /dev/null << 'SERVICEEOF'
[Unit]
Description=GMPI Backend API
After=network.target

[Service]
Type=simple
User=gmpi
WorkingDirectory=/home/gmpi/ITAM
Environment=PATH=/home/gmpi/ITAM/venv/bin
ExecStart=/home/gmpi/ITAM/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable gmpi-backend
sudo systemctl start gmpi-backend

# Installer Nginx comme reverse proxy
sudo apt install nginx -y

# Configurer Nginx
sudo tee /etc/nginx/sites-available/gmpi-backend > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Activer le site
sudo ln -s /etc/nginx/sites-available/gmpi-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Installer SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com

EOF

echo "✅ Backend déployé!"
echo "🌐 API: http://votre-ip:8000"
echo "📊 Docs: http://votre-ip:8000/docs"
