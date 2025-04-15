import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ChakraProvider, CSSReset, Box } from '@chakra-ui/react';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import Analysis from './pages/Analysis';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ChakraProvider, CSSReset, Box } from '@chakra-ui/react';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import Analysis from './pages/Analysis';
import AnalysisDetail from './pages/AnalysisDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// Theme
import theme from './theme';

const PrivateRoute = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  
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

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <AuthProvider>
        <Router>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/">
                <Header />
                <Box display="flex" flex="1">
                  <Sidebar />
                  <Box flex="1" p={4} bg="gray.50">
                    <Switch>
                      <Route exact path="/" component={Dashboard} />
                      <Route exact path="/repositories" component={Repositories} />
                      <Route path="/repositories/:id" component={RepositoryDetail} />
                      <Route exact path="/analysis" component={Analysis} />
                      <Route path="/analysis/:id" component={AnalysisDetail} />
                      <Route component={NotFound} />
                    </Switch>
                  </Box>
                </Box>
              </PrivateRoute>
            </Switch>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;