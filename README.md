ITAM project with Alembic and Vite frontend

Backend:
- FastAPI app in /app
- Alembic configuration in /alembic (use `alembic upgrade head` after configuring sqlalchemy.url in alembic.ini or setting env var)
- Run with: docker-compose up --build

Frontend:
- Vite React app in /frontend
- Install: cd frontend && npm install
- Dev: npm run dev (serves at http://localhost:3000)
- Build: npm run build
