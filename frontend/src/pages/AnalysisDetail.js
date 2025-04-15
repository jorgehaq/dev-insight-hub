import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  HStack,
  VStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Link,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Progress,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { 
  FiGithub, 
  FiFileText, 
  FiAlertCircle, 
  FiBarChart2, 
  FiCpu, 
  FiCodesandbox,
  FiDownload,
  FiRefreshCw,
  FiClipboard,
  FiCheckCircle
} from 'react-icons/fi';
import { Card } from '../components/Card';
import { api } from '../api';

const AnalysisDetail = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [repository, setRepository] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisJson, setAnalysisJson] = useState('');
  const { hasCopied, onCopy } = useClipboard(analysisJson);
  const toast = useToast();
  
  useEffect(() => {
    fetchAnalysisData();
  }, [id]);
  
  const fetchAnalysisData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch analysis details
      const analysisResponse = await api.get(`/analyses/${id}`);
      setAnalysis(analysisResponse.data);
      setAnalysisJson(JSON.stringify(analysisResponse.data, null, 2));
      
      // If we have repository_id, fetch repository details
      if (analysisResponse.data.repository_id) {
        const repoResponse = await api.get(`/repositories/${analysisResponse.data.repository_id}`);
        setRepository(repoResponse.data);
      }
    } catch (err) {
      setError('Failed to load analysis data. Please try again later.');
      console.error('Error fetching analysis data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyJson = () => {
    onCopy();
    toast({
      title: 'JSON copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  if (isLoading) {
    return (
      <Box>
        <Skeleton height="40px" width="300px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
          <Skeleton height="100px" />
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
          Error Loading Analysis
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
        <Button 
          mt={4} 
          colorScheme="red" 
          onClick={fetchAnalysisData}
        >
          Try Again
        </Button>
      </Alert>
    );
  }
  
  if (!analysis) {
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
          Analysis Not Found
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          The analysis you're looking for doesn't exist or you don't have access to it.
        </AlertDescription>
        <Button 
          mt={4} 
          colorScheme="blue" 
          as={RouterLink} 
          to="/analysis"
        >
          Back to Analyses
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap">
        <Box>
          <Heading mb={2}>
            Analysis Details
          </Heading>
          <HStack spacing={2}>
            <Icon as={FiGithub} />
            {repository ? (
              <Link as={RouterLink} to={`/repositories/${repository.id}`} color="blue.500">
                {repository.name}
              </Link>
            ) : (
              <Text>Repository #{analysis.repository_id}</Text>
            )}
          </HStack>
        </Box>
        
        <HStack spacing={2} mt={{ base: 4, md: 0 }}>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            onClick={fetchAnalysisData}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="green"
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(analysisJson);
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", `analysis-${id}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
          >
            Export
          </Button>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card>
          <Stat>
            <StatLabel>Status</StatLabel>
            <StatNumber>
              <Badge 
                colorScheme={
                  analysis.status === 'completed' ? 'green' : 
                  analysis.status === 'pending' ? 'yellow' : 
                  analysis.status === 'error' ? 'red' : 'gray'
                }
                fontSize="lg"
                p={1}
              >
                {analysis.status}
              </Badge>
            </StatNumber>
            <StatHelpText>
              {new Date(analysis.created_at).toLocaleString()}
            </StatHelpText>
          </Stat>
        </Card>
        
        <Card>
          <Stat>
            <StatLabel>Files Analyzed</StatLabel>
            <StatNumber>{analysis.files_analyzed || 0}</StatNumber>
            {analysis.files_with_issues > 0 && (
              <StatHelpText>
                Files with issues: {analysis.files_with_issues}
              </StatHelpText>
            )}
          </Stat>
        </Card>
        
        <Card>
          <Stat>
            <StatLabel>Issues Found</StatLabel>
            <StatNumber>{analysis.total_issues || 0}</StatNumber>
            {analysis.total_issues > 0 && (
              <Progress 
                value={(analysis.files_with_issues / analysis.files_analyzed) * 100} 
                colorScheme={
                  analysis.files_with_issues / analysis.files_analyzed < 0.25 ? "green" :
                  analysis.files_with_issues / analysis.files_analyzed < 0.5 ? "yellow" : "red"
                }
                mt={2}
              />
            )}
          </Stat>
        </Card>
      </SimpleGrid>
      
      {analysis.status === 'pending' ? (
        <Card p={6} textAlign="center">
          <Icon as={FiCpu} boxSize="40px" color="yellow.500" mb={4} />
          <Heading size="md" mb={2}>Analysis in Progress</Heading>
          <Text color="gray.500" mb={4}>
            The analysis is currently being processed. This may take a few moments.
          </Text>
          <Progress isIndeterminate colorScheme="yellow" />
        </Card>
      ) : analysis.status === 'error' ? (
        <Card p={6} textAlign="center" bg="red.50">
          <Icon as={FiAlertCircle} boxSize="40px" color="red.500" mb={4} />
          <Heading size="md" mb={2}>Analysis Failed</Heading>
          <Text color="red.500" mb={4}>
            {analysis.message || 'An unknown error occurred during analysis.'}
          </Text>
          <Button colorScheme="blue" onClick={fetchAnalysisData}>
            Refresh
          </Button>
        </Card>
      ) : (
        <Tabs isLazy colorScheme="blue">
          <TabList>
            <Tab><Icon as={FiBarChart2} mr={2} /> Summary</Tab>
            <Tab><Icon as={FiAlertCircle} mr={2} /> Issues</Tab>
            <Tab><Icon as={FiFileText} mr={2} /> Files</Tab>
            <Tab><Icon as={FiCodesandbox} mr={2} /> Raw Data</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card>
                  <Heading size="md" mb={4}>Quality Overview</Heading>
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between">
                      <Text>Files Analyzed:</Text>
                      <Text fontWeight="bold">{analysis.files_analyzed || 0}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Files with Issues:</Text>
                      <Text fontWeight="bold">{analysis.files_with_issues || 0}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Total Issues:</Text>
                      <Text fontWeight="bold">{analysis.total_issues || 0}</Text>
                    </Flex>
                    {analysis.file_results && analysis.file_results.length > 0 && (
                      <>
                        <Divider />
                        <Flex justify="space-between">
                          <Text>Most Issues:</Text>
                          <Text fontWeight="bold">
                            {analysis.file_results.reduce((max, file) => {
                              return file.issues_count > max.count 
                                ? { file: file.file_path, count: file.issues_count } 
                                : max;
                            }, { file: '', count: 0 }).file}
                          </Text>
                        </Flex>
                      </>
                    )}
                  </VStack>
                </Card>
                
                <Card>
                  <Heading size="md" mb={4}>Issue Types</Heading>
                  {analysis.file_results && analysis.file_results.length > 0 ? (
                    <VStack align="stretch" spacing={3}>
                      {/* This would ideally aggregate issue types from all files */}
                      <Text color="gray.500">Issue type breakdown will be available in a future update.</Text>
                    </VStack>
                  ) : (
                    <Text color="gray.500">No issue type data available.</Text>
                  )}
                </Card>
              </SimpleGrid>
            </TabPanel>
            
            <TabPanel>
              {analysis.file_results && analysis.file_results.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>File</Th>
                        <Th isNumeric>Issues</Th>
                        <Th>Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {analysis.file_results
                        .filter(file => file.issues_count > 0)
                        .map((file, index) => (
                          <Tr key={index}>
                            <Td>
                              <Text fontWeight="medium" noOfLines={1}>{file.file_path}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme={
                                file.issues_count > 10 ? "red" :
                                file.issues_count > 5 ? "yellow" : "green"
                              }>
                                {file.issues_count}
                              </Badge>
                            </Td>
                            <Td>
                              <Button 
                                size="sm" 
                                variant="outline"
                                // This would open a modal with issue details in a real implementation
                              >
                                View Details
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                  
                  {analysis.file_results.filter(file => file.issues_count > 0).length === 0 && (
                    <Box textAlign="center" py={6}>
                      <Icon as={FiCheckCircle} boxSize="40px" color="green.500" mb={2} />
                      <Heading size="md" mb={2}>No Issues Found</Heading>
                      <Text color="gray.500">
                        Great job! No issues were detected in your code.
                      </Text>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <Icon as={FiAlertCircle} boxSize="40px" color="gray.400" mb={2} />
                  <Heading size="md" mb={2}>No Issue Data</Heading>
                  <Text color="gray.500">
                    No issue data is available for this analysis.
                  </Text>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              {analysis.file_results && analysis.file_results.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>File Path</Th>
                        <Th isNumeric>Issues</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {analysis.file_results.map((file, index) => (
                        <Tr key={index}>
                          <Td>
                            <Text fontWeight="medium" noOfLines={1}>{file.file_path}</Text>
                          </Td>
                          <Td isNumeric>
                            {file.error ? (
                              <Badge colorScheme="red">Error</Badge>
                            ) : (
                              <Badge colorScheme={
                                file.issues_count > 10 ? "red" :
                                file.issues_count > 5 ? "yellow" : "green"
                              }>
                                {file.issues_count || 0}
                              </Badge>
                            )}
                          </Td>
                          <Td>
                            {file.error ? (
                              <Text color="red.500" fontSize="sm">{file.error}</Text>
                            ) : (
                              <Badge colorScheme="green">Analyzed</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <Icon as={FiFileText} boxSize="40px" color="gray.400" mb={2} />
                  <Heading size="md" mb={2}>No Files Analyzed</Heading>
                  <Text color="gray.500">
                    No file data is available for this analysis.
                  </Text>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              <Card p={4}>
                <Flex justify="space-between" mb={4} align="center">
                  <Heading size="md">Raw Analysis Data</Heading>
                  <Button
                    leftIcon={<FiClipboard />}
                    onClick={handleCopyJson}
                    colorScheme="blue"
                    size="sm"
                  >
                    {hasCopied ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </Flex>
                <Box 
                  bg="gray.50" 
                  p={4} 
                  borderRadius="md" 
                  overflowX="auto"
                  maxHeight="500px"
                  overflowY="auto"
                >
                  <pre><Code>{analysisJson}</Code></pre>
                </Box>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default AnalysisDetail;