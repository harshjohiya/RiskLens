"""Authentication routes - JWT-based email/password authentication."""
import logging
import sqlite3
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..auth_utils import hash_password, verify_password, create_access_token
from ..storage import create_user, get_user_by_email

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])


# Request/Response Models
class LoginRequest(BaseModel):
    """Login credentials."""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Signup credentials."""
    name: str
    email: EmailStr
    password: str


class User(BaseModel):
    """User information."""
    id: str
    email: str
    name: str


class AuthResponse(BaseModel):
    """Authentication response with JWT token."""
    access_token: str
    token_type: str = "bearer"
    user: User


@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user with email and password.
    
    Returns JWT token with user_id in 'sub' claim.
    """
    logger.info(f"Login attempt for email: {credentials.email}")
    
    # Get user from database
    user = get_user_by_email(credentials.email)
    
    if not user:
        logger.warning(f"Login failed: User not found - {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Verify password
    if not verify_password(credentials.password, user['password_hash']):
        logger.warning(f"Login failed: Invalid password - {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Generate JWT token
    token = create_access_token(user_id=user['id'], email=user['email'])
    
    logger.info(f"Login successful: {credentials.email}")
    
    return AuthResponse(
        access_token=token,
        user=User(
            id=user['id'],
            email=user['email'],
            name=user['name'] or 'User',
        ),
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(credentials: SignupRequest):
    """
    Register a new user account.
    
    Creates user in database with hashed password.
    Returns JWT token with user_id in 'sub' claim.
    """
    logger.info(f"Signup attempt for email: {credentials.email}")
    
    # Check if user already exists
    existing_user = get_user_by_email(credentials.email)
    if existing_user:
        logger.warning(f"Signup failed: Email already exists - {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Validate password strength
    if len(credentials.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )
    
    # Hash password
    password_hash = hash_password(credentials.password)
    
    # Create user
    try:
        user_id = create_user(
            email=credentials.email,
            password_hash=password_hash,
            name=credentials.name,
        )
    except sqlite3.IntegrityError:
        logger.error(f"Signup failed: Database integrity error - {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Generate JWT token
    token = create_access_token(user_id=user_id, email=credentials.email)
    
    logger.info(f"Signup successful: {credentials.email}")
    
    return AuthResponse(
        access_token=token,
        user=User(
            id=user_id,
            email=credentials.email,
            name=credentials.name,
        ),
    )

