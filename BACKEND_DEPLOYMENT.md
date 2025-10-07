# Guide de Déploiement Backend - GMPI

## 🎯 Solutions alternatives (Railway ne marche pas)

### 🥇 **Option 1 : Render.com (Recommandé - Gratuit)**

1. **Allez sur [render.com](https://render.com)**
2. **Connectez-vous avec GitHub**
3. **Créez un nouveau "Web Service"**
4. **Configurez :**
   - **Repository:** `rfents/ITAM`
   - **Root Directory:** (laissez vide)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Variables d'environnement :**
   ```
   SECRET_KEY=changez_cette_clé_secrète_jwt_très_longue_et_sécurisée_pour_production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=https://votre-frontend.vercel.app
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

6. **Ajoutez une base de données PostgreSQL** (gratuite)

**Résultat :** `https://votre-backend.onrender.com`

---

### 🥈 **Option 2 : VPS simple (5$/mois)**

1. **Louez un VPS :**
   - DigitalOcean : 5$/mois
   - Linode : 5$/mois
   - Vultr : 3.50$/mois

2. **Connectez-vous en SSH :**
   ```bash
   ssh root@votre-ip
   ```

3. **Exécutez le script :**
   ```bash
   curl -sSL https://raw.githubusercontent.com/rfents/ITAM/main/deploy-backend-vps.sh | bash
   ```

**Résultat :** `http://votre-ip:8000`

---

### 🥉 **Option 3 : Heroku (Gratuit)**

1. **Installez Heroku CLI**
2. **Connectez-vous :**
   ```bash
   heroku login
   ```

3. **Créez l'app :**
   ```bash
   heroku create gmpi-backend
   ```

4. **Ajoutez PostgreSQL :**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Déployez :**
   ```bash
   git push heroku main
   ```

6. **Variables d'environnement :**
   ```bash
   heroku config:set SECRET_KEY="votre_clé_secrète"
   heroku config:set CORS_ORIGINS="https://votre-frontend.vercel.app"
   ```

**Résultat :** `https://gmpi-backend.herokuapp.com`

---

### 🏅 **Option 4 : Fly.io (Gratuit)**

1. **Installez Fly CLI**
2. **Connectez-vous :**
   ```bash
   fly auth login
   ```

3. **Déployez :**
   ```bash
   fly deploy
   ```

**Résultat :** `https://gmpi-backend.fly.dev`

---

## 🔧 Configuration du Frontend

Une fois votre backend déployé, mettez à jour Vercel :

### Dans Vercel Dashboard :
1. **Variables d'environnement :**
   ```
   VITE_API_URL=https://votre-backend-url.com
   ```

2. **Redéployez Vercel**

---

## 🎯 Ma recommandation

**Commencez par Render.com** - c'est gratuit, fiable, et très simple à configurer.

### Étapes Render.com :
1. Allez sur render.com
2. Créez un "Web Service"
3. Connectez votre repo GitHub
4. Configurez les variables d'environnement
5. Ajoutez PostgreSQL
6. Déployez !

**Quelle option voulez-vous essayer ?**

1. Render.com (gratuit) ?
2. VPS (5$/mois) ?
3. Heroku (gratuit) ?
4. Fly.io (gratuit) ?

Dites-moi et je vous guide étape par étape ! 🚀
