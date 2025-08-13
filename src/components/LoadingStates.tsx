import React from 'react';

// Main loading spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({ 
  size = 'md', 
  message 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

// Full page loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Question skeleton loader
export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border-2 border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 h-10 bg-gray-200 rounded"></div>
    </div>
  );
};

// Dashboard skeleton loader
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// List skeleton loader
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress bar loader
export const ProgressLoader: React.FC<{ progress: number; message?: string }> = ({ 
  progress, 
  message 
}) => {
  return (
    <div className="w-full">
      {message && (
        <p className="text-sm text-gray-600 mb-2">{message}</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
    </div>
  );
};

// Lazy loading wrapper
export const LazyLoadWrapper: React.FC<{ 
  children: React.ReactNode;
  loading?: boolean;
  skeleton?: React.ReactNode;
}> = ({ children, loading = false, skeleton }) => {
  if (loading) {
    return <>{skeleton || <LoadingSpinner />}</>;
  }
  
  return <>{children}</>;
};

// Loading button
export const LoadingButton: React.FC<{
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}> = ({ 
  loading = false, 
  disabled = false, 
  onClick, 
  children, 
  className = '',
  loadingText = 'Loading...'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative ${className} ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2">{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Content loader with error state
export const ContentLoader: React.FC<{
  loading: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}> = ({ 
  loading, 
  error, 
  empty = false,
  emptyMessage = 'No data available',
  errorMessage = 'Failed to load content',
  onRetry,
  skeleton,
  children 
}) => {
  if (loading) {
    return <>{skeleton || <LoadingSpinner size="lg" />}</>;
  }
  
  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-900 font-medium">{errorMessage}</p>
        {error.message && (
          <p className="text-sm text-gray-600 mt-1">{error.message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  if (empty) {
    return (
      <div className="text-center p-6">
        <div className="text-gray-400 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default {
  LoadingSpinner,
  FullPageLoading,
  QuestionSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  ProgressLoader,
  LazyLoadWrapper,
  LoadingButton,
  ContentLoader
};