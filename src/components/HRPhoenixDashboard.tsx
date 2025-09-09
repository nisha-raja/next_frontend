/**
 * HR Phoenix AI System Dashboard
 * Unified interface for all HR agents with real-time data integration
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Progress,
    Alert,
    AlertIcon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast,
    Spinner,
    Flex,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
} from '@chakra-ui/react';
import {
    FiUsers,
    FiFileText,
    FiCalendar,
    FiActivity,
    FiDatabase,
    FiCpu,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiTrendingUp,
} from 'react-icons/fi';

import {
    useHRPhoenixSystem,
    useRootAgent,
    useJDGenerator,
    useResumeAnalyzer,
    useInterviewScheduler,
} from '../hooks/useHRPhoenix';

// Dashboard Stats Component
const DashboardStats: React.FC = () => {
    const { data: healthData, isLoading, checkAllServicesHealth } = useHRPhoenixSystem({
        autoFetch: true,
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    useEffect(() => {
        checkAllServicesHealth();
    }, [checkAllServicesHealth]);

    const getServiceStatus = (service: string) => {
        if (!healthData) return 'unknown';
        return healthData[service as keyof typeof healthData] || 'unknown';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'green';
            case 'degraded':
                return 'yellow';
            case 'unhealthy':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return FiCheckCircle;
            case 'degraded':
                return FiAlertCircle;
            case 'unhealthy':
                return FiAlertCircle;
            default:
                return FiClock;
        }
    };

    if (isLoading) {
        return (
            <Box textAlign="center" py={8}>
                <Spinner size="xl" />
                <Text mt={4}>Checking system health...</Text>
            </Box>
        );
    }

    return (
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>Root Agent</StatLabel>
                        <StatNumber>
                            <Badge colorScheme={getStatusColor(getServiceStatus('root_agent'))}>
                                {getServiceStatus('root_agent')}
                            </Badge>
                        </StatNumber>
                        <StatHelpText>
                            <Icon as={getStatusIcon(getServiceStatus('root_agent'))} mr={2} />
                            Central orchestrator
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>JD Generator</StatLabel>
                        <StatNumber>
                            <Badge colorScheme={getStatusColor(getServiceStatus('jd_generator'))}>
                                {getServiceStatus('jd_generator')}
                            </Badge>
                        </StatNumber>
                        <StatHelpText>
                            <Icon as={getStatusIcon(getServiceStatus('jd_generator'))} mr={2} />
                            Job description creation
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>Resume Analyzer</StatLabel>
                        <StatNumber>
                            <Badge colorScheme={getStatusColor(getServiceStatus('resume_analyzer'))}>
                                {getServiceStatus('resume_analyzer')}
                            </Badge>
                        </StatNumber>
                        <StatHelpText>
                            <Icon as={getStatusIcon(getServiceStatus('resume_analyzer'))} mr={2} />
                            Resume analysis & scoring
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Stat>
                        <StatLabel>Interview Scheduler</StatLabel>
                        <StatNumber>
                            <Badge colorScheme={getStatusColor(getServiceStatus('interview_scheduler'))}>
                                {getServiceStatus('interview_scheduler')}
                            </Badge>
                        </StatNumber>
                        <StatHelpText>
                            <Icon as={getStatusIcon(getServiceStatus('interview_scheduler'))} mr={2} />
                            Interview scheduling
                        </StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
        </Grid>
    );
};

// Root Agent Panel
const RootAgentPanel: React.FC = () => {
    const [query, setQuery] = useState('');
    const [context, setContext] = useState('');
    const toast = useToast();

    const {
        data: workflowHistory,
        isLoading: historyLoading,
        getWorkflowHistory,
        processQuery,
    } = useRootAgent();

    const handleProcessQuery = async () => {
        if (!query.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a query',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const result = await processQuery(query, context ? JSON.parse(context) : undefined);
            toast({
                title: 'Success',
                description: 'Query processed successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            console.log('Query result:', result);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to process query',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        getWorkflowHistory(10);
    }, [getWorkflowHistory]);

    return (
        <VStack spacing={6} align="stretch">
            <Card>
                <CardHeader>
                    <Heading size="md">Natural Language Query</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text mb={2}>Query:</Text>
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Enter your query (e.g., 'show me top 5 candidates for Java developer')"
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Context (optional JSON):</Text>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder='{"filters": {"skills": ["Java"], "experience": "3+"}}'
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Button
                            colorScheme="blue"
                            onClick={handleProcessQuery}
                            isLoading={false}
                            loadingText="Processing..."
                        >
                            Process Query
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Heading size="md">Recent Workflows</Heading>
                </CardHeader>
                <CardBody>
                    {historyLoading ? (
                        <Box textAlign="center" py={4}>
                            <Spinner />
                            <Text mt={2}>Loading workflow history...</Text>
                        </Box>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {workflowHistory?.data?.map((workflow: any, index: number) => (
                                <Box
                                    key={workflow.id || index}
                                    p={3}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                >
                                    <Text fontWeight="bold">{workflow.query || 'Unknown query'}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Status: {workflow.status}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Created: {new Date(workflow.created_at).toLocaleString()}
                                    </Text>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </CardBody>
            </Card>
        </VStack>
    );
};

// JD Generator Panel
const JDGeneratorPanel: React.FC = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [requirements, setRequirements] = useState('');
    const toast = useToast();

    const {
        data: jobDescriptions,
        isLoading,
        generateJobDescription,
        getJobDescriptions,
    } = useJDGenerator({ autoFetch: true });

    const handleGenerateJD = async () => {
        if (!jobTitle.trim() || !requirements.trim()) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const result = await generateJobDescription({
                job_title: jobTitle,
                requirements,
                company_name: 'Your Company',
                department: 'Engineering',
                experience_level: 'Mid-level',
            });
            toast({
                title: 'Success',
                description: 'Job description generated successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            console.log('Generated JD:', result);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate job description',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Card>
                <CardHeader>
                    <Heading size="md">Generate Job Description</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text mb={2}>Job Title:</Text>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Requirements:</Text>
                            <textarea
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="Describe the role, skills, and experience required..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Button
                            colorScheme="green"
                            onClick={handleGenerateJD}
                            isLoading={false}
                            loadingText="Generating..."
                        >
                            Generate Job Description
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Heading size="md">Recent Job Descriptions</Heading>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <Box textAlign="center" py={4}>
                            <Spinner />
                            <Text mt={2}>Loading job descriptions...</Text>
                        </Box>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {jobDescriptions?.data?.map((jd: any, index: number) => (
                                <Box
                                    key={jd.id || index}
                                    p={3}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                >
                                    <Text fontWeight="bold">{jd.job_title}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Company: {jd.company_name}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Created: {new Date(jd.created_at).toLocaleString()}
                                    </Text>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </CardBody>
            </Card>
        </VStack>
    );
};

// Resume Analyzer Panel
const ResumeAnalyzerPanel: React.FC = () => {
    const [resumeContent, setResumeContent] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const toast = useToast();

    const {
        data: candidates,
        isLoading,
        analyzeResume,
        getCandidates,
    } = useResumeAnalyzer({ autoFetch: true });

    const handleAnalyzeResume = async () => {
        if (!resumeContent.trim() || !jobDescription.trim() || !candidateName.trim()) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const result = await analyzeResume(
                {
                    content: resumeContent,
                    candidate_name: candidateName,
                    candidate_email: candidateEmail,
                    file_name: `${candidateName}_resume.txt`,
                },
                {
                    content: jobDescription,
                    job_title: 'Software Engineer',
                    company_name: 'Your Company',
                }
            );
            toast({
                title: 'Success',
                description: 'Resume analyzed successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            console.log('Analysis result:', result);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to analyze resume',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Card>
                <CardHeader>
                    <Heading size="md">Analyze Resume</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text mb={2}>Candidate Name:</Text>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="Enter candidate name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Candidate Email:</Text>
                            <input
                                type="email"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                placeholder="Enter candidate email"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Resume Content:</Text>
                            <textarea
                                value={resumeContent}
                                onChange={(e) => setResumeContent(e.target.value)}
                                placeholder="Paste resume content here..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Job Description:</Text>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description here..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Button
                            colorScheme="purple"
                            onClick={handleAnalyzeResume}
                            isLoading={false}
                            loadingText="Analyzing..."
                        >
                            Analyze Resume
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Heading size="md">Candidate Profiles</Heading>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <Box textAlign="center" py={4}>
                            <Spinner />
                            <Text mt={2}>Loading candidates...</Text>
                        </Box>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {candidates?.data?.map((candidate: any, index: number) => (
                                <Box
                                    key={candidate.id || index}
                                    p={3}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                >
                                    <Text fontWeight="bold">{candidate.full_name}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Email: {candidate.email}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Experience: {candidate.years_experience} years
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Status: {candidate.status}
                                    </Text>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </CardBody>
            </Card>
        </VStack>
    );
};

// Interview Scheduler Panel
const InterviewSchedulerPanel: React.FC = () => {
    const [candidateId, setCandidateId] = useState('');
    const [interviewerId, setInterviewerId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [interviewType, setInterviewType] = useState('technical');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const toast = useToast();

    const {
        data: interviews,
        isLoading,
        scheduleInterview,
        getInterviews,
    } = useInterviewScheduler({ autoFetch: true });

    const handleScheduleInterview = async () => {
        if (!candidateId.trim() || !interviewerId.trim() || !jobTitle.trim()) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const result = await scheduleInterview({
                candidate_id: candidateId,
                interviewer_id: interviewerId,
                job_title: jobTitle,
                interview_type: interviewType,
                preferred_dates: preferredDate ? [preferredDate] : [],
                preferred_times: preferredTime ? [preferredTime] : [],
                duration: 60,
                location: 'Virtual',
            });
            toast({
                title: 'Success',
                description: 'Interview scheduled successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            console.log('Scheduled interview:', result);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to schedule interview',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Card>
                <CardHeader>
                    <Heading size="md">Schedule Interview</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text mb={2}>Candidate ID:</Text>
                            <input
                                type="text"
                                value={candidateId}
                                onChange={(e) => setCandidateId(e.target.value)}
                                placeholder="Enter candidate ID"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Interviewer ID:</Text>
                            <input
                                type="text"
                                value={interviewerId}
                                onChange={(e) => setInterviewerId(e.target.value)}
                                placeholder="Enter interviewer ID"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Job Title:</Text>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Enter job title"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Interview Type:</Text>
                            <select
                                value={interviewType}
                                onChange={(e) => setInterviewType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                                <option value="phone_screen">Phone Screen</option>
                                <option value="final_round">Final Round</option>
                                <option value="executive">Executive</option>
                            </select>
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Preferred Date:</Text>
                            <input
                                type="date"
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Preferred Time:</Text>
                            <input
                                type="time"
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                        <Button
                            colorScheme="orange"
                            onClick={handleScheduleInterview}
                            isLoading={false}
                            loadingText="Scheduling..."
                        >
                            Schedule Interview
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Heading size="md">Scheduled Interviews</Heading>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <Box textAlign="center" py={4}>
                            <Spinner />
                            <Text mt={2}>Loading interviews...</Text>
                        </Box>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {interviews?.data?.map((interview: any, index: number) => (
                                <Box
                                    key={interview.interview_id || index}
                                    p={3}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                >
                                    <Text fontWeight="bold">
                                        Interview #{interview.interview_id || index + 1}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Candidate: {interview.candidate_id}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Interviewer: {interview.interviewer_id}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Date: {new Date(interview.scheduled_date).toLocaleString()}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Status: {interview.status}
                                    </Text>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </CardBody>
            </Card>
        </VStack>
    );
};

// Main Dashboard Component
const HRPhoenixDashboard: React.FC = () => {
    const toast = useToast();

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Box textAlign="center">
                    <Heading size="2xl" mb={4} color="blue.600">
                        🚀  AI System
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        Intelligent HR automation powered by AI agents
                    </Text>
                </Box>

                {/* System Health Dashboard */}
                <Card>
                    <CardHeader>
                        <Heading size="lg">
                            <Icon as={FiActivity} mr={3} />
                            System Health Dashboard
                        </Heading>
                    </CardHeader>
                    <CardBody>
                        <DashboardStats />
                    </CardBody>
                </Card>

                {/* Main Interface */}
                <Card>
                    <CardHeader>
                        <Heading size="lg">
                            <Icon as={FiCpu} mr={3} />
                            Agent Operations
                        </Heading>
                    </CardHeader>
                    <CardBody>
                        <Tabs variant="enclosed">
                            <TabList>
                                <Tab>
                                    <Icon as={FiActivity} mr={2} />
                                    Root Agent
                                </Tab>
                                <Tab>
                                    <Icon as={FiFileText} mr={2} />
                                    JD Generator
                                </Tab>
                                <Tab>
                                    <Icon as={FiUsers} mr={2} />
                                    Resume Analyzer
                                </Tab>
                                <Tab>
                                    <Icon as={FiCalendar} mr={2} />
                                    Interview Scheduler
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    <RootAgentPanel />
                                </TabPanel>
                                <TabPanel>
                                    <JDGeneratorPanel />
                                </TabPanel>
                                <TabPanel>
                                    <ResumeAnalyzerPanel />
                                </TabPanel>
                                <TabPanel>
                                    <InterviewSchedulerPanel />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>

                {/* Footer */}
                <Box textAlign="center" py={4} color="gray.500">
                    <Text fontSize="sm">
                        HR Phoenix AI System v2.0.0 | Powered by OpenAI, PostgreSQL, Qdrant, Neo4j, Redis
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default HRPhoenixDashboard;
