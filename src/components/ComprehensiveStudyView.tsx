import React, { useState, useEffect, useMemo } from 'react';
import { Question } from './Question/Question';
import EnhancedQuestion from './Question/EnhancedQuestion';
import MasterQuestion from './Question/MasterQuestion';
import SequenceQuestion from './Question/QuestionTypes/SequenceQuestion';
import HotspotQuestion from './Question/QuestionTypes/HotspotQuestion';
import { supabase } from '@/lib/supabase';
// import type { Question as QuestionType } from '@/types/question';

// Import all question data
import allExtractedQuestions from '@/data/all-extracted-questions.json';
import masterQuestionsJson from '@/data/questions-with-breakdown.json';
import enhancedQuestionsJson from '@/data/enhanced-questions.json';

interface StudyFilters {
  examArea: 'all' | 'envisioning' | 'architecture' | 'implementation';
  questionType: 'all' | 'multiplechoice' | 'sequence' | 'dragdrop' | 'hotspot' | 'yesno';
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
}

export const ComprehensiveStudyView: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [filters, setFilters] = useState<StudyFilters>({
    examArea: 'all',
    questionType: 'all',
    difficulty: 'all',
    topic: 'all'
  });
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    totalTime: 0,
    byType: {} as Record<string, { attempted: number; correct: number }>,
    byArea: {} as Record<string, { attempted: number; correct: number }>
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Microsoft PL-600 Exam Structure
  const examStructure = {
    areas: [
      {
        id: 'envisioning',
        name: 'Solution Envisioning and Requirements Analysis',
        weight: '35-40%',
        color: 'blue',
        topics: [
          'Initiate solution planning',
          'Identify organization information and metrics',
          'Identify existing solutions and systems',
          'Capture requirements',
          'Perform fit/gap analysis'
        ]
      },
      {
        id: 'architecture',
        name: 'Architect a Solution',
        weight: '40-45%',
        color: 'purple',
        topics: [
          'Lead the design process',
          'Design solution topology',
          'Design customizations',
          'Design integrations',
          'Design migrations',
          'Design the security model',
          'Design for deployment and operations'
        ]
      },
      {
        id: 'implementation',
        name: 'Implement the Solution',
        weight: '15-20%',
        color: 'green',
        topics: [
          'Validate the solution design',
          'Support go-live',
          'Optimize solution performance'
        ]
      }
    ]
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      // Try to load from Supabase first
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('question_number');

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // Combine all question sources
        const allQuestions = [
          // Master questions with breakdown
          ...(masterQuestionsJson.questions || []),
          // Enhanced questions with deep dive
          ...(enhancedQuestionsJson.questions || []),
          // All extracted questions (120 from HTML)
          ...(allExtractedQuestions.questions || [])
        ];
        
        // Remove duplicates based on ID or question_number
        const uniqueQuestions = Array.from(
          new Map(allQuestions.map(q => {
            const id = 'id' in q ? q.id : 'question_number' in q ? q.question_number : Math.random();
            return [id, q];
          })).values()
        );
        
        setQuestions(uniqueQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      // Load from local files
      const allQuestions = [
        ...(masterQuestionsJson.questions || []),
        ...(enhancedQuestionsJson.questions || []),
        ...(allExtractedQuestions.questions || [])
      ];
      setQuestions(allQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on current filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Filter by exam area
      if (filters.examArea !== 'all') {
        const questionArea = q.examArea?.toLowerCase() || '';
        if (!questionArea.includes(filters.examArea)) {
          return false;
        }
      }

      // Filter by question type
      if (filters.questionType !== 'all') {
        if (q.type !== filters.questionType && q.question_type !== filters.questionType) {
          return false;
        }
      }

      // Filter by difficulty
      if (filters.difficulty !== 'all') {
        const difficulty = q.difficulty || q.difficultyLevel || 'medium';
        if (typeof difficulty === 'number') {
          const diffMap: Record<string, number[]> = {
            'easy': [1, 2],
            'medium': [3],
            'hard': [4],
            'expert': [5]
          };
          if (!diffMap[filters.difficulty]?.includes(difficulty)) {
            return false;
          }
        } else if (difficulty.toLowerCase() !== filters.difficulty) {
          return false;
        }
      }

      // Filter by topic
      if (filters.topic !== 'all') {
        const topic = q.topic?.toLowerCase() || '';
        const tags = q.tags?.join(' ').toLowerCase() || '';
        if (!topic.includes(filters.topic.toLowerCase()) && 
            !tags.includes(filters.topic.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [questions, filters]);

  const handleAnswer = async (_answer: any, isCorrect: boolean, timeSpent: number) => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const questionType = currentQuestion.type || currentQuestion.question_type || 'multiplechoice';
    const examArea = currentQuestion.examArea || 'unknown';

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalTime: prev.totalTime + timeSpent,
      byType: {
        ...prev.byType,
        [questionType]: {
          attempted: (prev.byType[questionType]?.attempted || 0) + 1,
          correct: (prev.byType[questionType]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      },
      byArea: {
        ...prev.byArea,
        [examArea]: {
          attempted: (prev.byArea[examArea]?.attempted || 0) + 1,
          correct: (prev.byArea[examArea]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      }
    }));

    // Save progress to Supabase if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user && 'id' in currentQuestion && currentQuestion.id) {
      try {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          is_correct: isCorrect,
          time_spent: timeSpent,
          attempt_number: 1
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestion = (question: any) => {
    const questionType = question.type || question.question_type || 'multiplechoice';

    // Check for special question features
    if (question.explanation?.question_breakdown) {
      return <MasterQuestion question={question} onAnswer={handleAnswer} showExplanation={true} />;
    }
    
    if (question.explanation?.deep_dive) {
      return <EnhancedQuestion question={question} onAnswer={handleAnswer} showExplanation={true} />;
    }

    // Render based on question type
    switch (questionType) {
      case 'sequence':
      case 'dragdrop':
        return <SequenceQuestion question={question} onAnswer={handleAnswer} />;
      
      case 'hotspot':
        return <HotspotQuestion question={question} onAnswer={handleAnswer} />;
      
      case 'multiplechoice':
      case 'yesno':
      default:
        return <Question question={question} onAnswer={handleAnswer} showExplanation={true} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No questions match your filters.</p>
        <button
          onClick={() => setFilters({
            examArea: 'all',
            questionType: 'all',
            difficulty: 'all',
            topic: 'all'
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const accuracy = sessionStats.attempted > 0 
    ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) 
    : 0;

  return (
    <div>
      {/* Filters Panel */}
      <div className={`mb-6 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        showFilters ? 'max-h-96' : 'max-h-14'
      }`}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-900">
            🎯 Study Filters
          </span>
          <span className="text-gray-500">
            {showFilters ? '▼' : '▶'} {filteredQuestions.length} questions
          </span>
        </button>
        
        {showFilters && (
          <div className="px-6 pb-6 border-t">
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              {/* Exam Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Area
                </label>
                <select
                  value={filters.examArea}
                  onChange={(e) => setFilters({...filters, examArea: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Areas ({questions.length})</option>
                  {examStructure.areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.weight})
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={filters.questionType}
                  onChange={(e) => setFilters({...filters, questionType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="multiplechoice">Multiple Choice</option>
                  <option value="sequence">Sequence/Drag-Drop</option>
                  <option value="hotspot">Hotspot</option>
                  <option value="yesno">Yes/No</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Topic Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Search
                </label>
                <input
                  type="text"
                  value={filters.topic === 'all' ? '' : filters.topic}
                  onChange={(e) => setFilters({...filters, topic: e.target.value || 'all'})}
                  placeholder="e.g., integration, security"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Quick filters:</span>
              {['Integration', 'Security', 'ALM', 'Performance', 'Governance'].map(topic => (
                <button
                  key={topic}
                  onClick={() => setFilters({...filters, topic: topic.toLowerCase()})}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.topic === topic.toLowerCase()
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Header with Statistics */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comprehensive Study Mode</h2>
            <p className="text-sm text-gray-600 mt-1">
              {questions.length} total questions • {filteredQuestions.length} matching filters
            </p>
          </div>
          <div className="flex space-x-3 text-sm">
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <div className="text-blue-600 font-semibold">Progress</div>
              <div className="text-blue-900">{currentQuestionIndex + 1}/{filteredQuestions.length}</div>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <div className="text-green-600 font-semibold">Correct</div>
              <div className="text-green-900">{sessionStats.correct}/{sessionStats.attempted}</div>
            </div>
            <div className="bg-purple-50 px-3 py-2 rounded-lg">
              <div className="text-purple-600 font-semibold">Accuracy</div>
              <div className="text-purple-900">{accuracy}%</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Display */}
      {currentQuestion && renderQuestion(currentQuestion)}

      {/* Navigation */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          ← Previous
        </button>

        {/* Question Jump */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Jump to:</span>
          <input
            type="number"
            min="1"
            max={filteredQuestions.length}
            value={currentQuestionIndex + 1}
            onChange={(e) => {
              const idx = parseInt(e.target.value) - 1;
              if (idx >= 0 && idx < filteredQuestions.length) {
                setCurrentQuestionIndex(idx);
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
          />
        </div>

        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === filteredQuestions.length - 1}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestionIndex === filteredQuestions.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next →
        </button>
      </div>

      {/* Session Statistics */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-4">Session Statistics</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* By Question Type */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">By Type</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(sessionStats.byType).map(([type, stats]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600">{type}:</span>
                  <span className="font-medium">
                    {stats.correct}/{stats.attempted} 
                    ({stats.attempted > 0 ? Math.round((stats.correct/stats.attempted)*100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Exam Area */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">By Area</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(sessionStats.byArea).map(([area, stats]) => (
                <div key={area} className="flex justify-between">
                  <span className="text-gray-600">{area}:</span>
                  <span className="font-medium">
                    {stats.correct}/{stats.attempted}
                    ({stats.attempted > 0 ? Math.round((stats.correct/stats.attempted)*100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Stats */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Time Analysis</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">
                  {Math.floor(sessionStats.totalTime / 60)}m {sessionStats.totalTime % 60}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg/Question:</span>
                <span className="font-medium">
                  {sessionStats.attempted > 0 
                    ? Math.round(sessionStats.totalTime / sessionStats.attempted) 
                    : 0}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveStudyView;