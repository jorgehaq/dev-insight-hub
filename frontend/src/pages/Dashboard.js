import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, 
  StatArrow, StatGroup, Progress, useColorModeValue } from '@chakra-ui/react';
import { Card } from '../components/Card';
import { api } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    repositories: 0,
    analyses: 0,
    issuesFound: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, we'll use mock data
        
        // Simulating API responses
        setTimeout(() => {
          setStats({
            repositories: 12,
            analyses: 34,
            issuesFound: 127,
            averageScore: 78,
          });
          
          setRecentAnalyses([
            { id: 1, repositoryName: 'frontend-app', date: '2023-07-01', score: 82, issuesCount: 7 },
            { id: 2, repositoryName: 'api-service', date: '2023-06-29', score: 65, issuesCount: 23 },
            { id: 3, repositoryName: 'util-library', date: '2023-06-28', score: 91, issuesCount: 2 },
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      {loading ? (
        <Progress isIndeterminate />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <Card>
              <Stat>
                <StatLabel>Repositories</StatLabel>
                <StatNumber>{stats.repositories}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  3 new this month
                </StatHelpText>
              </Stat>
            </Card>
            
            <Card>
              <Stat>
                <StatLabel>Total Analyses</StatLabel>
                <StatNumber>{stats.analyses}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8 this week
                </StatHelpText>
              </Stat>
            </Card>
            
            <Card>
              <Stat>
                <StatLabel>Issues Found</StatLabel>
                <StatNumber>{stats.issuesFound}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  12% less than last month
                </StatHelpText>
              </Stat>
            </Card>
            
            <Card>
              <Stat>
                <StatLabel>Average Score</StatLabel>
                <StatNumber>{stats.averageScore}/100</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Improved by 5%
                </StatHelpText>
              </Stat>
            </Card>
          </SimpleGrid>
          
          <Heading size="md" mb={4}>Recent Analyses</Heading>
          <SimpleGrid columns={1} spacing={4}>
            {recentAnalyses.map((analysis) => (
              <Card key={analysis.id}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="sm">{analysis.repositoryName}</Heading>
                    <Text fontSize="sm" color="gray.500">Analyzed on {new Date(analysis.date).toLocaleDateString()}</Text>
                  </Box>
                  <Flex align="center">
                    <Text mr={4} fontWeight="bold">
                      Score: {analysis.score}/100
                    </Text>
                    <Text color={analysis.issuesCount > 10 ? "red.500" : "green.500"}>
                      {analysis.issuesCount} issues
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;