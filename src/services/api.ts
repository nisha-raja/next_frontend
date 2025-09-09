/**
 * API Service Layer for HR Phoenix AI System
 * Integrates with all agent APIs: Root Agent, JD Generator, Resume Analyzer, Interview Scheduler
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_CONFIG = {
  ROOT_AGENT: process.env.NEXT_PUBLIC_ROOT_AGENT_URL || 'http://localhost:8000',
  JD_GENERATOR: process.env.NEXT_PUBLIC_JD_GENERATOR_URL || 'http://localhost:8001',
  RESUME_ANALYZER: process.env.NEXT_PUBLIC_RESUME_ANALYZER_URL || 'http://localhost:8002',
  INTERVIEW_SCHEDULER: process.env.NEXT_PUBLIC_INTERVIEW_SCHEDULER_URL || 'http://localhost:8003',
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Base API Client
class BaseApiClient {
  protected client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  protected async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Root Agent API Client
export class RootAgentApi extends BaseApiClient {
  constructor() {
    super(API_CONFIG.ROOT_AGENT);
  }

  // Health and Status
  async getHealth() {
    return this.get('/health');
  }

  async getStatus() {
    return this.get('/status');
  }

  async getDeploymentStatus() {
    return this.get('/deployment-status');
  }

  // Query Processing
  async processQuery(query: string, context?: any) {
    return this.post('/process-query', {
      query_text: query,
      context,
    });
  }

  // Workflow Management
  async getActiveWorkflows() {
    return this.get('/workflows/active');
  }

  async getWorkflowHistory(limit = 10) {
    return this.get('/workflows/history', { limit });
  }

  async getWorkflowDetails(workflowId: string) {
    return this.get(`/workflows/${workflowId}`);
  }

  // Agent Management
  async getAgentsStatus() {
    return this.get('/agents/status');
  }

  async testAgentConnection(agentName: string) {
    return this.post(`/agents/${agentName}/test`);
  }

  // Memory Management
  async getMemoryStats() {
    return this.get('/memory/stats');
  }

  async clearMemory() {
    return this.post('/memory/clear');
  }

  // Configuration
  async getConfig() {
    return this.get('/config');
  }
}

// JD Generator API Client
export class JDGeneratorApi extends BaseApiClient {
  constructor() {
    super(API_CONFIG.JD_GENERATOR);
  }

  // Health and Status
  async getHealth() {
    return this.get('/health');
  }

  async getStatus() {
    return this.get('/status');
  }

  // Job Description Generation
  async generateJobDescription(request: any) {
    return this.post('/generate', request);
  }

  async generateJobDescriptionAdvanced(request: any) {
    return this.post('/generate/advanced', request);
  }

  async generateJobDescriptionRAG(request: any) {
    return this.post('/generate/rag', request);
  }

  // Job Description Management
  async getJobDescriptions(params?: any) {
    return this.get('/job-descriptions', params);
  }

  async getJobDescriptionById(id: string) {
    return this.get(`/job-descriptions/${id}`);
  }

  async updateJobDescription(id: string, updates: any) {
    return this.put(`/job-descriptions/${id}`, updates);
  }

  async deleteJobDescription(id: string) {
    return this.delete(`/job-descriptions/${id}`);
  }

  // Templates and Knowledge
  async getTemplates() {
    return this.get('/templates');
  }

  async getTemplateById(id: string) {
    return this.get(`/templates/${id}`);
  }

  async createTemplate(template: any) {
    return this.post('/templates', template);
  }

  async updateTemplate(id: string, template: any) {
    return this.put(`/templates/${id}`, template);
  }

  async deleteTemplate(id: string) {
    return this.delete(`/templates/${id}`);
  }

  // Knowledge Base
  async getKnowledgeBase() {
    return this.get('/knowledge-base');
  }

  async addKnowledgeItem(item: any) {
    return this.post('/knowledge-base', item);
  }

  async updateKnowledgeItem(id: string, item: any) {
    return this.put(`/knowledge-base/${id}`, item);
  }

  async deleteKnowledgeItem(id: string) {
    return this.delete(`/knowledge-base/${id}`);
  }

  // Validation and Analysis
  async validateJobDescription(content: string) {
    return this.post('/validate', { content });
  }

  async analyzeJobDescription(id: string) {
    return this.post(`/job-descriptions/${id}/analyze`);
  }

  // File Operations
  async uploadJobDescription(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return this.upload('/upload', formData);
  }

  async exportJobDescription(id: string, format: string) {
    return this.get(`/job-descriptions/${id}/export`, { format });
  }
}

// Resume Analyzer API Client
export class ResumeAnalyzerApi extends BaseApiClient {
  constructor() {
    super(API_CONFIG.RESUME_ANALYZER);
  }

  // Health and Status
  async getHealth() {
    return this.get('/health');
  }

  async getStatus() {
    return this.get('/status');
  }

  // Resume Analysis
  async analyzeResume(resumeData: any, jobDescriptionData: any) {
    return this.post('/analyze', {
      resume_data: resumeData,
      job_description_data: jobDescriptionData,
    });
  }

  async analyzeResumeBatch(batchRequest: any) {
    return this.post('/analyze/batch', batchRequest);
  }

  async analyzeResumeUpload(
    resumeFile: File,
    jobDescriptionFile: File,
    metadata?: any
  ) {
    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    formData.append('job_description_file', jobDescriptionFile);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }
    return this.upload('/analyze/upload', formData);
  }

  // Resume Management
  async getResumes(params?: any) {
    return this.get('/resumes', params);
  }

  async getResumeById(id: string) {
    return this.get(`/resumes/${id}`);
  }

  async getResumeAnalysis(id: string) {
    return this.get(`/resumes/${id}/analysis`);
  }

  // Vector Search
  async searchSimilarResumes(query: string, limit = 10, threshold = 0.7) {
    return this.post('/search/similar', { query, limit, threshold });
  }

  async searchBySkills(skills: string[], limit = 20, minScore = 0.6) {
    return this.post('/search/skills', { skills, limit, min_score: minScore });
  }

  // Analysis Management
  async getAnalysisHistory(params?: any) {
    return this.get('/analysis/history', params);
  }

  async deleteAnalysis(id: string) {
    return this.delete(`/analysis/${id}`);
  }

  // Candidate Management
  async getCandidates(params?: any) {
    return this.get('/candidates', params);
  }

  async getCandidateById(id: string) {
    return this.get(`/candidates/${id}`);
  }

  // Database Management
  async getDatabaseStatus() {
    return this.get('/databases/status');
  }

  async refreshDatabaseConnections() {
    return this.post('/databases/refresh');
  }

  // Memory Management
  async getMemoryStats() {
    return this.get('/memory/stats');
  }

  async clearMemory() {
    return this.post('/memory/clear');
  }

  // Event Management
  async getRecentEvents(limit = 20) {
    return this.get('/events/recent', { limit });
  }

  async publishEvent(eventData: any) {
    return this.post('/events/publish', eventData);
  }

  // Configuration
  async getConfig() {
    return this.get('/config');
  }
}

// Interview Scheduler API Client
export class InterviewSchedulerApi extends BaseApiClient {
  constructor() {
    super(API_CONFIG.INTERVIEW_SCHEDULER);
  }

  // Health and Status
  async getHealth() {
    return this.get('/health');
  }

  async getStatus() {
    return this.get('/status');
  }

  // Interview Scheduling
  async scheduleInterview(request: any) {
    return this.post('/schedule', request);
  }

  async scheduleInterviewsBatch(batchRequest: any) {
    return this.post('/schedule/batch', batchRequest);
  }

  async optimizeSchedule(
    candidateIds: string[],
    interviewerIds: string[],
    dateRange: any,
    preferences?: any
  ) {
    return this.post('/schedule/optimize', {
      candidate_ids: candidateIds,
      interviewer_ids: interviewerIds,
      date_range: dateRange,
      preferences,
    });
  }

  // Interview Management
  async getInterviews(params?: any) {
    return this.get('/interviews', params);
  }

  async getInterviewById(id: string) {
    return this.get(`/interviews/${id}`);
  }

  async updateInterview(id: string, updates: any) {
    return this.put(`/interviews/${id}`, updates);
  }

  async cancelInterview(id: string) {
    return this.delete(`/interviews/${id}`);
  }

  async rescheduleInterview(id: string, newDate: string, newTime: string, reason?: string) {
    return this.post(`/interviews/${id}/reschedule`, {
      new_date: newDate,
      new_time: newTime,
      reason,
    });
  }

  // Availability Management
  async getCandidateAvailability(candidateId: string, params?: any) {
    return this.get(`/availability/candidates/${candidateId}`, params);
  }

  async setCandidateAvailability(candidateId: string, availability: any) {
    return this.post(`/availability/candidates/${candidateId}`, availability);
  }

  async getInterviewerAvailability(interviewerId: string, params?: any) {
    return this.get(`/availability/interviewers/${interviewerId}`, params);
  }

  async setInterviewerAvailability(interviewerId: string, availability: any) {
    return this.post(`/availability/interviewers/${interviewerId}`, availability);
  }

  // Email and Notifications
  async getEmailTemplates() {
    return this.get('/templates/email');
  }

  async createEmailTemplate(template: any) {
    return this.post('/templates/email', template);
  }

  async sendNotification(interviewId: string, notificationType: string, recipients: string[]) {
    return this.post('/notifications/send', {
      interview_id: interviewId,
      notification_type: notificationType,
      recipients,
    });
  }

  // Calendar Integration
  async syncCalendar(calendarType: string, credentials: any) {
    return this.post('/calendar/sync', { calendar_type: calendarType, credentials });
  }

  async getCalendarEvents(calendarType: string, dateFrom: string, dateTo: string) {
    return this.get('/calendar/events', {
      calendar_type: calendarType,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  // Reporting and Analytics
  async getSchedulingReport(dateFrom: string, dateTo: string, reportType = 'summary') {
    return this.get('/reports/scheduling', {
      date_from: dateFrom,
      date_to: dateTo,
      report_type: reportType,
    });
  }

  async getSchedulingConflicts(dateFrom: string, dateTo: string) {
    return this.get('/reports/conflicts', {
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  // Database Management
  async getDatabaseStatus() {
    return this.get('/databases/status');
  }

  async refreshDatabaseConnections() {
    return this.post('/databases/refresh');
  }

  // Memory Management
  async getMemoryStats() {
    return this.get('/memory/stats');
  }

  async clearMemory() {
    return this.post('/memory/clear');
  }

  // Event Management
  async getRecentEvents(limit = 20) {
    return this.get('/events/recent', { limit });
  }

  async publishEvent(eventData: any) {
    return this.post('/events/publish', eventData);
  }

  // Configuration
  async getConfig() {
    return this.get('/config');
  }
}

// Unified API Service
export class HRPhoenixApi {
  public rootAgent: RootAgentApi;
  public jdGenerator: JDGeneratorApi;
  public resumeAnalyzer: ResumeAnalyzerApi;
  public interviewScheduler: InterviewSchedulerApi;

  constructor() {
    this.rootAgent = new RootAgentApi();
    this.jdGenerator = new JDGeneratorApi();
    this.resumeAnalyzer = new ResumeAnalyzerApi();
    this.interviewScheduler = new InterviewSchedulerApi();
  }

  // System-wide health check
  async checkAllServicesHealth() {
    try {
      const [root, jd, resume, interview] = await Promise.allSettled([
        this.rootAgent.getHealth(),
        this.jdGenerator.getHealth(),
        this.resumeAnalyzer.getHealth(),
        this.interviewScheduler.getHealth(),
      ]);

      return {
        root_agent: root.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        jd_generator: jd.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        resume_analyzer: resume.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        interview_scheduler: interview.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        overall: [root, jd, resume, interview].every(r => r.status === 'fulfilled') ? 'healthy' : 'degraded',
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        root_agent: 'unknown',
        jd_generator: 'unknown',
        resume_analyzer: 'unknown',
        interview_scheduler: 'unknown',
        overall: 'unhealthy',
      };
    }
  }

  // Get all service configurations
  async getAllConfigs() {
    try {
      const [root, jd, resume, interview] = await Promise.allSettled([
        this.rootAgent.getConfig(),
        this.jdGenerator.getConfig(),
        this.resumeAnalyzer.getConfig(),
        this.interviewScheduler.getConfig(),
      ]);

      return {
        root_agent: root.status === 'fulfilled' ? root.value : null,
        jd_generator: jd.status === 'fulfilled' ? jd.value : null,
        resume_analyzer: resume.status === 'fulfilled' ? resume.value : null,
        interview_scheduler: interview.status === 'fulfilled' ? interview.value : null,
      };
    } catch (error) {
      console.error('Config retrieval failed:', error);
      return {};
    }
  }
}

// Export singleton instance
export const hrPhoenixApi = new HRPhoenixApi();

// Export individual clients for direct use
export const rootAgentApi = hrPhoenixApi.rootAgent;
export const jdGeneratorApi = hrPhoenixApi.jdGenerator;
export const resumeAnalyzerApi = hrPhoenixApi.resumeAnalyzer;
export const interviewSchedulerApi = hrPhoenixApi.interviewScheduler;
