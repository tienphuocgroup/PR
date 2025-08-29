/**
 * TypeScript types for TPG Payment Request AI API
 * Generated from OpenAPI specification v1.0.0
 */

// Base types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  requestId: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

// Health check types
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  providers: Record<string, {
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    lastCheck: string;
  }>;
}

// Auto-completion types
export interface AutocompleteRequest {
  partialData: Partial<PaymentRequest>;
  context?: {
    userId?: string;
    department?: string;
    previousRequests?: number;
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
  };
  maxSuggestions?: number;
}

export interface AutocompleteSuggestion {
  value: string;
  confidence: number;
  source: 'historical' | 'pattern' | 'ml_model';
  metadata?: Record<string, any>;
}

export interface AutocompleteResponse {
  suggestions: Record<string, AutocompleteSuggestion[]>;
  processingTime: number;
  modelVersion: string;
}

// Validation types
export interface ValidationRequest {
  formData: PaymentRequest;
  validationLevel?: 'basic' | 'enhanced' | 'strict';
  context?: {
    userRole?: string;
    departmentRules?: Record<string, any>;
    budgetConstraints?: Record<string, any>;
  };
}

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  code: string;
}

export interface ValidationSuggestion {
  type: 'optimization' | 'compliance' | 'efficiency';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ValidationResponse {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: ValidationSuggestion[];
}

// NLP types
export interface NLPParseRequest {
  text: string;
  language?: 'vi' | 'en';
  context?: {
    department?: string;
    budgetPeriod?: string;
    expectedAmount?: number;
  };
  extractionHints?: string[];
}

export interface AlternativeInterpretation {
  interpretation: PaymentRequest;
  confidence: number;
  reason: string;
}

export interface NLPParseResponse {
  extractedData: PaymentRequest;
  confidence: number;
  uncertainFields: string[];
  alternativeInterpretations: AlternativeInterpretation[];
}

// Document parsing types
export interface DocumentParseResponse {
  extractedData: PaymentRequest;
  documentInfo: {
    pages: number;
    size: number;
    format: string;
    language: string;
  };
  extractionResults: {
    tablesFound: number;
    fieldsExtracted: number;
    confidence: number;
  };
  rawText: string;
  metadata: Record<string, any>;
}

// Categorization types
export interface CategorizationRequest {
  paymentRequest: PaymentRequest;
  options?: {
    includeBudgetSuggestions?: boolean;
    includeApprovalWorkflow?: boolean;
    maxCategories?: number;
  };
}

export interface Category {
  name: string;
  code: string;
  confidence: number;
  description?: string;
}

export interface BudgetAllocation {
  budgetCode: string;
  budgetName: string;
  allocatedAmount: number;
  percentage: number;
}

export interface ApprovalWorkflow {
  requiredApprovers: string[];
  estimatedProcessingTime: string;
  specialRequirements: string[];
}

export interface CategorizationResponse {
  categories: Category[];
  budgetAllocations: BudgetAllocation[];
  approvalWorkflow: ApprovalWorkflow;
}

// Anomaly detection types
export interface AnomalyDetectionRequest {
  paymentRequest: PaymentRequest;
  analysisDepth?: 'surface' | 'detailed' | 'comprehensive';
  comparisonPeriod?: 'month' | 'quarter' | 'year';
}

export interface Anomaly {
  type: 'amount' | 'vendor' | 'frequency' | 'timing' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  confidence: number;
}

export interface AnomalyComparisons {
  historicalAverage: number;
  departmentAverage: number;
  similarRequests: number;
}

export type AnomalyFlag = 'duplicate_vendor' | 'unusual_amount' | 'timing_anomaly' | 'new_vendor' | 'policy_violation';

export interface AnomalyDetectionResponse {
  riskScore: number;
  anomalies: Anomaly[];
  comparisons: AnomalyComparisons;
  flags: AnomalyFlag[];
}

// Provider management types
export interface AIProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'local_model' | 'custom';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  limits: {
    requestsPerMinute: number;
    tokensPerDay: number;
  };
  usage: {
    requestsToday: number;
    tokensUsed: number;
  };
}

export interface ProvidersStatusResponse {
  providers: AIProvider[];
  defaultProvider: string;
  fallbackProvider: string;
}

// Real-time streaming types
export interface StreamEvent {
  event: 'suggestion' | 'validation' | 'error' | 'complete';
  data: any;
  id?: string;
  retry?: number;
}

export interface SuggestionEvent {
  field: string;
  suggestion: string;
  confidence: number;
  timestamp: string;
}

export interface ValidationEvent {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// Rate limiting headers
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

// API client configuration
export interface APIClientConfig {
  baseURL: string;
  apiKey?: string;
  bearerToken?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Utility types for API responses
export type APIEndpoint = 
  | '/health'
  | '/form/autocomplete'
  | '/form/validate'
  | '/nlp/parse-request'
  | '/documents/parse-pdf'
  | '/categorization/suggest'
  | '/anomaly/detect'
  | '/assistance/stream'
  | '/providers/status';

// HTTP methods
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request options
export interface RequestOptions {
  method: HTTPMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

// Import existing PaymentRequest and PaymentDetail types
export interface PaymentDetail {
  stt?: number;
  noiDung: string;
  donViTinh?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  ghiChu?: string;
}

export interface PaymentRequest {
  ngay: string;
  nguoiDeNghi: string;
  boPhan: string;
  noiDungThanhToan: string;
  nhaCungCap: string;
  soTienBangSo?: number;
  soTienBangChu?: string;
  chiTiet?: PaymentDetail[];
  ghiChu?: string;
}

// Error codes enum
export enum APIErrorCode {
  // General errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // AI provider errors
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_MODEL_ERROR = 'AI_MODEL_ERROR',
  
  // Processing errors
  PARSE_FAILED = 'PARSE_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED'
}

// Success response wrapper
export interface SuccessResponse<T> {
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

// Error response wrapper
export interface ErrorResponse {
  error: ApiError;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}