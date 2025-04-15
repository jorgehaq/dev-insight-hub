import React from 'react';
import { Box, Heading, Text, Button, Icon, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={6}>
        <Icon as={FiAlertTriangle} boxSize="50px" color="yellow.500" />
        
        <Heading as="h1" size="xl" mt={6} mb={2}>
          404 - Page Not Found
        </Heading>
        
        <Text color={'gray.500'}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button
          colorScheme="blue"
          leftIcon={<FiHome />}
          as={RouterLink}
          to="/"
          mt={2}
        >
          Return to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;