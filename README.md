# GMPI - IT Asset Management & Ticketing System

Un système de gestion des actifs informatiques (ITAM) et de tickets de support avec interface web moderne.

## 🚀 Technologies

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy
- **Base de données**: MariaDB
- **Containerisation**: Docker + Docker Compose

## 📋 Fonctionnalités

- 🔐 Authentification JWT avec rôles (Admin/User)
- 💼 Gestion des actifs informatiques (PC, serveurs, équipements réseau)
- 🎫 Système de tickets de support IT
- 👥 Gestion des utilisateurs avec permissions
- 📊 Tableau de bord avec statistiques
- 🎨 Interface moderne avec Tailwind CSS

## 🏃 Lancement en local

### Prérequis
- Docker et Docker Compose installés

### Installation

1. Cloner le projet
```bash
git clone <votre-repo>
cd GMPI
```

2. Lancer l'application
```bash
docker-compose up -d
```

3. Accéder à l'application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- phpMyAdmin: http://localhost:8080

### Comptes par défaut
- Admin: `admin` / `admin123`
- User: `user` / `user123`

## 🌐 Déploiement en ligne

### Option 1: Railway (Recommandé)

1. Créer un compte sur [Railway.app](https://railway.app)
2. Installer Railway CLI:
```bash
npm i -g @railway/cli
```

3. Se connecter:
```bash
railway login
```

4. Déployer:
```bash
railway init
railway up
```

5. Ajouter les variables d'environnement dans le dashboard Railway:
```
DATABASE_URL=mysql://user:password@host:port/dbname
SECRET_KEY=votre_clé_secrète_jwt
CORS_ORIGINS=https://votre-frontend.railway.app
```

### Option 2: VPS (DigitalOcean, Linode, AWS)

1. SSH vers votre serveur
2. Installer Docker et Docker Compose
3. Cloner le projet
4. Configurer les variables d'environnement
5. Lancer avec Docker Compose:
```bash
docker-compose up -d
```

6. Configurer Nginx comme reverse proxy
7. Installer SSL avec Let's Encrypt

### Option 3: Vercel (Frontend) + Railway (Backend)

**Frontend sur Vercel:**
```bash
cd frontend
vercel --prod
```

**Backend sur Railway:**
```bash
railway init
railway up
```

## 📁 Structure du projet

```
GMPI/
├── app/                    # Backend FastAPI
│   ├── main.py            # Point d'entrée API
│   ├── models.py          # Modèles SQLAlchemy
│   ├── schemas.py         # Schémas Pydantic
│   ├── crud.py            # Opérations CRUD
│   └── auth.py            # Authentification JWT
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── contexts/      # Contextes (Auth)
│   │   └── services/      # Services API
│   └── public/
├── docker-compose.yml     # Configuration Docker
└── README.md
```

## 🔧 Configuration

### Variables d'environnement

**Backend (.env)**
```env
DATABASE_URL=mysql://gmpi_user:gmpi_password@db:3306/gmpi_db
SECRET_KEY=votre_clé_secrète_jwt_très_longue
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
```

## 🛠️ Développement

### Backend
```bash
cd app
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 API Documentation

Une fois le backend lancé, accédez à la documentation interactive:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 Sécurité

- Authentification JWT avec tokens
- Hashage des mots de passe avec bcrypt
- CORS configuré
- Validation des données avec Pydantic
- Permissions basées sur les rôles

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Votre nom

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou un pull request.
