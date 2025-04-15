import React from 'react';
import { 
  Box, 
  VStack, 
  Icon, 
  Text, 
  Divider, 
  Flex,
  useColorModeValue,
  CloseButton,
  Link
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiGithub, FiBarChart2, FiSettings, FiUsers, FiCode, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// Item de navegación
const NavItem = ({ icon, children, to, isActive }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const inactiveColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full"
    >
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: hoverBg,
        }}
      >
        {icon && (
          <Icon
            mr="3"
            fontSize="16"
            as={icon}
          />
        )}
        <Text fontSize="sm" fontWeight={isActive ? "semibold" : "normal"}>
          {children}
        </Text>
      </Flex>
    </Link>
  );
};

const Sidebar = ({ isOpen, onClose, variant }) => {
  const location = useLocation();
  const { isAuthenticated, user, hasRole } = useAuth();
  
  // Si no está autenticado, no mostrar la barra lateral
  if (!isAuthenticated) return null;
  
  const isAdmin = hasRole('admin');
  
  return (
    <Box
      pos="fixed"
      h="full"
      w={{ base: 'full', md: '60' }}
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      zIndex={{ base: 20, md: 1 }}
      boxShadow={{ base: isOpen ? "lg" : "none", md: "none" }}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold">
          DevInsight
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      <VStack spacing={1} align="stretch" p={2}>
        <NavItem 
          to="/" 
          icon={FiHome} 
          isActive={location.pathname === '/'}
        >
          Dashboard
        </NavItem>
        
        <NavItem 
          to="/repositories" 
          icon={FiGithub} 
          isActive={location.pathname.startsWith('/repositories')}
        >
          Repositories
        </NavItem>
        
        <NavItem 
          to="/analysis" 
          icon={FiBarChart2} 
          isActive={location.pathname.startsWith('/analysis')}
        >
          Analyses
        </NavItem>
        
        <NavItem 
          to="/code" 
          icon={FiCode} 
          isActive={location.pathname.startsWith('/code')}
        >
          Code Insights
        </NavItem>
        
        <Divider my={3} />
        
        {/* Sección Admin */}
        {isAdmin && (
          <>
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                Administration
              </Text>
            </Box>
            
            <NavItem 
              to="/users" 
              icon={FiUsers} 
              isActive={location.pathname.startsWith('/users')}
            >
              Users
            </NavItem>
            
            <Divider my={3} />
          </>
        )}
        
        {/* Configuración y Ayuda */}
        <NavItem 
          to="/settings" 
          icon={FiSettings} 
          isActive={location.pathname.startsWith('/settings')}
        >
          Settings
        </NavItem>
        
        <NavItem 
          to="/help" 
          icon={FiHelpCircle} 
          isActive={location.pathname.startsWith('/help')}
        >
          Help
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;