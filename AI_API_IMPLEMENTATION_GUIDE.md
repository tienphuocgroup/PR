# AI API Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing AI capabilities in the TPG Payment Request Form application. The API follows RESTful principles with OpenAPI 3.0 specification and includes features for form auto-completion, intelligent validation, document parsing, and anomaly detection.

## Architecture

### Multi-Provider AI Abstraction Layer
The API supports multiple AI providers through an abstraction layer:
- **OpenAI** (GPT-4, GPT-3.5-turbo)
- **Anthropic** (Claude 3)
- **Local Models** (Ollama, LocalAI)
- **Custom Models** (Azure OpenAI, Google Vertex AI)

### Rate Limiting Strategy
- **Standard Tier**: 100 requests/minute per API key
- **Premium Tier**: 500 requests/minute per API key
- Implements exponential backoff for retry logic
- Circuit breaker pattern for provider failures

### Security Implementation
- JWT Bearer tokens for user authentication
- API keys for service-to-service communication
- Request signing for sensitive operations
- Audit logging for all AI interactions

## Implementation Patterns

### 1. Form Auto-completion Integration

#### React Hook Implementation
```typescript
import { useCallback, useEffect, useState } from 'react';
import { useAIAPI } from '../services/aiApiClient';
import { AutocompleteResponse } from '../types/api';

export const useFormAutoComplete = (formData: Partial<PaymentRequest>) => {
  const aiClient = useAIAPI();
  const [suggestions, setSuggestions] = useState<AutocompleteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getSuggestions = useCallback(async () => {
    if (!formData || Object.keys(formData).length === 0) return;

    setLoading(true);
    try {
      const response = await aiClient.getAutocompleteSuggestions({
        partialData: formData,
        context: {
          userId: getCurrentUserId(),
          department: formData.boPhan,
          timeRange: 'month'
        },
        maxSuggestions: 5
      });

      if (response.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Auto-completion failed:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, aiClient]);

  useEffect(() => {
    const debounceTimer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [getSuggestions]);

  return { suggestions, loading };
};
```

