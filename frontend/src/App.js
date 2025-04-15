import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ChakraProvider, Box, Flex, useDisclosure } from '@chakra-ui/react';

// Tema personalizado
import theme from './theme';

// Contexto de autenticación
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Páginas
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import Analysis from './pages/Analysis';
import AnalysisDetail from './pages/AnalysisDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Ruta privada que requiere autenticación
const PrivateRoute = ({ children, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Podrías mostrar un spinner de carga aquí
    return <div>Loading...</div>;
  }
  
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

// Componente principal de layout para rutas autenticadas
const AuthenticatedLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box minH="100vh">
      <Header onMobileMenuToggle={onOpen} />
      <Flex>
        <Sidebar isOpen={isOpen} onClose={onClose} />
        <Box
          ml={{ base: 0, md: 60 }}
          p={4}
          w="full"
          transition="margin-left 0.3s"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

// Componente principal App
const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Switch>
            {/* Rutas públicas */}
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/register">
              <Register />
            </Route>
            
            {/* Rutas privadas */}
            <PrivateRoute exact path="/">
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute exact path="/repositories">
              <AuthenticatedLayout>
                <Repositories />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute path="/repositories/:id">
              <AuthenticatedLayout>
                <RepositoryDetail />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute exact path="/analysis">
              <AuthenticatedLayout>
                <Analysis />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute path="/analysis/:id">
              <AuthenticatedLayout>
                <AnalysisDetail />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute path="/profile">
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </PrivateRoute>
            <PrivateRoute path="/settings">
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </PrivateRoute>
            
            {/* Ruta 404 */}
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App;