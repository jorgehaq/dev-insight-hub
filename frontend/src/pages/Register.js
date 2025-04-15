import React, { useState } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Checkbox,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { api } from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const history = useHistory();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const validate = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/users', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Registration successful
      history.push('/login');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
      px={4}
    >
      <Box 
        maxW="lg" 
        w="full" 
        bg={bgColor} 
        p={8} 
        borderRadius="lg" 
        boxShadow="lg"
      >
        <Stack spacing={8}>
          <Stack align="center">
            <Heading fontSize="2xl">Create your account</Heading>
            <Text fontSize="md" color={textColor}>
              to start analyzing your code repositories ✨
            </Text>
          </Stack>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input 
                  type="text" 
                  value={formData.username}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <Checkbox
                  isChecked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                >
                  I accept the Terms and Conditions
                </Checkbox>
              </FormControl>
              
              <Stack spacing={6} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                >
                  Sign up
                </Button>
              </Stack>
            </Stack>
          </form>
          
          <Stack pt={6}>
            <Text align="center">
              Already a user?{' '}
              <Link as={RouterLink} to="/login" color="blue.400">
                Login
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Register;