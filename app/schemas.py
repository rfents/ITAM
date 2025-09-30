from pydantic import BaseModel
from typing import Optional
from datetime import date

class AssetBase(BaseModel):
    hostname: str
    serial: Optional[str] = None
    model: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "active"
    purchased_at: Optional[date] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    fullname: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    fullname: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    password: Optional[str] = None

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "open"
    priority: Optional[str] = "medium"
    created_at: Optional[date] = None
    asset_id: Optional[int] = None
    user_id: Optional[int] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(TicketBase):
    pass

class Ticket(TicketBase):
    id: int
    user: Optional[User] = None
    class Config:
        orm_mode = True
