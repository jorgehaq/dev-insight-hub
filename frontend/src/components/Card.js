import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const Card = ({ children, ...rest }) => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      p={5}
      shadow="md"
      borderRadius="lg"
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Card;