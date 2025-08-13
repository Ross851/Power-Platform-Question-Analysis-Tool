import { supabase } from '@/lib/supabase';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: string;
  userFriendlyMessage: string;
  recoverable: boolean;
  action?: () => void;
}

// Error factory
export class ErrorHandler {
  static categorizeError(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;
    
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || code === 'network_error') {
      return ErrorType.NETWORK;
    }
    
    // Auth errors
    if (message.includes('auth') || message.includes('unauthorized') || code.includes('auth')) {
      return ErrorType.AUTH;
    }
    
    // Database errors
    if (message.includes('database') || message.includes('supabase') || code.includes('pgrst')) {
      return ErrorType.DATABASE;
    }
    
    // Validation errors
    if (message.includes('invalid') || message.includes('validation') || code === '22P02') {
      return ErrorType.VALIDATION;
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') || code === '403') {
      return ErrorType.PERMISSION;
    }
    
    // Not found errors
    if (message.includes('not found') || code === '404') {
      return ErrorType.NOT_FOUND;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  static createAppError(error: any): AppError {
    const type = this.categorizeError(error);
    
    const userFriendlyMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Connection issue. Please check your internet and try again.',
      [ErrorType.AUTH]: 'Authentication required. Please sign in to continue.',
      [ErrorType.DATABASE]: 'Unable to load data. Please try again later.',
      [ErrorType.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };
    
    return {
      type,
      message: error.message || 'Unknown error',
      details: error,
      timestamp: new Date().toISOString(),
      userFriendlyMessage: userFriendlyMessages[type],
      recoverable: type !== ErrorType.AUTH && type !== ErrorType.PERMISSION,
      action: type === ErrorType.AUTH ? () => window.location.href = '/login' : undefined
    };
  }
  
  static async logError(error: AppError) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('App Error:', error);
    }
    
    // Try to log to Supabase (if available and user is authenticated)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('error_logs').insert({
          user_id: user.id,
          error_type: error.type,
          message: error.message,
          details: error.details,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: error.timestamp
        });
      }
    } catch (logError) {
      // Silently fail if logging fails
      console.error('Failed to log error:', logError);
    }
  }
  
  static handleError(error: any, context?: string): AppError {
    const appError = this.createAppError(error);
    
    // Add context if provided
    if (context) {
      appError.message = `${context}: ${appError.message}`;
    }
    
    // Log the error
    this.logError(appError);
    
    return appError;
  }
}

// React hook for error handling
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleError = useCallback((error: any, context?: string) => {
    const appError = ErrorHandler.handleError(error, context);
    setError(appError);
    return appError;
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const wrapAsync = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      handleError(error, context);
      return null;
    }
  }, [handleError]);
  
  return {
    error,
    isLoading,
    handleError,
    clearError,
    wrapAsync
  };
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ErrorHandler.handleError(event.reason, 'Unhandled Promise Rejection');
    event.preventDefault();
  });
  
  // Handle general errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    ErrorHandler.handleError(event.error, 'Global Error');
    event.preventDefault();
  });
}

// Retry utility for network errors
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorType = ErrorHandler.categorizeError(error);
      
      // Only retry network errors
      if (errorType !== ErrorType.NETWORK || i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retrying after ${delay}ms (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}