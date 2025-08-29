/**
 * AI API Client for TPG Payment Request Form
 * Provides TypeScript client for interacting with the AI API
 */

import {
  APIClientConfig,
  APIEndpoint,
  APIErrorCode,
  AutocompleteRequest,
  AutocompleteResponse,
  ValidationRequest,
  ValidationResponse,
  NLPParseRequest,
  NLPParseResponse,
  DocumentParseResponse,
  CategorizationRequest,
  CategorizationResponse,
  AnomalyDetectionRequest,
  AnomalyDetectionResponse,
  ProvidersStatusResponse,
  HealthResponse,
  APIResponse,
  RequestOptions,
  RateLimitHeaders,
  StreamEvent
} from '../types/api';

export class AIAPIClient {
  private config: Required<APIClientConfig>;
  private rateLimitInfo: Partial<RateLimitHeaders> = {};

  constructor(config: APIClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      apiKey: config.apiKey || '',
      bearerToken: config.bearerToken || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000
    };
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<APIResponse<HealthResponse>> {
    return this.makeRequest<HealthResponse>('/health', { method: 'GET' });
  }

  /**
   * Get AI-powered form auto-completion suggestions
   */
  async getAutocompleteSuggestions(
    request: AutocompleteRequest
  ): Promise<APIResponse<AutocompleteResponse>> {
    return this.makeRequest<AutocompleteResponse>('/form/autocomplete', {
      method: 'POST',
      body: request
    });
  }

  /**
   * Validate form data with AI-powered suggestions
   */
  async validateForm(
    request: ValidationRequest
  ): Promise<APIResponse<ValidationResponse>> {
    return this.makeRequest<ValidationResponse>('/form/validate', {
      method: 'POST',
      body: request
    });
  }

  /**
   * Parse natural language text into form data
   */
  async parseNaturalLanguage(
    request: NLPParseRequest
  ): Promise<APIResponse<NLPParseResponse>> {
    return this.makeRequest<NLPParseResponse>('/nlp/parse-request', {
      method: 'POST',
      body: request
    });
  }

  /**
   * Parse PDF document to extract payment information
   */
  async parsePDFDocument(
    file: File,
    extractionType: 'invoice' | 'receipt' | 'contract' | 'general' = 'general',
    language: 'vi' | 'en' = 'vi'
  ): Promise<APIResponse<DocumentParseResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('extractionType', extractionType);
    formData.append('language', language);

