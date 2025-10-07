# Guide de Déploiement GMPI

## 🎯 Vue d'ensemble

Ce guide explique comment déployer l'application GMPI en production.

---

## Option 1: Railway.app (Recommandé - Gratuit pour commencer)

### Avantages
- ✅ Gratuit jusqu'à 500h/mois
- ✅ Déploiement automatique depuis GitHub
- ✅ SSL gratuit
- ✅ Base de données incluse
- ✅ Configuration simple

### Étapes de déploiement

#### 1. Préparer GitHub
```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub et pousser
git remote add origin https://github.com/votre-username/gmpi.git
git branch -M main
git push -u origin main
```

#### 2. Déployer sur Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Sélectionnez "Deploy from GitHub repo"
5. Choisissez votre repo GMPI

#### 3. Configurer les services

Railway détectera automatiquement Docker Compose et créera 3 services:
- **Frontend**
- **Backend**
- **Database**

#### 4. Variables d'environnement

Pour chaque service, ajoutez les variables:

**Backend:**
```
SECRET_KEY=votre_clé_jwt_très_sécurisée_de_32_caractères_minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=${{Frontend.RAILWAY_STATIC_URL}}
DATABASE_URL=mysql://${{MySQL.MYSQL_USER}}:${{MySQL.MYSQL_PASSWORD}}@${{MySQL.RAILWAY_PRIVATE_DOMAIN}}:3306/${{MySQL.MYSQL_DATABASE}}
```

**Database (MySQL):**
```
MYSQL_ROOT_PASSWORD=votre_password_root_sécurisé
MYSQL_DATABASE=gmpi_db
MYSQL_USER=gmpi_user
MYSQL_PASSWORD=votre_password_sécurisé
```

#### 5. Exposer les services

- Frontend: Activer "Public Networking" → Obtenir l'URL
- Backend: Activer "Public Networking" → Obtenir l'URL

#### 6. Mettre à jour CORS

Retournez dans Backend → Variables → Mettez à jour `CORS_ORIGINS` avec l'URL du frontend

---

## Option 2: DigitalOcean / VPS

### Prérequis
- Un VPS (5-10$/mois)
- Domaine (optionnel)

### Étapes

#### 1. Se connecter au VPS
```bash
ssh root@votre-ip
```

#### 2. Installer Docker
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt-get install docker-compose-plugin
```

#### 3. Cloner le projet
```bash
cd /opt
git clone https://github.com/votre-username/gmpi.git
cd gmpi
```

#### 4. Configurer les variables d'environnement
```bash
# Copier et éditer le fichier .env
nano .env
```

Contenu:
```env
DATABASE_URL=mysql://gmpi_user:PASSWORD_SECURE@db:3306/gmpi_db
SECRET_KEY=CLÉ_JWT_TRÈS_SÉCURISÉE_32_CARACTÈRES_MINIMUM
CORS_ORIGINS=https://votre-domaine.com
MYSQL_ROOT_PASSWORD=ROOT_PASSWORD
MYSQL_DATABASE=gmpi_db
MYSQL_USER=gmpi_user
MYSQL_PASSWORD=USER_PASSWORD
```

#### 5. Lancer l'application
```bash
docker-compose up -d
```

#### 6. Configurer Nginx (Reverse Proxy)

```bash
# Installer Nginx
apt-get install nginx

# Créer la config
nano /etc/nginx/sites-available/gmpi
```

Contenu:
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/gmpi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 7. Installer SSL avec Let's Encrypt
```bash
# Installer Certbot
apt-get install certbot python3-certbot-nginx

# Obtenir le certificat
certbot --nginx -d votre-domaine.com

# Renouvellement automatique
certbot renew --dry-run
```

---

## Option 3: Vercel (Frontend) + Railway (Backend)

### Frontend sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez GitHub
3. Import le projet
4. Configurez:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

5. Variables d'environnement:
```
VITE_API_URL=https://votre-backend.railway.app
```

### Backend sur Railway

Suivez les étapes de l'Option 1 mais uniquement pour backend + database

---

## Option 4: AWS / Azure / GCP

### AWS EC2 + RDS

1. Créer une instance EC2 (Ubuntu)
2. Créer une instance RDS MySQL
3. Installer Docker sur EC2
4. Configurer Security Groups
5. Déployer avec Docker Compose

### Variables importantes:
```
DATABASE_URL=mysql://user:pass@rds-endpoint:3306/gmpi_db
SECRET_KEY=...
CORS_ORIGINS=https://votre-domaine.com
```

---

## 🔒 Checklist de sécurité

Avant la mise en production:

- [ ] Changer le SECRET_KEY (minimum 32 caractères aléatoires)
- [ ] Utiliser des mots de passe forts pour la base de données
- [ ] Configurer correctement CORS_ORIGINS (pas de *)
- [ ] Activer HTTPS (SSL/TLS)
- [ ] Changer les identifiants par défaut (admin/admin123)
- [ ] Désactiver phpMyAdmin en production
- [ ] Configurer un firewall
- [ ] Mettre en place des backups automatiques
- [ ] Configurer les logs
- [ ] Limiter les tentatives de connexion

---

## 📊 Monitoring

### Logs Docker
```bash
# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
```

### Health Check
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

---

## 🔄 Mise à jour

### Sur Railway
```bash
git add .
git commit -m "Update"
git push origin main
# Railway déploie automatiquement
```

### Sur VPS
```bash
cd /opt/gmpi
git pull
docker-compose down
docker-compose up -d --build
```

---

## 🆘 Dépannage

### Les conteneurs ne démarrent pas
```bash
docker-compose logs
docker-compose down
docker-compose up -d --build
```

### Problème de connexion à la base de données
- Vérifier DATABASE_URL
- Vérifier que le conteneur MySQL est démarré
- Vérifier les credentials

### CORS errors
- Vérifier que CORS_ORIGINS contient l'URL du frontend
- Redémarrer le backend après modification

---

## 💰 Coûts estimés

| Plateforme | Coût/mois | Notes |
|------------|-----------|-------|
| Railway | 0-20$ | Gratuit jusqu'à 500h/mois |
| DigitalOcean | 5-10$ | Droplet basique |
| Vercel | 0$ | Frontend gratuit |
| AWS | 10-30$ | EC2 + RDS |

---

## 📞 Support

Pour toute question sur le déploiement:
- Ouvrir une issue sur GitHub
- Consulter la documentation des plateformes

