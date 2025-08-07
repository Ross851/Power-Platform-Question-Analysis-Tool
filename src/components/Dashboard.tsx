import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProgressData {
  totalQuestions: number;
  questionsAttempted: number;
  correctAnswers: number;
  averageTime: number;
  byType: Record<string, { attempted: number; correct: number }>;
  byArea: Record<string, { attempted: number; correct: number }>;
  recentActivity: Array<{
    question_id: string;
    is_correct: boolean;
    time_spent: number;
    created_at: string;
  }>;
  weakAreas: Array<{
    area: string;
    accuracy: number;
    attempted: number;
  }>;
  strongAreas: Array<{
    area: string;
    accuracy: number;
    attempted: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get date range
      const now = new Date();
      const startDate = new Date();
      if (timeRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate.setFullYear(2020); // All time
      }

      // Fetch user progress
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (progress && progress.length > 0) {
        // Calculate statistics
        const stats: ProgressData = {
          totalQuestions: 128, // Total questions in the system
          questionsAttempted: progress.length,
          correctAnswers: progress.filter(p => p.is_correct).length,
          averageTime: Math.round(
            progress.reduce((sum, p) => sum + p.time_spent, 0) / progress.length
          ),
          byType: {},
          byArea: {},
          recentActivity: progress.slice(0, 10),
          weakAreas: [],
          strongAreas: []
        };

        // Group by question type and area (would need to join with questions table)
        // For now, using mock data
        stats.byType = {
          'multiplechoice': { attempted: 45, correct: 38 },
          'sequence': { attempted: 12, correct: 8 },
          'hotspot': { attempted: 15, correct: 10 },
          'yesno': { attempted: 8, correct: 7 }
        };

        stats.byArea = {
          'envisioning': { attempted: 30, correct: 25 },
          'architecture': { attempted: 35, correct: 28 },
          'implementation': { attempted: 15, correct: 12 }
        };

        // Calculate weak and strong areas
        Object.entries(stats.byArea).forEach(([area, data]) => {
          if (data.attempted >= 5) {
            const accuracy = (data.correct / data.attempted) * 100;
            const areaData = { area, accuracy, attempted: data.attempted };
            
            if (accuracy < 70) {
              stats.weakAreas.push(areaData);
            } else if (accuracy >= 85) {
              stats.strongAreas.push(areaData);
            }
          }
        });

        setProgressData(stats);
      } else {
        // No progress yet - set default data
        setProgressData({
          totalQuestions: 128,
          questionsAttempted: 0,
          correctAnswers: 0,
          averageTime: 0,
          byType: {},
          byArea: {},
          recentActivity: [],
          weakAreas: [],
          strongAreas: []
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const accuracy = progressData.questionsAttempted > 0
    ? Math.round((progressData.correctAnswers / progressData.questionsAttempted) * 100)
    : 0;

  const readinessScore = progressData.questionsAttempted > 50
    ? Math.min(100, Math.round(accuracy * (progressData.questionsAttempted / progressData.totalQuestions)))
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Progress Dashboard</h2>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Questions Attempted</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {progressData.questionsAttempted}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            of {progressData.totalQuestions} total
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(progressData.questionsAttempted / progressData.totalQuestions) * 100}%` }}
            />
          </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Accuracy Rate</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {accuracy}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {progressData.correctAnswers} correct
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${
                accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg. Time/Question</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {progressData.averageTime}s
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {progressData.averageTime < 60 ? 'Good pace!' : 'Take your time'}
          </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Readiness Score</span>
            <span className="text-2xl">🏆</span>
          </div>
          <div className={`text-3xl font-bold ${
            readinessScore >= 80 ? 'text-green-600' : readinessScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {readinessScore}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {readinessScore >= 80 ? 'Exam Ready!' : readinessScore >= 60 ? 'Getting There' : 'Keep Practicing'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${
                readinessScore >= 80 ? 'bg-green-500' : readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Performance by Type and Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* By Question Type */}
        <div className="card">
          <div className="card-body">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Question Type</h3>
          <div className="space-y-3">
            {Object.entries(progressData.byType).map(([type, stats]) => {
              const typeAccuracy = stats.attempted > 0 
                ? Math.round((stats.correct / stats.attempted) * 100)
                : 0;
              
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.replace('multiplechoice', 'Multiple Choice')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stats.correct}/{stats.attempted} ({typeAccuracy}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        typeAccuracy >= 80 ? 'bg-green-500' : typeAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${typeAccuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>

        {/* By Exam Area */}
        <div className="card">
          <div className="card-body">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Exam Area</h3>
          <div className="space-y-3">
            {Object.entries(progressData.byArea).map(([area, stats]) => {
              const areaAccuracy = stats.attempted > 0 
                ? Math.round((stats.correct / stats.attempted) * 100)
                : 0;
              
              const areaNames: Record<string, string> = {
                'envisioning': 'Solution Envisioning',
                'architecture': 'Architect a Solution',
                'implementation': 'Implement the Solution'
              };
              
              return (
                <div key={area}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {areaNames[area] || area}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stats.correct}/{stats.attempted} ({areaAccuracy}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        areaAccuracy >= 80 ? 'bg-green-500' : areaAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${areaAccuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weak Areas */}
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4">
            🎯 Areas Needing Improvement
          </h3>
          {progressData.weakAreas.length > 0 ? (
            <div className="space-y-2">
              {progressData.weakAreas.map((area, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">{area.area}</span>
                  <span className="text-red-600 font-semibold">
                    {Math.round(area.accuracy)}% accuracy
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Keep practicing to identify areas for improvement</p>
          )}
        </div>

        {/* Strong Areas */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-4">
            💪 Your Strengths
          </h3>
          {progressData.strongAreas.length > 0 ? (
            <div className="space-y-2">
              {progressData.strongAreas.map((area, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">{area.area}</span>
                  <span className="text-green-600 font-semibold">
                    {Math.round(area.accuracy)}% accuracy
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Complete more questions to identify your strengths</p>
          )}
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Study Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressData.weakAreas.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Focus Areas</h4>
              <p className="text-sm text-gray-600">
                Prioritize studying: {progressData.weakAreas.map(a => a.area).join(', ')}
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Daily Goal</h4>
            <p className="text-sm text-gray-600">
              Complete at least 10 questions per day to maintain momentum
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Next Steps</h4>
            <p className="text-sm text-gray-600">
              {readinessScore < 60 
                ? 'Focus on understanding core concepts'
                : readinessScore < 80
                ? 'Practice with timed mock exams'
                : 'Review weak areas and take practice tests'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;