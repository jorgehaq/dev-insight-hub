import React, { createContext, useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { endpoints } from '../api';

// Crear el contexto de autenticación
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const history = useHistory();

  // Comprobar si hay un token al cargar la aplicación
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verificar si el token ha expirado
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expirado
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          } else {
            // Token válido, cargar información del usuario
            try {
              const response = await endpoints.auth.me();
              setUser(response.data);
              setIsAuthenticated(true);
              setAuthError(null);
            } catch (error) {
              console.error('Error al cargar información del usuario:', error);
              localStorage.removeItem('token');
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } catch (error) {
          // Error al decodificar token
          console.error('Token inválido:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  // Función de login
  const login = async (username, password) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await endpoints.auth.login({ username, password });
      const { access_token, token_type } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', access_token);
      
      // Obtener información del usuario
      const userResponse = await endpoints.auth.me();
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Error de login:', error);
      setAuthError(
        error.response?.data?.detail || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    history.push('/login');
  };

  // Función para verificar si un usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  // Función para actualizar datos de usuario
  const updateUserData = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // Valores proporcionados por el contexto
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    updateUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;