import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
// import StudyView from '@/components/StudyView';
import ComprehensiveStudyView from '@/components/ComprehensiveStudyView';
import Dashboard from '@/components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'study' | 'dashboard'>('home');

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Close the login modal if user successfully authenticated
      if (session?.user) {
        setShowEmailLogin(false);
        setEmail('');
        setPassword('');
        setAuthError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setShowEmailLogin(true);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setAuthError('Check your email for the confirmation link!');
        // Keep modal open for sign up to show the email confirmation message
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Successfully signed in - close the modal
        if (data.user) {
          setShowEmailLogin(false);
          setEmail('');
          setPassword('');
          setAuthError(null);
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto mobile-padding">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-black text-gray-900">
                PL-600 Exam Prep
              </h1>
              {user && (
                <div className="ml-4 md:ml-10 flex space-x-2 md:space-x-4">
                  <button
                    onClick={() => setCurrentView('home')}
                    className={`px-3 py-2 rounded-lg text-sm md:text-base font-bold transition-all ${
                      currentView === 'home'
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'text-gray-800 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setCurrentView('study')}
                    className={`px-3 py-2 rounded-lg text-sm md:text-base font-bold transition-all ${
                      currentView === 'study'
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'text-gray-800 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    Study
                  </button>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm md:text-base font-bold transition-all ${
                      currentView === 'dashboard'
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'text-gray-800 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    Dashboard
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="hidden md:block text-sm font-medium text-gray-800">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-300 text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-400 shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Email Login Modal */}
      {showEmailLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            
            {authError && (
              <div className={`p-3 rounded mb-4 ${
                authError.includes('Check your email') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {authError}
              </div>
            )}
            
            <form onSubmit={handleEmailAuth}>
              <div className="mb-4">
                <label className="block text-base font-black text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-4 border-gray-700 rounded-lg text-black bg-white font-bold text-lg focus:border-blue-700 focus:ring-4 focus:ring-blue-300 transition-all placeholder-gray-500"
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-base font-black text-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-4 border-gray-700 rounded-lg text-black bg-white font-bold text-lg focus:border-blue-700 focus:ring-4 focus:ring-blue-300 transition-all placeholder-gray-500"
                  style={{ color: '#000000', backgroundColor: '#FFFFFF', WebkitTextFillColor: '#000000' }}
                  placeholder="Enter your password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mb-3"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-blue-600 hover:text-blue-800 text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </form>
            
            <button
              onClick={() => {
                setShowEmailLogin(false);
                setAuthError(null);
                setEmail('');
                setPassword('');
              }}
              className="mt-4 w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-padding py-6 md:py-8">
        {!user ? (
          // Landing Page
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Master the PL-600 Exam
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive preparation platform for Microsoft Power Platform Solution Architect certification
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">500+ Questions</h3>
                <p className="text-gray-600">
                  Real exam questions with detailed explanations
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-4">🔬</div>
                <h3 className="text-lg font-semibold mb-2">Hands-On Labs</h3>
                <p className="text-gray-600">
                  Practice with real Power Platform environments
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Learning</h3>
                <p className="text-gray-600">
                  Personalized study paths and smart recommendations
                </p>
              </div>
            </div>
            <button
              onClick={handleSignIn}
              className="mt-12 bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Get Started - Sign In
            </button>
          </div>
        ) : (
          // Authenticated Views
          <div>
            {currentView === 'home' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome back!
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600">Questions Answered</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600">Accuracy</div>
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600">Study Streak</div>
                    <div className="text-2xl font-bold text-gray-900">0 days</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600">Ready Score</div>
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'study' && (
              <ComprehensiveStudyView />
            )}

            {currentView === 'dashboard' && (
              <Dashboard />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;