from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud, auth
from .database import SessionLocal, engine
from datetime import timedelta
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ITAM Prototype with Auth and Alembic")

# CORS - allow frontend (change origins in production)
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = crud.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@app.post("/token")
def login_for_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password) if hasattr(crud, 'authenticate_user') else crud.get_user_by_username(db, form_data.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = auth.create_access_token({"sub": user.username}, expires_delta=60*24)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.User)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Protected endpoints examples (create/update/delete require auth)
@app.post("/assets", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_asset(db, asset)

@app.get("/assets", response_model=list[schemas.Asset])
def list_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_assets(db, skip=skip, limit=limit)

@app.get("/assets/{asset_id}", response_model=schemas.Asset)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = crud.get_asset(db, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset: schemas.AssetUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_asset = crud.get_asset(db, asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return crud.update_asset(db, asset_id, asset)

@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_asset = crud.get_asset(db, asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    crud.delete_asset(db, asset_id)
    return {"message": "Asset deleted successfully"}

@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/users", response_model=list[schemas.User])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Seuls les admins peuvent modifier les rôles d'autres utilisateurs
    if user.role is not None and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Only administrators can change roles")

    # Un utilisateur peut se modifier lui-même (hors rôle)
    if current_user.role != "admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You can only edit your own profile")

    updated = crud.update_user(db, user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Seuls les admins peuvent supprimer des utilisateurs
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Only administrators can delete users")
    
    # Empêcher un admin de se supprimer lui-même
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    crud.delete_user(db, user_id)
    return {"message": "User deleted successfully"}

@app.post("/tickets", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if ticket.asset_id is not None and crud.get_asset(db, ticket.asset_id) is None:
        raise HTTPException(status_code=400, detail="Linked asset does not exist")
    if ticket.user_id is not None and crud.get_user(db, ticket.user_id) is None:
        raise HTTPException(status_code=400, detail="Linked user does not exist")
    return crud.create_ticket(db, ticket)

@app.get("/tickets", response_model=list[schemas.Ticket])
def list_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Seuls les admins peuvent voir tous les tickets
    if current_user.role == "admin":
        return crud.get_tickets(db, skip=skip, limit=limit)
    else:
        # Les utilisateurs normaux ne voient que leurs propres tickets
        return crud.get_tickets_by_user(db, current_user.id, skip=skip, limit=limit)

@app.get("/tickets/{ticket_id}", response_model=schemas.Ticket)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Vérifier les permissions : admin ou propriétaire du ticket
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You can only view your own tickets")
    
    return ticket

@app.put("/tickets/{ticket_id}", response_model=schemas.Ticket)
def update_ticket(ticket_id: int, ticket: schemas.TicketUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = crud.get_ticket(db, ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Vérifier les permissions : admin ou propriétaire du ticket
    if current_user.role != "admin" and db_ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You can only edit your own tickets")
    
    return crud.update_ticket(db, ticket_id, ticket)

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = crud.get_ticket(db, ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Vérifier les permissions : admin ou propriétaire du ticket
    if current_user.role != "admin" and db_ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You can only delete your own tickets")
    
    crud.delete_ticket(db, ticket_id)
    return {"message": "Ticket deleted successfully"}
