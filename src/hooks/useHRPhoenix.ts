/**
 * React Hooks for HR Phoenix AI System
 * Provides easy access to all agent APIs with state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { hrPhoenixApi, ApiResponse, PaginatedResponse } from '../services/api';

// Types for the hooks
export interface UseHRPhoenixState {
    isLoading: boolean;
    error: string | null;
    data: any;
}

export interface UseHRPhoenixOptions {
    autoFetch?: boolean;
    refreshInterval?: number;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

// Base hook for managing API state
function useApiState<T = any>(initialData?: T) {
    const [state, setState] = useState<UseHRPhoenixState>({
        isLoading: false,
        error: null,
        data: initialData,
    });

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, isLoading: false }));
    }, []);

    const setData = useCallback((data: T) => {
        setState(prev => ({ ...prev, data, error: null, isLoading: false }));
    }, []);

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, data: initialData });
    }, [initialData]);

    return {
        ...state,
        setLoading,
        setError,
        setData,
        reset,
    };
}

// Hook for Root Agent operations
export function useRootAgent(options: UseHRPhoenixOptions = {}) {
    const { autoFetch = false, refreshInterval, onSuccess, onError } = options;
    const intervalRef = useRef<NodeJS.Timeout>();

    const {
        isLoading,
        error,
        data,
        setLoading,
        setError,
        setData,
        reset,
    } = useApiState();

    // Health check
    const checkHealth = useCallback(async () => {
        try {
            setLoading(true);
            const health = await hrPhoenixApi.rootAgent.getHealth();
            setData(health);
            onSuccess?.(health);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Health check failed';
            setError(errorMessage);
            onError?.(errorMessage);
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Process query
    const processQuery = useCallback(async (query: string, context?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.rootAgent.processQuery(query, context);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Query processing failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get deployment status
    const getDeploymentStatus = useCallback(async () => {
        try {
            setLoading(true);
            const status = await hrPhoenixApi.rootAgent.getDeploymentStatus();
            setData(status);
            onSuccess?.(status);
            return status;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get deployment status';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get workflow history
    const getWorkflowHistory = useCallback(async (limit = 10) => {
        try {
            setLoading(true);
            const history = await hrPhoenixApi.rootAgent.getWorkflowHistory(limit);
            setData(history);
            onSuccess?.(history);
            return history;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get workflow history';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Auto-fetch and refresh interval
    useEffect(() => {
        if (autoFetch) {
            checkHealth();
        }

        if (refreshInterval) {
            intervalRef.current = setInterval(checkHealth, refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, refreshInterval, checkHealth]);

    return {
        // State
        isLoading,
        error,
        data,

        // Actions
        checkHealth,
        processQuery,
        getDeploymentStatus,
        getWorkflowHistory,
        reset,
    };
}

// Hook for JD Generator operations
export function useJDGenerator(options: UseHRPhoenixOptions = {}) {
    const { autoFetch = false, refreshInterval, onSuccess, onError } = options;
    const intervalRef = useRef<NodeJS.Timeout>();

    const {
        isLoading,
        error,
        data,
        setLoading,
        setError,
        setData,
        reset,
    } = useApiState();

    // Generate job description
    const generateJobDescription = useCallback(async (request: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.jdGenerator.generateJobDescription(request);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Job description generation failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get job descriptions
    const getJobDescriptions = useCallback(async (params?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.jdGenerator.getJobDescriptions(params);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get job descriptions';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Upload job description
    const uploadJobDescription = useCallback(async (file: File, metadata?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.jdGenerator.uploadJobDescription(file, metadata);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'File upload failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Auto-fetch and refresh interval
    useEffect(() => {
        if (autoFetch) {
            getJobDescriptions();
        }

        if (refreshInterval) {
            intervalRef.current = setInterval(() => getJobDescriptions(), refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, refreshInterval, getJobDescriptions]);

    return {
        // State
        isLoading,
        error,
        data,

        // Actions
        generateJobDescription,
        getJobDescriptions,
        uploadJobDescription,
        reset,
    };
}

// Hook for Resume Analyzer operations
export function useResumeAnalyzer(options: UseHRPhoenixOptions = {}) {
    const { autoFetch = false, refreshInterval, onSuccess, onError } = options;
    const intervalRef = useRef<NodeJS.Timeout>();

    const {
        isLoading,
        error,
        data,
        setLoading,
        setError,
        setData,
        reset,
    } = useApiState();

    // Analyze resume
    const analyzeResume = useCallback(async (resumeData: any, jobDescriptionData: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.resumeAnalyzer.analyzeResume(resumeData, jobDescriptionData);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Resume analysis failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Batch analyze resumes
    const analyzeResumesBatch = useCallback(async (batchRequest: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.resumeAnalyzer.analyzeResumeBatch(batchRequest);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Batch analysis failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Upload and analyze
    const analyzeResumeUpload = useCallback(async (
        resumeFile: File,
        jobDescriptionFile: File,
        metadata?: any
    ) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.resumeAnalyzer.analyzeResumeUpload(
                resumeFile,
                jobDescriptionFile,
                metadata
            );
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload analysis failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Search resumes
    const searchSimilarResumes = useCallback(async (query: string, limit = 10, threshold = 0.7) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.resumeAnalyzer.searchSimilarResumes(query, limit, threshold);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get candidates
    const getCandidates = useCallback(async (params?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.resumeAnalyzer.getCandidates(params);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get candidates';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Auto-fetch and refresh interval
    useEffect(() => {
        if (autoFetch) {
            getCandidates();
        }

        if (refreshInterval) {
            intervalRef.current = setInterval(() => getCandidates(), refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, refreshInterval, getCandidates]);

    return {
        // State
        isLoading,
        error,
        data,

        // Actions
        analyzeResume,
        analyzeResumesBatch,
        analyzeResumeUpload,
        searchSimilarResumes,
        getCandidates,
        reset,
    };
}

// Hook for Interview Scheduler operations
export function useInterviewScheduler(options: UseHRPhoenixOptions = {}) {
    const { autoFetch = false, refreshInterval, onSuccess, onError } = options;
    const intervalRef = useRef<NodeJS.Timeout>();

    const {
        isLoading,
        error,
        data,
        setLoading,
        setError,
        setData,
        reset,
    } = useApiState();

    // Schedule interview
    const scheduleInterview = useCallback(async (request: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.interviewScheduler.scheduleInterview(request);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Interview scheduling failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Batch schedule interviews
    const scheduleInterviewsBatch = useCallback(async (batchRequest: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.interviewScheduler.scheduleInterviewsBatch(batchRequest);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Batch scheduling failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get interviews
    const getInterviews = useCallback(async (params?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.interviewScheduler.getInterviews(params);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get interviews';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get candidate availability
    const getCandidateAvailability = useCallback(async (candidateId: string, params?: any) => {
        try {
            setLoading(true);
            const result = await hrPhoenixApi.interviewScheduler.getCandidateAvailability(candidateId, params);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get candidate availability';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Auto-fetch and refresh interval
    useEffect(() => {
        if (autoFetch) {
            getInterviews();
        }

        if (refreshInterval) {
            intervalRef.current = setInterval(() => getInterviews(), refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, refreshInterval, getInterviews]);

    return {
        // State
        isLoading,
        error,
        data,

        // Actions
        scheduleInterview,
        scheduleInterviewsBatch,
        getInterviews,
        getCandidateAvailability,
        reset,
    };
}

// Hook for system-wide operations
export function useHRPhoenixSystem(options: UseHRPhoenixOptions = {}) {
    const { autoFetch = false, refreshInterval, onSuccess, onError } = options;
    const intervalRef = useRef<NodeJS.Timeout>();

    const {
        isLoading,
        error,
        data,
        setLoading,
        setError,
        setData,
        reset,
    } = useApiState();

    // Check all services health
    const checkAllServicesHealth = useCallback(async () => {
        try {
            setLoading(true);
            const health = await hrPhoenixApi.checkAllServicesHealth();
            setData(health);
            onSuccess?.(health);
            return health;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Health check failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Get all configurations
    const getAllConfigs = useCallback(async () => {
        try {
            setLoading(true);
            const configs = await hrPhoenixApi.getAllConfigs();
            setData(configs);
            onSuccess?.(configs);
            return configs;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get configurations';
            setError(errorMessage);
            onError?.(errorMessage);
            throw err;
        }
    }, [setLoading, setData, setError, onSuccess, onError]);

    // Auto-fetch and refresh interval
    useEffect(() => {
        if (autoFetch) {
            checkAllServicesHealth();
        }

        if (refreshInterval) {
            intervalRef.current = setInterval(checkAllServicesHealth, refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, refreshInterval, checkAllServicesHealth]);

    return {
        // State
        isLoading,
        error,
        data,

        // Actions
        checkAllServicesHealth,
        getAllConfigs,
        reset,
    };
}
