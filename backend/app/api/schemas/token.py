from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Esquema para representar un token JWT de acceso
    """
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Esquema para representar el payload decodificado de un token JWT
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = "access"


class TokenData(BaseModel):
    """
    Esquema para los datos extraídos del token para autenticación
    """
    username: Optional[str] = None


class TokenRefresh(BaseModel):
    """
    Esquema para solicitar un nuevo token de acceso con un refresh token
    """
    refresh_token: str


class TokenResponse(BaseModel):
    """
    Esquema para la respuesta completa de autenticación con tokens
    """
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int


class PasswordResetRequest(BaseModel):
    """
    Esquema para solicitar un restablecimiento de contraseña
    """
    email: str


class PasswordResetConfirm(BaseModel):
    """
    Esquema para confirmar un restablecimiento de contraseña
    """
    token: str
    new_password: str


class EmailVerificationRequest(BaseModel):
    """
    Esquema para solicitar verificación de email
    """
    email: str


class EmailVerificationConfirm(BaseModel):
    """
    Esquema para confirmar verificación de email
    """
    token: str