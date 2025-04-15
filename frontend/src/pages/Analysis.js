import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Link,
  Button,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Skeleton,
  Alert,
  AlertIcon,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiBarChart2, FiAlertCircle, FiFileText, FiGithub } from 'react-icons/fi';
import { Card } from '../components/Card';
import { api } from '../api';

const Analysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRepo, setFilterRepo] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch repositories first
      const repoResponse = await api.get('/repositories');
      setRepositories(repoResponse.data);
      
      // Then fetch all analyses
      const analysesResponse = await api.get('/analyses');
      setAnalyses(analysesResponse.data);
    } catch (err) {
      setError('Failed to load analyses. Please try again later.');
      console.error('Error fetching analyses:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRepoFilterChange = (e) => {
    setFilterRepo(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  // Apply filters and sorting
  const filteredAnalyses = analyses
    .filter(analysis => {
      // Filter by repository
      if (filterRepo !== 'all' && analysis.repository_id !== parseInt(filterRepo)) {
        return false;
      }
      
      // Filter by search term (if implemented in your backend)
      if (searchTerm && !analysis.id.includes(searchTerm)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });
  
  const getRepositoryName = (repoId) => {
    const repository = repositories.find(repo => repo.id === repoId);
    return repository ? repository.name : 'Unknown Repository';
  };
  
  return (
    <Box>
      <Heading mb={6}>Analysis Results</Heading>
      
      <Flex 
        mb={6} 
        direction={{ base: 'column', md: 'row' }} 
        gap={4}
      >
        <InputGroup maxW={{ md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by ID" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
        
        <Select 
          placeholder="Repository" 
          value={filterRepo} 
          onChange={handleRepoFilterChange}
          maxW={{ md: '250px' }}
        >
          <option value="all">All Repositories</option>
          {repositories.map(repo => (
            <option key={repo.id} value={repo.id}>
              {repo.name}
            </option>
          ))}
        </Select>
        
        <Select 
          value={sortOrder} 
          onChange={handleSortChange}
          maxW={{ md: '200px' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </Select>
        
        <Button 
          colorScheme="blue"
          onClick={fetchData}
          ml={{ md: 'auto' }}
        >
          Refresh
        </Button>
      </Flex>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="160px" borderRadius="md" />
          ))}
        </SimpleGrid>
      ) : filteredAnalyses.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filteredAnalyses.map((analysis) => (
            <Card 
              key={analysis.id}
              as={RouterLink}
              to={`/analysis/${analysis.id}`}
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                textDecoration: 'none'
              }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" mb={3}>
                <Box>
                  <HStack mb={2}>
                    <Icon as={FiGithub} />
                    <Text fontWeight="bold">
                      {getRepositoryName(analysis.repository_id)}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(analysis.created_at).toLocaleString()}
                  </Text>
                </Box>
                <Badge 
                  colorScheme={
                    analysis.status === 'completed' ? 'green' : 
                    analysis.status === 'pending' ? 'yellow' : 
                    analysis.status === 'error' ? 'red' : 'gray'
                  }
                  alignSelf="flex-start"
                >
                  {analysis.status}
                </Badge>
              </Flex>
              
              <Divider my={2} />
              
              <HStack spacing={4} mt={3} justify="space-between">
                {analysis.status === 'completed' ? (
                  <>
                    <Flex align="center">
                      <Icon as={FiFileText} mr={2} />
                      <Text fontSize="sm">
                        Files: <strong>{analysis.files_analyzed || 0}</strong>
                      </Text>
                    </Flex>
                    
                    <Flex align="center">
                      <Icon as={FiAlertCircle} mr={2} />
                      <Text fontSize="sm">
                        Issues: <strong>{analysis.total_issues || 0}</strong>
                      </Text>
                    </Flex>
                    
                    <Flex align="center">
                      <Icon as={FiBarChart2} mr={2} />
                      <Text fontSize="sm">View Details</Text>
                    </Flex>
                  </>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    {analysis.status === 'pending' 
                      ? 'Analysis in progress...' 
                      : analysis.status === 'error'
                      ? `Error: ${analysis.message || 'Unknown error'}` 
                      : 'Status unknown'}
                  </Text>
                )}
              </HStack>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Icon as={FiBarChart2} boxSize="40px" color="gray.400" />
          <Heading size="md" mt={4} mb={2}>No analyses found</Heading>
          <Text color="gray.500" mb={6}>
            {searchTerm || filterRepo !== 'all'
              ? 'Try changing your search filters.'
              : 'Start by analyzing one of your repositories.'}
          </Text>
          <Button 
            as={RouterLink} 
            to="/repositories" 
            colorScheme="blue"
          >
            Go to Repositories
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Analysis;