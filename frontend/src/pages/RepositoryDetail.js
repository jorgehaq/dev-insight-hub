import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  HStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Link,
  Divider,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { 
  FiGithub, FiClock, FiFileText, FiCode, FiAlertCircle,
  FiBarChart2, FiPlay, FiTrash2, FiEdit, FiExternalLink
} from 'react-icons/fi';
import { Card } from '../components/Card';
import { api } from '../api';

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  
  useEffect(() => {
    fetchRepositoryData();
  }, [id]);
  
  const fetchRepositoryData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch repository details
      const repoResponse = await api.get(`/repositories/${id}`);
      setRepository(repoResponse.data);
      
      // Fetch repository analyses
      const analysesResponse = await api.get(`/analyses?repository_id=${id}`);
      setAnalyses(analysesResponse.data);
    } catch (err) {
      setError('Failed to load repository data. Please try again later.');
      console.error('Error fetching repository data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const triggerAnalysis = async () => {
    setIsAnalysisLoading(true);
    
    try {
      // Trigger analysis
      await api.post(`/repositories/${id}/analyze`);
      
      toast({
        title: 'Analysis started',
        description: 'The analysis has been queued and will be processed shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh analyses list after a delay to allow processing
      setTimeout(() => {
        fetchRepositoryData();
      }, 3000);
    } catch (err) {
      toast({
        title: 'Analysis failed',
        description: err.response?.data?.detail || 'Failed to start analysis. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalysisLoading(false);
    }
  };
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (isLoading) {
    return (
      <Box>
        <Skeleton height="40px" width="300px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </SimpleGrid>
        <Skeleton height="400px" />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading Repository
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
        <Button 
          mt={4} 
          colorScheme="red" 
          onClick={fetchRepositoryData}
        >
          Try Again
        </Button>
      </Alert>
    );
  }
  
  if (!repository) {
    return (
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Repository Not Found
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          The repository you're looking for doesn't exist or you don't have access to it.
        </AlertDescription>
        <Button 
          mt={4} 
          colorScheme="blue" 
          as={RouterLink} 
          to="/repositories"
        >
          Back to Repositories
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap">
        <Box>
          <Heading mb={2}>{repository.name}</Heading>
          <HStack spacing={2}>
            <Icon as={FiGithub} />
            <Link href={repository.url} isExternal color="blue.500">
              {repository.url} <Icon as={FiExternalLink} mx="2px" />
            </Link>
          </HStack>
        </Box>
        
        <HStack spacing={2} mt={{ base: 4, md: 0 }}>
          <Button
            leftIcon={<FiPlay />}
            colorScheme="green"
            onClick={triggerAnalysis}
            isLoading={isAnalysisLoading}
            loadingText="Starting"
          >
            Analyze Now
          </Button>
          <Button leftIcon={<FiEdit />} colorScheme="blue">
            Edit
          </Button>
          <Button leftIcon={<FiTrash2 />} colorScheme="red" variant="outline">
            Delete
          </Button>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card>
          <Stat>
            <StatLabel>Last Analyzed</StatLabel>
            <StatNumber>
              {repository.last_analyzed_at 
                ? new Date(repository.last_analyzed_at).toLocaleDateString() 
                : 'Never'}
            </StatNumber>
            {repository.last_analyzed_at && (
              <StatHelpText>
                {new Date(repository.last_analyzed_at).toLocaleTimeString()}
              </StatHelpText>
            )}
          </Stat>
        </Card>
        
        <Card>
          <Stat>
            <StatLabel>Total Analyses</StatLabel>
            <StatNumber>{analyses.length}</StatNumber>
            {analyses.length > 0 && (
              <StatHelpText>
                Latest: {new Date(analyses[0].created_at).toLocaleDateString()}
              </StatHelpText>
            )}
          </Stat>
        </Card>
        
        <Card>
          <Stat>
            <StatLabel>Status</StatLabel>
            <HStack>
              <Badge 
                colorScheme={repository.is_public ? "green" : "orange"} 
                fontSize="lg"
                p={1}
              >
                {repository.is_public ? "Public" : "Private"}
              </Badge>
              
              {repository.github_webhook_id && (
                <Badge 
                  colorScheme="blue" 
                  fontSize="lg"
                  p={1}
                >
                  Webhook Enabled
                </Badge>
              )}
            </HStack>
            <StatHelpText>
              Created: {new Date(repository.created_at).toLocaleDateString()}
            </StatHelpText>
          </Stat>
        </Card>
      </SimpleGrid>
      
      <Tabs isLazy variant="enclosed" borderColor={borderColor}>
        <TabList>
          <Tab>
            <Icon as={FiBarChart2} mr={2} />
            Analysis History
          </Tab>
          <Tab>
            <Icon as={FiAlertCircle} mr={2} />
            Issues
          </Tab>
          <Tab>
            <Icon as={FiFileText} mr={2} />
            Files
          </Tab>
          <Tab>
            <Icon as={FiClock} mr={2} />
            Activity
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={4}>
            {analyses.length > 0 ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {analyses.map((analysis) => (
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
                    <Flex justify="space-between">
                      <Box>
                        <Text fontWeight="bold">
                          Analysis {analysis.id.substring(0, 8)}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(analysis.created_at).toLocaleString()}
                        </Text>
                      </Box>
                      <Box>
                        <Badge 
                          colorScheme={analysis.status === 'completed' ? 'green' : 
                                       analysis.status === 'pending' ? 'yellow' : 
                                       analysis.status === 'error' ? 'red' : 'gray'}
                        >
                          {analysis.status}
                        </Badge>
                      </Box>
                    </Flex>
                    
                    {analysis.status === 'completed' && (
                      <Flex mt={4} justify="space-between">
                        <Text fontSize="sm">
                          Files analyzed: <strong>{analysis.files_analyzed || 0}</strong>
                        </Text>
                        <Text fontSize="sm">
                          Issues found: <strong>{analysis.total_issues || 0}</strong>
                        </Text>
                      </Flex>
                    )}
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" py={10}>
                <Icon as={FiBarChart2} boxSize="40px" color="gray.400" />
                <Heading size="md" mt={4} mb={2}>No analyses yet</Heading>
                <Text color="gray.500" mb={6}>
                  Run your first analysis to get insights into your code quality.
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={triggerAnalysis}
                  isLoading={isAnalysisLoading}
                >
                  Analyze Repository
                </Button>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel p={4}>
            <Box textAlign="center" py={10}>
              <Icon as={FiAlertCircle} boxSize="40px" color="gray.400" />
              <Heading size="md" mt={4} mb={2}>Issue Summary</Heading>
              <Text color="gray.500">
                {analyses.length > 0 
                  ? 'Select an analysis to view detailed issues.' 
                  : 'Run an analysis to identify code issues.'}
              </Text>
            </Box>
          </TabPanel>
          
          <TabPanel p={4}>
            <Box textAlign="center" py={10}>
              <Icon as={FiFileText} boxSize="40px" color="gray.400" />
              <Heading size="md" mt={4} mb={2}>File Browser</Heading>
              <Text color="gray.500">
                The file browser will be available in a future update.
              </Text>
            </Box>
          </TabPanel>
          
          <TabPanel p={4}>
            <Box textAlign="center" py={10}>
              <Icon as={FiClock} boxSize="40px" color="gray.400" />
              <Heading size="md" mt={4} mb={2}>Activity Timeline</Heading>
              <Text color="gray.500">
                Activity tracking will be available in a future update.
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default RepositoryDetail;