#### Form Field Integration
```typescript
// In PaymentRequestForm.tsx
const FormFieldWithAI = ({ name, suggestions, onSuggestionSelect }) => {
  return (
    <div className="relative">
      <input
        name={name}
        // ... other props
      />
      {suggestions && suggestions[name] && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions[name].map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between"
              onClick={() => onSuggestionSelect(name, suggestion.value)}
            >
              <span>{suggestion.value}</span>
              <span className="text-xs text-gray-500">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Real-time Validation

#### Stream Connection Setup
```typescript
export const useRealTimeValidation = (sessionId: string) => {
  const aiClient = useAIAPI();
  const [validationResults, setValidationResults] = useState<Record<string, ValidationEvent>>({});
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    const stream = aiClient.createAssistanceStream(
      sessionId,
      ['validation'],
      (event) => {
        if (event.event === 'validation') {
          const validationEvent = event.data as ValidationEvent;
          setValidationResults(prev => ({
            ...prev,
            [validationEvent.field]: validationEvent
          }));
        }
      },
      (error) => {
        console.error('Validation stream error:', error);
      }
    );

    setEventSource(stream);

    return () => {
      stream.close();
    };
  }, [sessionId, aiClient]);

  return { validationResults, isConnected: eventSource?.readyState === EventSource.OPEN };
};
```

### 3. Document Parsing Integration

#### PDF Upload Component
```typescript
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export const AIDocumentUpload = ({ onParsedData }) => {
  const aiClient = useAIAPI();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const response = await aiClient.parsePDFDocument(file, 'invoice', 'vi');
      
      if (response.data) {
        onParsedData(response.data.extractedData);
      }
    } catch (error) {
      console.error('Document parsing failed:', error);
    }
  }, [aiClient, onParsedData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-gray-600">
        {isDragActive
          ? 'Thả tệp PDF vào đây...'
          : 'Kéo thả tệp PDF hoặc nhấp để chọn'}
      </p>
    </div>
  );
};
```

### 4. Natural Language Processing

#### Voice-to-Form Integration
```typescript
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const aiClient = useAIAPI();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt không hỗ trợ nhận dạng giọng nói');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);

      // Parse with AI
      try {
        const response = await aiClient.parseNaturalLanguage({
          text: transcript,
          language: 'vi',
          context: {
            department: getCurrentDepartment()
          }
        });

        if (response.data) {
          // Apply parsed data to form
          applyParsedDataToForm(response.data.extractedData);
        }
      } catch (error) {
        console.error('NLP parsing failed:', error);
      }
    };

    recognition.start();
  }, [aiClient]);

  return { isListening, transcript, startListening };
};
```

### 5. Anomaly Detection Implementation

#### Background Validation
```typescript
export const useAnomalyDetection = () => {
  const aiClient = useAIAPI();

  const checkForAnomalies = useCallback(async (paymentRequest: PaymentRequest) => {
    try {
      const response = await aiClient.detectAnomalies({
        paymentRequest,
        analysisDepth: 'detailed',
        comparisonPeriod: 'quarter'
      });

      if (response.data) {
        const { riskScore, anomalies, flags } = response.data;
        
        // Show warnings for high-risk requests
        if (riskScore > 70) {
          showAnomalyWarning(anomalies, flags);
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Anomaly detection failed:', error);
    }
    
    return null;
  }, [aiClient]);

  return { checkForAnomalies };
};
```

## Error Handling Patterns

### Graceful Degradation
```typescript
export const withAIFallback = <T,>(
  aiOperation: () => Promise<T>,
  fallback: () => T,
  errorHandler?: (error: Error) => void
): Promise<T> => {
  return aiOperation().catch((error) => {
    if (errorHandler) {
      errorHandler(error);
    }
    return fallback();
  });
};

// Usage example
const suggestions = await withAIFallback(
  () => aiClient.getAutocompleteSuggestions(request),
  () => getLocalSuggestions(request),
  (error) => logAIError('autocomplete', error)
);
```

### Rate Limit Handling
```typescript
export const handleRateLimit = async <T,>(
  operation: () => Promise<APIResponse<T>>
): Promise<T | null> => {
  const response = await operation();
  
  if (response.error?.code === 'RATE_LIMITED') {
    const retryAfter = parseInt(response.error.details?.retryAfter || '60');
    
    // Show user notification
    showNotification({
      type: 'warning',
      message: `Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`,
      duration: retryAfter * 1000
    });
    
    return null;
  }
  
  return response.data || null;
};
```

## Performance Optimization

### Request Batching
```typescript
class AIRequestBatcher {
  private batchTimeout = 100; // ms
  private pendingRequests: Array<{
    request: AutocompleteRequest;
    resolve: (value: AutocompleteResponse) => void;
    reject: (error: Error) => void;
  }> = [];

  async batchAutocomplete(request: AutocompleteRequest): Promise<AutocompleteResponse> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ request, resolve, reject });
      
      if (this.pendingRequests.length === 1) {
        setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    });
  }

  private async processBatch() {
    const requests = this.pendingRequests.splice(0);
    
    try {
      // Merge requests and send single API call
      const mergedRequest = this.mergeRequests(requests.map(r => r.request));
      const response = await aiClient.getAutocompleteSuggestions(mergedRequest);
      
      // Distribute results back to individual promises
      requests.forEach(({ resolve }) => resolve(response.data!));
    } catch (error) {
      requests.forEach(({ reject }) => reject(error as Error));
    }
  }
}
```

### Caching Strategy
```typescript
export class AIResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  generateKey(operation: string, params: any): string {
    return `${operation}_${JSON.stringify(params)}`;
  }
}
```

## Testing Strategies

### Mock AI Responses
```typescript
export const mockAIAPIClient = {
  getAutocompleteSuggestions: jest.fn().mockResolvedValue({
    data: {
      suggestions: {
        noiDungThanhToan: [
          { value: 'Mua thiết bị văn phòng', confidence: 0.85, source: 'historical' }
        ]
      },
      processingTime: 150,
      modelVersion: 'gpt-4-test'
    }
  }),
  
  validateForm: jest.fn().mockResolvedValue({
    data: {
      isValid: true,
      score: 95,
      issues: [],
      suggestions: []
    }
  })
};
```

### Integration Testing
```typescript
describe('AI Integration Tests', () => {
  beforeEach(() => {
    // Setup test environment with mock AI responses
  });

  it('should provide autocomplete suggestions', async () => {
    const client = createAIAPIClient(testConfig);
    const response = await client.getAutocompleteSuggestions({
      partialData: { nguoiDeNghi: 'Nguyễn' },
      maxSuggestions: 3
    });
    
    expect(response.data?.suggestions).toBeDefined();
    expect(Object.keys(response.data?.suggestions || {})).toContain('nguoiDeNghi');
  });
});
```

## Deployment Configuration

### Environment Variables
```bash
# AI API Configuration
AI_API_BASE_URL=https://api.tpg.com.vn/ai/v1
AI_API_KEY=your-api-key-here
AI_BEARER_TOKEN=your-jwt-token-here

# Provider Configuration
AI_PRIMARY_PROVIDER=openai
AI_FALLBACK_PROVIDER=anthropic
AI_LOCAL_MODEL_URL=http://localhost:11434

# Rate Limiting
AI_RATE_LIMIT_TIER=premium
AI_QUOTA_DAILY=10000

# Caching
AI_CACHE_TTL=300000
AI_CACHE_SIZE_LIMIT=100MB

# Monitoring
AI_LOGGING_LEVEL=info
AI_METRICS_ENABLED=true
```

### Docker Compose for Local Development
```yaml
version: '3.8'
services:
  ai-api:
    image: tpg/ai-api:latest
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./ai-models:/app/models

  payment-form:
    image: tpg/payment-form:latest
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_AI_API_URL=http://localhost:3001/api/ai/v1
    depends_on:
      - ai-api
```

## Monitoring and Analytics

### Key Metrics to Track
- API response times by endpoint
- Success/failure rates by AI provider
- Token usage and costs
- User adoption of AI features
- Accuracy metrics for suggestions and validations

### Error Monitoring
```typescript
export const setupAIMonitoring = () => {
  // Track API errors
  aiClient.on('error', (error, endpoint) => {
    analytics.track('ai_api_error', {
      endpoint,
      errorCode: error.code,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    });
  });

  // Track feature usage
  aiClient.on('success', (response, endpoint) => {
    analytics.track('ai_feature_used', {
      endpoint,
      processingTime: response.processingTime,
      modelVersion: response.modelVersion,
      timestamp: new Date().toISOString()
    });
  });
};
```

This implementation guide provides a comprehensive foundation for integrating AI capabilities into your Vietnamese payment request form application while maintaining reliability, performance, and user experience standards.