    return this.makeRequest<DocumentParseResponse>('/documents/parse-pdf', {
      method: 'POST',
      body: formData
    });
  }

  /**
   * Get smart categorization and budget allocation suggestions
   */
  async getCategorization(
    request: CategorizationRequest
  ): Promise<APIResponse<CategorizationResponse>> {
    return this.makeRequest<CategorizationResponse>('/categorization/suggest', {
      method: 'POST',
      body: request
    });
  }

  /**
   * Detect anomalies in payment request
   */
  async detectAnomalies(
    request: AnomalyDetectionRequest
  ): Promise<APIResponse<AnomalyDetectionResponse>> {
    return this.makeRequest<AnomalyDetectionResponse>('/anomaly/detect', {
      method: 'POST',
      body: request
    });
  }

  /**
   * Get AI provider status
   */
  async getProviderStatus(): Promise<APIResponse<ProvidersStatusResponse>> {
    return this.makeRequest<ProvidersStatusResponse>('/providers/status', {
      method: 'GET'
    });
  }

  /**
   * Establish Server-Sent Events connection for real-time assistance
   */
  createAssistanceStream(
    sessionId: string,
    features: ('autocomplete' | 'validation' | 'suggestions')[] = ['autocomplete', 'validation', 'suggestions'],
    onEvent: (event: StreamEvent) => void,
    onError: (error: Error) => void = console.error
  ): EventSource {
    const params = new URLSearchParams({
      sessionId,
      features: features.join(',')
    });

    const eventSource = new EventSource(
      `${this.config.baseURL}/assistance/stream?${params}`,
      {
        withCredentials: false
      }
    );

    // Handle different event types
    eventSource.addEventListener('suggestion', (event) => {
      onEvent({
        event: 'suggestion',
        data: JSON.parse(event.data),
        id: event.lastEventId
      });
    });

    eventSource.addEventListener('validation', (event) => {
      onEvent({
        event: 'validation',
        data: JSON.parse(event.data),
        id: event.lastEventId
      });
    });

    eventSource.addEventListener('error', (event) => {
      onError(new Error('Stream connection error'));
    });

    return eventSource;
  }

  /**
   * Get current rate limit information
   */
  getRateLimitInfo(): Partial<RateLimitHeaders> {
    return { ...this.rateLimitInfo };
  }

  /**
   * Check if rate limited
   */
  isRateLimited(): boolean {
    if (!this.rateLimitInfo['X-RateLimit-Remaining']) return false;
    return parseInt(this.rateLimitInfo['X-RateLimit-Remaining']) <= 0;
  }

  /**
   * Get time until rate limit reset
   */
  getTimeUntilReset(): number {
    if (!this.rateLimitInfo['X-RateLimit-Reset']) return 0;
    const resetTime = parseInt(this.rateLimitInfo['X-RateLimit-Reset']) * 1000;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: APIEndpoint,
    options: RequestOptions
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...this.getContentTypeHeaders(options.body),
            ...options.headers
          }
        });

        // Update rate limit information
        this.updateRateLimitInfo(response);

        if (response.ok) {
          const data = await response.json();
          return { data };
        } else {
          const errorData = await response.json();
          return { error: errorData.error };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }

    return {
      error: {
        code: APIErrorCode.INTERNAL_ERROR,
        message: `Request failed after ${this.config.retryAttempts} attempts: ${lastError.message}`,
        requestId: `client_${Date.now()}`
      }
    };
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestOptions
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers: options.headers,
        signal: options.signal || controller.signal
      };

      if (options.body && !(options.body instanceof FormData)) {
        fetchOptions.body = JSON.stringify(options.body);
      } else if (options.body instanceof FormData) {
        fetchOptions.body = options.body;
      }

      return await fetch(url, fetchOptions);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.bearerToken) {
      headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
    } else if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }

  /**
   * Get content type headers
   */
  private getContentTypeHeaders(body: any): Record<string, string> {
    if (!body) return {};
    
    // Don't set content-type for FormData (browser will set it with boundary)
    if (body instanceof FormData) return {};
    
    return { 'Content-Type': 'application/json' };
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const rateLimitHeaders = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After'
    ] as const;

    for (const header of rateLimitHeaders) {
      const value = response.headers.get(header);
      if (value) {
        this.rateLimitInfo[header] = value;
      }
    }
  }

  /**
   * Check if error should not trigger a retry
   */
  private shouldNotRetry(error: any): boolean {
    if (error.name === 'AbortError') return true;
    if (error.status >= 400 && error.status < 500) return true; // Client errors
    return false;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a singleton API client instance
 */
export const createAIAPIClient = (config: APIClientConfig): AIAPIClient => {
  return new AIAPIClient(config);
};

/**
 * Default API client configuration for development
 */
export const getDefaultConfig = (): APIClientConfig => ({
  baseURL: 'http://localhost:3001/api/ai/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});

/**
 * Hook for React components to use the AI API client
 */
export const useAIAPI = () => {
  const config = getDefaultConfig();
  // Add your authentication token here
  // config.apiKey = process.env.REACT_APP_AI_API_KEY;
  // config.bearerToken = getUserToken();
  
  return createAIAPIClient(config);
};

// Export types for convenience
export type {
  AutocompleteRequest,
  AutocompleteResponse,
  ValidationRequest,
  ValidationResponse,
  NLPParseRequest,
  NLPParseResponse,
  DocumentParseResponse,
  CategorizationRequest,
  CategorizationResponse,
  AnomalyDetectionRequest,
  AnomalyDetectionResponse,
  StreamEvent
} from '../types/api';