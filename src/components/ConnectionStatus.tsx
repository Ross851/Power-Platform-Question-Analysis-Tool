import { useState, useEffect } from 'react';
import { testSupabaseConnection, runAllSupabaseTests } from '@/utils/supabase-test';

interface ConnectionStatus {
  connected: boolean;
  hasQuestions?: boolean;
  questionCount?: number;
  authenticated?: boolean;
  user?: string | null;
  error?: string;
  details?: any;
}

export default function ConnectionStatusComponent() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    // Auto-check on component mount
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setStatus(result as ConnectionStatus);
    } catch (error) {
      setStatus({
        connected: false,
        error: 'Failed to test connection'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const runFullDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await runAllSupabaseTests();
      setStatus(results.connection as ConnectionStatus);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!status && !loading) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <div className={`bg-white rounded-lg shadow-xl border-2 ${
        status?.connected ? 'border-green-500' : 'border-red-500'
      } p-4`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">Supabase Status</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' :
              status?.connected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs font-medium">
              {loading ? 'Checking...' : 
               status?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {status?.connected && (
            <>
              <div className="text-xs text-gray-600">
                Questions: {status.questionCount || 0}
              </div>
              <div className="text-xs text-gray-600">
                Auth: {status.authenticated ? `✓ ${status.user}` : 'Not logged in'}
              </div>
            </>
          )}
          
          {status?.error && (
            <div className="text-xs text-red-600 mt-2">
              Error: {status.error}
            </div>
          )}
          
          {showDetails && status?.details && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(status.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={checkConnection}
            disabled={loading}
            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Recheck
          </button>
          <button
            onClick={runFullDiagnostics}
            disabled={loading}
            className="flex-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Full Test
          </button>
        </div>
        
        {!status?.connected && (
          <div className="mt-3 p-2 bg-yellow-50 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Tip:</strong> Check your .env file for correct Supabase credentials
            </p>
          </div>
        )}
      </div>
    </div>
  );
}