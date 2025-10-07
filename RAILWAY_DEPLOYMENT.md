# Guide de Déploiement Railway - GMPI

## 🚨 Problème actuel
Railway essaie de déployer tout le projet comme un seul service, ce qui cause des échecs.

## ✅ Solution : Déploiement séparé

### Étape 1: Déployer le Backend (FastAPI)

1. **Dans Railway dashboard :**
   - Supprimez le service "GMPI" actuel (qui échoue)
   - Cliquez sur "New Service"
   - Sélectionnez "GitHub Repo"
   - Choisissez votre repo `rfents/ITAM`

2. **Railway va détecter automatiquement :**
   - Dockerfile (pour le backend)
   - Port 8000

3. **Ajoutez une base de données MySQL :**
   - Cliquez sur "New Service"
   - Sélectionnez "Database"
   - Choisissez "MySQL"

4. **Variables d'environnement pour le Backend :**
   ```
   SECRET_KEY=votre_clé_secrète_jwt_très_longue_et_sécurisée_32_caractères_minimum
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=mysql://${{MySQL.MYSQL_USER}}:${{MySQL.MYSQL_PASSWORD}}@${{MySQL.RAILWAY_PRIVATE_DOMAIN}}:3306/${{MySQL.MYSQL_DATABASE}}
   CORS_ORIGINS=*
   ```

### Étape 2: Déployer le Frontend (React)

1. **Créer un nouveau service :**
   - Cliquez sur "New Service"
   - Sélectionnez "GitHub Repo"
   - Choisissez votre repo `rfents/ITAM`

2. **Configurer le service Frontend :**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`

3. **Variables d'environnement pour le Frontend :**
   ```
   VITE_API_URL=https://votre-backend-url.railway.app
   ```

### Étape 3: Mettre à jour CORS

1. **Retournez au service Backend**
2. **Mettez à jour CORS_ORIGINS :**
   ```
   CORS_ORIGINS=https://votre-frontend-url.railway.app
   ```

## 🎯 Résultat attendu

- **Backend API:** `https://votre-backend.railway.app`
- **Frontend:** `https://votre-frontend.railway.app`
- **Database:** MySQL gérée par Railway

## 🔧 Alternative : Déploiement manuel

Si Railway continue à échouer, utilisez cette approche :

### Option A: Vercel (Frontend) + Railway (Backend)

**Frontend sur Vercel :**
1. Allez sur [vercel.com](https://vercel.com)
2. Importez votre repo GitHub
3. Configurez :
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**Backend sur Railway :**
1. Suivez l'Étape 1 ci-dessus

### Option B: VPS simple

1. Louez un VPS (DigitalOcean, Linode - 5$/mois)
2. Installez Docker
3. Clonez votre repo
4. Lancez avec `docker-compose up -d`

## 🆘 Dépannage

### Si le backend échoue encore :
- Vérifiez les logs dans Railway
- Assurez-vous que `requirements.txt` existe
- Vérifiez que le dossier `app/` contient `main.py`

### Si le frontend ne se connecte pas au backend :
- Vérifiez `VITE_API_URL` dans le frontend
- Vérifiez `CORS_ORIGINS` dans le backend
- Vérifiez que les deux services sont "Running"

## 📞 Prochaines étapes

1. **Supprimez le service qui échoue** dans Railway
2. **Suivez l'Étape 1** pour déployer le backend
3. **Ajoutez la base de données MySQL**
4. **Testez l'API** sur `https://votre-backend.railway.app/docs`

Dites-moi quand vous avez terminé l'Étape 1, et je vous aiderai avec l'Étape 2 !
