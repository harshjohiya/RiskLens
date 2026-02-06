"""Authentication routes - Simple implementation for demo purposes."""
import logging
from datetime import datetime, timedelta
from typing import Optional
import secrets
import hashlib

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..auth_utils import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])


# Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class User(BaseModel):
    id: str
    email: str
    name: str


class AuthResponse(BaseModel):
    access_token: str
    user: User


class GoogleAuthRequest(BaseModel):
    token: str


# Simple in-memory user storage (for demo only - use a real database in production)
users_db = {}


def hash_password(password: str) -> str:
    """Simple password hashing (use proper library like bcrypt in production)."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return hash_password(plain_password) == hashed_password


@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user with email and password.
    
    Returns JWT token with user_id in 'sub' claim.
    """
    logger.info(f"Login attempt for email: {credentials.email}")
    
    # Check if user exists
    user_data = users_db.get(credentials.email)
    
    if not user_data:
        # For demo: auto-create user on first login
        user_id = secrets.token_hex(8)
        
        user_data = {
            "id": user_id,
            "email": credentials.email,
            "name": credentials.email.split("@")[0].title(),
            "password_hash": hash_password(credentials.password),
        }
        users_db[credentials.email] = user_data
        
        logger.info(f"Auto-registered new user: {credentials.email}")
    else:
        # Verify password
        if not verify_password(credentials.password, user_data["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
    
    # Generate JWT token
    token = create_access_token(user_id=user_data["id"], email=user_data["email"])
    
    return AuthResponse(
        access_token=token,
        user=User(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
        ),
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(credentials: SignupRequest):
    """
    Register a new user account.
    
    For demo purposes, creates user in memory.
    In production, implement proper user creation with database.
    Returns JWT token with user_id in 'sub' claim.
    """
    logger.info(f"Signup attempt for email: {credentials.email}")
    
    # Check if user already exists
    if credentials.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Create new user
    user_id = secrets.token_hex(8)
    
    user_data = {
        "id": user_id,
        "email": credentials.email,
        "name": credentials.name,
        "password_hash": hash_password(credentials.password),
        "created_at": datetime.utcnow().isoformat(),
    }
    
    users_db[credentials.email] = user_data
    
    logger.info(f"Created new user: {credentials.email}")
    
    # Generate JWT token
    token = create_access_token(user_id=user_id, email=credentials.email)
    
    return AuthResponse(
        access_token=token,
        user=User(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
        ),
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate with Google OAuth.
    
    This is a placeholder for future Google OAuth integration.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google authentication is not yet implemented",
    )
