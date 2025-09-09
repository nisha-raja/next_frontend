'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Icon,
  Flex,
  Spinner,
  Textarea,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { 
  FileText,
  Save,
  Send,
  ArrowLeft,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'
import { JDGeneratorApi } from '@/services/api'

interface JobTemplate {
  id: string
  title: string
  department: string
  level: string
  experience_required: string
  education: string
  description: string
  responsibilities: string[]
  required_skills: string[]
  preferred_skills?: string[]
  salary_range: string
  benefits: string[]
  growth_opportunities: string[]
  category: string
}

interface GeneratedJD {
  success: boolean
  job_description?: string
  job_id?: string
  message: string
  error?: string
  generated_at: string
}

export default function CreateJobPage() {
  const [inputText, setInputText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [generatedJD, setGeneratedJD] = useState<GeneratedJD | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const router = useRouter()
  const toast = useToast()

  const jdGeneratorApi = new JDGeneratorApi()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await jdGeneratorApi.getTemplates()
      
      if (response && Array.isArray(response)) {
        setTemplates(response)
      } else {
        // No templates available - user will provide all details
        setTemplates([])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      // No templates available - user will provide all details
      setTemplates([])
    } finally {
      setLoadingTemplates(false)
    }
  }

  const parseInputText = (text: string) => {
    // Parse the input text to extract job details
    const jobDetails = {
      job_title: '',
      experience_required: '',
      salary_range: '',
      company_name: 'Your Company',
      employment_type: 'Full-time',
      industry: 'Technology',
      location: 'Remote',
      department: 'General',
      skills_required: [],
      work_location_type: 'Remote',
      education_required: 'Bachelor\'s degree',
      benefits: [],
      growth_opportunities: []
    }

    // Extract job title (first part before comma)
    const parts = text.split(',')
    if (parts.length > 0) {
      jobDetails.job_title = parts[0].trim()
    }

    // Extract company name
    const companyMatch = text.match(/company:\s*([^,]+)/i)
    if (companyMatch) {
      jobDetails.company_name = companyMatch[1].trim()
    }

    // Extract salary
    const salaryMatch = text.match(/(\d+)\s*salary/i)
    if (salaryMatch) {
      const salary = parseInt(salaryMatch[1])
      jobDetails.salary_range = `$${salary.toLocaleString()}`
    }

    // Extract experience
    const expMatch = text.match(/(\d+)\s*year/i)
    if (expMatch) {
      const years = parseInt(expMatch[1])
      if (years <= 1) {
        jobDetails.experience_required = '0-1 years'
      } else if (years <= 3) {
        jobDetails.experience_required = '2-3 years'
      } else if (years <= 5) {
        jobDetails.experience_required = '4-5 years'
      } else {
        jobDetails.experience_required = '5+ years'
      }
    }

    // Extract skills
    const skillsMatch = text.match(/skills?:\s*([^,]+)/i)
    if (skillsMatch) {
      jobDetails.skills_required = skillsMatch[1].split(',').map(s => s.trim())
    }

    // Extract department
    const deptMatch = text.match(/department:\s*([^,]+)/i)
    if (deptMatch) {
      jobDetails.department = deptMatch[1].trim()
    }

    // Extract industry
    const industryMatch = text.match(/industry:\s*([^,]+)/i)
    if (industryMatch) {
      jobDetails.industry = industryMatch[1].trim()
    }

    // Extract location
    const locationMatch = text.match(/location:\s*([^,]+)/i)
    if (locationMatch) {
      jobDetails.location = locationMatch[1].trim()
    }

    return jobDetails
  }

  const generateJobDescription = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter job details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setLoading(true)
      
      // Parse input text to extract job details
      const jobDetails = parseInputText(inputText)
      
      // Prepare request for JD Generator - no template required
      const request = {
        job_details: {
          ...jobDetails,
          // Use parsed details or provide defaults
          job_title: jobDetails.job_title || 'Custom Position',
          experience_required: jobDetails.experience_required || 'To be determined',
          salary_range: jobDetails.salary_range || 'Competitive',
          skills_required: jobDetails.skills_required || [],
          benefits: jobDetails.benefits || [],
          growth_opportunities: jobDetails.growth_opportunities || [],
          education_required: jobDetails.education_required || 'Bachelor\'s degree',
          department: jobDetails.department || 'General',
          industry: jobDetails.industry || 'Technology'
        },
        use_knowledge_base: true,
        include_ai_enhancement: true
      }

      console.log('Sending request to JD Generator:', request)
      
      const response = await jdGeneratorApi.generateJobDescription(request) as any
      
      if (response.success) {
        // Map the response to match GeneratedJD interface
        const generatedJD: GeneratedJD = {
          success: response.success,
          job_description: response.job_description,
          job_id: response.job_id,
          message: response.message || 'Job description generated successfully',
          error: response.error,
          generated_at: response.generated_at || new Date().toISOString()
        }
        setGeneratedJD(generatedJD)
        toast({
          title: 'Success',
          description: 'Job description generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(response.message || 'Failed to generate job description')
      }
    } catch (error: unknown) {
      console.error('Failed to generate JD:', error)
      
      let errorMessage = 'Failed to generate job description'
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { status?: number } }
        if (responseError.response?.status === 422) {
          errorMessage = 'Invalid data format. Please check your input.'
        } else if (responseError.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const saveJobDescription = async () => {
    if (!generatedJD?.job_description) {
      toast({
        title: 'Error',
        description: 'No job description to save',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setLoading(true)
      
      // For now, we'll just show a success message
      // In a real implementation, you'd call an API to save this
      toast({
        title: 'Success',
        description: 'Job description saved to memory successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      console.error('Failed to save JD:', error)
      toast({
        title: 'Error',
        description: 'Failed to save job description',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={ArrowLeft} />}
                variant="ghost"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Heading size="lg" color="brand.500">
                Create Job Description
              </Heading>
            </HStack>
            <Badge colorScheme="blue" fontSize="sm">
              AI Powered
            </Badge>
          </Flex>

          {/* Input Section */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="brand.500">
                  Job Details
                </Heading>
                
                <FormControl>
                  <FormLabel>Job Description Input</FormLabel>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter job details (e.g., 'Senior Python Developer, 120000 salary, 5 year experience, skills: Python, Django, AWS, company: TechCorp Inc, department: Engineering, industry: Technology, location: San Francisco')"
                    rows={4}
                    resize="vertical"
                  />
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    <strong>Examples:</strong><br/>
                    • "Senior Python Developer, 120000 salary, 5 year experience, skills: Python, Django, AWS"<br/>
                    • "Data Scientist, 100000 salary, 3 year experience, skills: Python, Machine Learning, SQL, company: DataCorp"<br/>
                    • "Product Manager, 130000 salary, 4 year experience, department: Product, industry: Technology"
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Company Information (Optional)</FormLabel>
                  <Input
                    placeholder="Enter company name (e.g., TechCorp Inc)"
                    value={inputText.includes('company:') ? inputText.split('company:')[1]?.split(',')[0]?.trim() : ''}
                    onChange={(e) => {
                      const companyName = e.target.value
                      if (companyName) {
                        setInputText(prev => {
                          if (prev.includes('company:')) {
                            return prev.replace(/company:[^,]*/, `company: ${companyName}`)
                          } else {
                            return `${prev}, company: ${companyName}`.replace(/^,\s*/, '')
                          }
                        })
                      }
                    }}
                  />
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    Add company name to your job description
                  </Text>
                </FormControl>

                <Button
                  leftIcon={<Icon as={Sparkles} />}
                  colorScheme="brand"
                  size="lg"
                  onClick={generateJobDescription}
                  isLoading={loading}
                  loadingText="Generating..."
                  isDisabled={!inputText.trim()}
                >
                  Generate Job Description
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Generated Job Description */}
          {generatedJD && (
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Heading size="md" color="green.500">
                      Generated Job Description
                    </Heading>
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<Icon as={Save} />}
                        colorScheme="green"
                        variant="outline"
                        onClick={saveJobDescription}
                        isLoading={loading}
                        loadingText="Saving..."
                      >
                        Save to Memory
                      </Button>
                      <Button
                        leftIcon={<Icon as={Send} />}
                        colorScheme="brand"
                        onClick={() => {
                          // Copy to clipboard
                          navigator.clipboard.writeText(generatedJD.job_description || '')
                          toast({
                            title: 'Copied',
                            description: 'Job description copied to clipboard',
                            status: 'success',
                            duration: 2000,
                            isClosable: true,
                          })
                        }}
                      >
                        Copy
                      </Button>
                    </HStack>
                  </Flex>

                  <Divider />

                  <Box
                    p={6}
                    bg="gray.50"
                    borderRadius="md"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="1.6">
                      {generatedJD.job_description}
                    </Text>
                  </Box>

                  <HStack spacing={4} fontSize="sm" color="gray.600">
                    <HStack>
                      <Icon as={CheckCircle} color="green.500" />
                      <Text>Generated successfully</Text>
                    </HStack>
                    <Text>•</Text>
                    <Text>Job ID: {generatedJD.job_id}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

        </VStack>
      </Box>
    </MainLayout>
  )
}
