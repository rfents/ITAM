from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(128), index=True)
    serial = Column(String(128), unique=True, index=True, nullable=True)
    model = Column(String(128), nullable=True)
    location = Column(String(128), nullable=True)
    status = Column(String(32), default="active")
    purchased_at = Column(Date, nullable=True)
    tickets = relationship("Ticket", back_populates="asset", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True)
    fullname = Column(String(128), nullable=True)
    email = Column(String(128), unique=True, nullable=True)
    department = Column(String(64), nullable=True)
    hashed_password = Column(String(256), nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String(32), default="user")  # "admin" ou "user"
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256))
    description = Column(Text, nullable=True)
    status = Column(String(32), default="open")
    priority = Column(String(32), default="medium")
    created_at = Column(Date, nullable=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    asset = relationship("Asset", back_populates="tickets")
    user = relationship("User", back_populates="tickets", lazy="joined")
