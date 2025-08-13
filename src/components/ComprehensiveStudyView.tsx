import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Question } from './Question/Question';
import EnhancedQuestion from './Question/EnhancedQuestion';
import MasterQuestion from './Question/MasterQuestion';
import SequenceQuestion from './Question/QuestionTypes/SequenceQuestion';
import HotspotQuestion from './Question/QuestionTypes/HotspotQuestion';
import { supabase } from '@/lib/supabase';
import { examTopics, getMicrosoftLearnUrl } from '@/data/exam-topics';
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
  const [questionKey, setQuestionKey] = useState(0); // Force re-render of questions
  const [showHelp, setShowHelp] = useState(false);
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
        const questionArea = q.examArea?.toLowerCase() || q.exam_area?.toLowerCase() || '';
        const questionText = (q.question_text || q.question || '').toLowerCase();
        const topic = q.topic?.toLowerCase() || '';
        
        // Check if question matches the exam area
        const areaMatch = questionArea.includes(filters.examArea) ||
                         topic.includes(filters.examArea) ||
                         questionText.includes(filters.examArea);
        
        if (!areaMatch) return false;
      }

      // Filter by question type
      if (filters.questionType !== 'all') {
        const qType = (q.type || q.question_type || 'multiplechoice').toLowerCase();
        if (qType !== filters.questionType.toLowerCase()) {
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

      // Filter by topic - enhanced search
      if (filters.topic !== 'all' && filters.topic !== '') {
        const searchTerm = filters.topic.toLowerCase();
        const topic = q.topic?.toLowerCase() || '';
        const tags = q.tags?.map((t: any) => t.toLowerCase()).join(' ') || '';
        const questionText = (q.question_text || q.question || '').toLowerCase();
        const explanation = JSON.stringify(q.explanation || {}).toLowerCase();
        
        // Search in multiple fields for better matching
        const matches = topic.includes(searchTerm) ||
                       tags.includes(searchTerm) ||
                       questionText.includes(searchTerm) ||
                       explanation.includes(searchTerm);
        
        if (!matches) return false;
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

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionKey(prev => prev + 1); // Force re-render with new key
      window.scrollTo(0, 0); // Scroll to top
    }
  }, [currentQuestionIndex, filteredQuestions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionKey(prev => prev + 1); // Force re-render with new key
      window.scrollTo(0, 0); // Scroll to top
    }
  }, [currentQuestionIndex]);

  const renderQuestion = useCallback((question: any) => {
    const questionType = question.type || question.question_type || 'multiplechoice';

    // Add key prop to force re-render when moving between questions
    const commonProps = {
      key: `question-${questionKey}`,
      question: question,
      onAnswer: handleAnswer,
      showExplanation: true
    };

    // Check for special question features
    if (question.explanation?.question_breakdown) {
      return <MasterQuestion {...commonProps} />;
    }
    
    if (question.explanation?.deep_dive) {
      return <EnhancedQuestion {...commonProps} />;
    }

    // Render based on question type
    switch (questionType) {
      case 'sequence':
      case 'dragdrop':
        return <SequenceQuestion key={`sequence-${questionKey}`} question={question} onAnswer={handleAnswer} />;
      
      case 'hotspot':
        return <HotspotQuestion key={`hotspot-${questionKey}`} question={question} onAnswer={handleAnswer} />;
      
      case 'multiplechoice':
      case 'yesno':
      default:
        return <Question {...commonProps} />;
    }
  }, [questionKey, handleAnswer]);

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
                <label className="form-label">
                  Exam Area
                </label>
                <select
                  value={filters.examArea}
                  onChange={(e) => setFilters({...filters, examArea: e.target.value as any})}
                  className="form-select"
                >
                  <option value="all">All Areas ({questions.length})</option>
                  {examTopics.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.weight})
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Type Filter */}
              <div>
                <label className="form-label">
                  Question Type
                </label>
                <select
                  value={filters.questionType}
                  onChange={(e) => setFilters({...filters, questionType: e.target.value as any})}
                  className="form-select"
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
                <label className="form-label">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value as any})}
                  className="form-select"
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
                <label className="form-label">
                  Topic Search
                </label>
                <input
                  type="text"
                  value={filters.topic === 'all' ? '' : filters.topic}
                  onChange={(e) => setFilters({...filters, topic: e.target.value || 'all'})}
                  placeholder="e.g., integration, security"
                  className="form-input"
                />
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-gray-800">Quick filters:</span>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  <span className="text-lg">📚</span> 
                  <span>Microsoft Learn</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
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
          </div>
        )}
      </div>

      {/* Microsoft Learn Resources Section */}
      {showHelp && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-2xl p-6 border-4 border-blue-400">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg">Microsoft Learn Resources</span>
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Main Study Resources */}
            <a
              href="https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg border-2 border-blue-400 hover:border-blue-600 hover:shadow-lg transition-all"
            >
              <div className="font-black text-blue-900 mb-2">📖 Official PL-600 Exam Page</div>
              <div className="text-sm text-gray-700">Complete exam details, skills measured, and registration</div>
            </a>
            
            <a
              href="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg border-2 border-purple-400 hover:border-purple-600 hover:shadow-lg transition-all"
            >
              <div className="font-black text-purple-900 mb-2">📋 Official Study Guide</div>
              <div className="text-sm text-gray-700">Detailed breakdown of all exam objectives</div>
            </a>
            
            <a
              href="https://learn.microsoft.com/en-us/training/browse/?products=power-platform&roles=solution-architect"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg border-2 border-green-400 hover:border-green-600 hover:shadow-lg transition-all"
            >
              <div className="font-black text-green-900 mb-2">🎓 Learning Paths</div>
              <div className="text-sm text-gray-700">Free Microsoft training modules for Solution Architects</div>
            </a>
          </div>
          
          {/* Topic-Specific Resources */}
          <div className="bg-white/90 p-4 rounded-lg border-2 border-orange-400">
            <h4 className="font-black text-orange-900 mb-3">🎯 Topic-Specific Resources</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="font-bold text-gray-800 mb-2">Architecture & Design</div>
                <div className="space-y-2">
                  <a href="https://learn.microsoft.com/en-us/power-platform/well-architected/" target="_blank" rel="noopener noreferrer" 
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Well-Architected Framework</a>
                  <a href="https://learn.microsoft.com/en-us/power-platform/guidance/architecture/" target="_blank" rel="noopener noreferrer"
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Architecture Best Practices</a>
                  <a href="https://learn.microsoft.com/en-us/power-platform/guidance/adoption/" target="_blank" rel="noopener noreferrer"
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Adoption & Governance</a>
                </div>
              </div>
              
              <div>
                <div className="font-bold text-gray-800 mb-2">Integration & Security</div>
                <div className="space-y-2">
                  <a href="https://learn.microsoft.com/en-us/power-platform/admin/security/" target="_blank" rel="noopener noreferrer"
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Security Model</a>
                  <a href="https://learn.microsoft.com/en-us/power-platform/developer/" target="_blank" rel="noopener noreferrer"
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Developer Resources</a>
                  <a href="https://learn.microsoft.com/en-us/connectors/" target="_blank" rel="noopener noreferrer"
                     className="block text-blue-600 hover:text-blue-800 font-medium text-sm">→ Connectors Documentation</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Topic Resources */}
          {filters.topic !== 'all' && (
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg border-2 border-yellow-500">
              <h4 className="font-black text-gray-900 mb-2">🔍 Resources for: {filters.topic}</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={getMicrosoftLearnUrl(filters.topic)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Search Microsoft Learn for "{filters.topic}"
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study Header with Statistics */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Comprehensive Study Mode</h2>
            <p className="text-sm md:text-base font-medium text-gray-700 mt-1">
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
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          ← Previous
        </button>

        {/* Question Jump */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Jump to:</span>
          <input
            type="number"
            min="1"
            max={filteredQuestions.length}
            value={currentQuestionIndex + 1}
            onChange={(e) => {
              const idx = parseInt(e.target.value) - 1;
              if (idx >= 0 && idx < filteredQuestions.length) {
                setCurrentQuestionIndex(idx);
                setQuestionKey(prev => prev + 1); // Force re-render when jumping
              }
            }}
            className="w-20 px-3 py-2 border-2 border-gray-400 rounded-lg text-center font-bold text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === filteredQuestions.length - 1}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
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