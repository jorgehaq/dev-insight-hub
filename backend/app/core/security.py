from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from pydantic import ValidationError

from app.core.config import settings

# Context de hash de contraseña
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Función para verificar contraseñas
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña plana coincide con una contraseña hasheada
    """
    return pwd_context.verify(plain_password, hashed_password)

# Función para hashear contraseñas
def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para una contraseña
    """
    return pwd_context.hash(password)

# Función para crear un token de acceso JWT
def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Genera un token JWT de acceso
    
    Args:
        subject: Identificador del usuario (típicamente el username o ID)
        expires_delta: Tiempo opcional de expiración (usa el valor por defecto si no se proporciona)
        
    Returns:
        Token JWT como string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# Función para validar un token JWT
def decode_token(token: str) -> dict:
    """
    Valida y decodifica un token JWT
    
    Args:
        token: Token JWT a validar
        
    Returns:
        Payload del token decodificado
        
    Raises:
        ValidationError: Si el token no es válido o ha expirado
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.JWTError as e:
        raise ValidationError(f"Could not validate token: {e}")

# Función para generar un token de reset de contraseña
def create_password_reset_token(email: str) -> str:
    """
    Genera un token de reset de contraseña (con expiración más corta)
    
    Args:
        email: Email del usuario que quiere resetear su contraseña
        
    Returns:
        Token JWT como string
    """
    delta = timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    expire = datetime.utcnow() + delta
    to_encode = {"exp": expire, "sub": email, "type": "reset"}
    
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# Función para verificar un token de reset de contraseña
def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Valida un token de reset de contraseña
    
    Args:
        token: Token JWT de reset de contraseña
        
    Returns:
        Email del usuario si el token es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "reset":
            return None
        return payload["sub"]
    except (jwt.JWTError, ValidationError):
        return None

# Función para generar un token de verificación de email
def create_email_verification_token(email: str) -> str:
    """
    Genera un token para verificación de email
    
    Args:
        email: Email del usuario a verificar
        
    Returns:
        Token JWT como string
    """
    delta = timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
    expire = datetime.utcnow() + delta
    to_encode = {"exp": expire, "sub": email, "type": "verification"}
    
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# Función para verificar un token de verificación de email
def verify_email_token(token: str) -> Optional[str]:
    """
    Valida un token de verificación de email
    
    Args:
        token: Token JWT de verificación
        
    Returns:
        Email del usuario si el token es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "verification":
            return None
        return payload["sub"]
    except (jwt.JWTError, ValidationError):
        return None