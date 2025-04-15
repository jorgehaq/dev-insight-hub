import React from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Spacer, 
  Button, 
  IconButton, 
  useColorMode, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  HStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const Header = ({ onMobileMenuToggle }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuth();
  
  const bgColor = useColorModeValue('blue.600', 'blue.900');
  const textColor = useColorModeValue('white', 'white');

  return (
    <Flex 
      as="header" 
      align="center" 
      justify="space-between" 
      p={4} 
      bg={bgColor} 
      color={textColor}
      boxShadow="md"
    >
      {/* Mobile menu button */}
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onMobileMenuToggle}
        variant="ghost"
        aria-label="open menu"
        color="white"
        icon={<HamburgerIcon />}
        _hover={{ bg: 'blue.500' }}
      />
      
      {/* Logo */}
      <Flex align="center">
        <Heading 
          size="md" 
          as={RouterLink} 
          to="/"
          _hover={{ textDecoration: 'none' }}
        >
          DevInsightHub
        </Heading>
      </Flex>
      
      <Spacer />
      
      {/* Right side controls */}
      <HStack spacing={4}>
        {/* Toggle color mode */}
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          color="white"
          _hover={{ bg: 'blue.500' }}
        />
        
        {/* User menu if authenticated */}
        {isAuthenticated ? (
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              _hover={{ bg: 'blue.500' }}
              color="white"
            >
              <HStack>
                <Avatar size="sm" name={user?.username || 'User'} />
                <Text display={{ base: 'none', md: 'flex' }}>{user?.username}</Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
              <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button 
            as={RouterLink} 
            to="/login"
            variant="outline" 
            colorScheme="whiteAlpha"
          >
            Login
          </Button>
        )}
      </HStack>
    </Flex>
  );
};

export default Header;