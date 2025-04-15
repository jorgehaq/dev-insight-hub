import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Link,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { FiGithub } from 'react-icons/fi';
import { Card } from '../components/Card';
import { api } from '../api';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    is_public: true,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  
  useEffect(() => {
    fetchRepositories();
  }, []);
  
  const fetchRepositories = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.get('/repositories');
      setRepositories(response.data);
    } catch (err) {
      setError('Failed to load repositories. Please try again later.');
      console.error('Error fetching repositories:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setFormError('Repository name is required');
      return;
    }
    
    if (!formData.url.trim()) {
      setFormError('Repository URL is required');
      return;
    }
    
    // Validate GitHub URL format
    const githubUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
    if (!githubUrlRegex.test(formData.url)) {
      setFormError('Please enter a valid GitHub repository URL (https://github.com/username/repository)');
      return;
    }
    
    setFormError('');
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/repositories', formData);
      setRepositories([...repositories, response.data]);
      onClose();
      // Reset form
      setFormData({
        name: '',
        url: '',
        is_public: true,
      });
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add repository. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredRepositories = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Repositories</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue"
          onClick={onOpen}
        >
          Add Repository
        </Button>
      </Flex>
      
      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder="Search repositories" 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="200px" borderRadius="md" />
          ))}
        </SimpleGrid>
      ) : filteredRepositories.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredRepositories.map((repo) => (
            <Card 
              key={repo.id} 
              as={RouterLink}
              to={`/repositories/${repo.id}`}
              _hover={{ 
                transform: 'translateY(-4px)',
                boxShadow: 'lg',
                textDecoration: 'none'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={3}>
                <Flex justifyContent="space-between" width="100%">
                  <Heading size="md" noOfLines={1}>{repo.name}</Heading>
                  <Icon 
                    as={repo.is_public ? UnlockIcon : LockIcon} 
                    color={repo.is_public ? "green.500" : "orange.500"} 
                  />
                </Flex>
                
                <HStack>
                  <Icon as={FiGithub} />
                  <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    {repo.url}
                  </Text>
                </HStack>
                
                <Flex justifyContent="space-between" width="100%" mt="auto" pt={2}>
                  <Badge 
                    colorScheme={repo.last_analyzed_at ? "green" : "gray"}
                  >
                    {repo.last_analyzed_at 
                      ? `Last analyzed: ${new Date(repo.last_analyzed_at).toLocaleDateString()}` 
                      : 'Never analyzed'}
                  </Badge>
                  
                  <Link 
                    href={repo.url} 
                    isExternal
                    color="blue.500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Flex>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Heading size="md" mb={3}>No repositories found</Heading>
          <Text color="gray.500">
            {searchTerm 
              ? 'Try a different search term' 
              : 'Start by adding your first repository'}
          </Text>
        </Box>
      )}
      
      {/* Add Repository Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Repository</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              {formError && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {formError}
                </Alert>
              )}
              
              <FormControl id="name" isRequired>
                <FormLabel>Repository Name</FormLabel>
                <Input 
                  placeholder="My Project"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </FormControl>
              
              <FormControl mt={4} id="url" isRequired>
                <FormLabel>GitHub URL</FormLabel>
                <Input 
                  placeholder="https://github.com/username/repository"
                  value={formData.url}
                  onChange={handleFormChange}
                />
              </FormControl>
              
              <FormControl mt={4} id="is_public">
                <Flex align="center">
                  <FormLabel htmlFor="is_public" mb="0">
                    Public Repository
                  </FormLabel>
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={handleFormChange}
                  />
                </Flex>
              </FormControl>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                Add
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Repositories;