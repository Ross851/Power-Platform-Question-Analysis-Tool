import React, { useState, useEffect } from 'react';
import { Question } from './Question/Question';
import EnhancedQuestion from './Question/EnhancedQuestion';
import MasterQuestion from './Question/MasterQuestion';
import { supabase } from '@/lib/supabase';
import type { Question as QuestionType } from '@/types/question';
import questionDataJson from '@/data/questions.json';
import enhancedQuestionsJson from '@/data/enhanced-questions.json';
import masterQuestionsJson from '@/data/questions-with-breakdown.json';

export const StudyView: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    totalTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [useEnhanced, setUseEnhanced] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      // First try to load from Supabase
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('question_number');

      if (data && data.length > 0) {
        setQuestions(data as unknown as QuestionType[]);
      } else {
        // Fallback to local JSON data - use all question types for comprehensive learning
        const masterData = (masterQuestionsJson as any).questions as QuestionType[];
        const enhancedData = (enhancedQuestionsJson as any).questions as QuestionType[];
        const basicData = (questionDataJson as any).questions as QuestionType[];
        // Combine all sets - master questions first for best learning experience
        setQuestions([...masterData, ...enhancedData, ...basicData]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to local JSON data
      const masterData = (masterQuestionsJson as any).questions as QuestionType[];
      const enhancedData = (enhancedQuestionsJson as any).questions as QuestionType[];
      const basicData = (questionDataJson as any).questions as QuestionType[];
      setQuestions([...masterData, ...enhancedData, ...basicData]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (_answer: string, isCorrect: boolean, timeSpent: number) => {
    // Update session stats
    setSessionStats(prev => ({
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalTime: prev.totalTime + timeSpent
    }));

    // Save progress to Supabase if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user && questions[currentQuestionIndex].id) {
      try {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          question_id: questions[currentQuestionIndex].id,
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No questions available. Please check your connection.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const accuracy = sessionStats.attempted > 0 
    ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) 
    : 0;

  return (
    <div>
      {/* Study Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Study Mode</h2>
            {currentQuestion?.explanation?.deep_dive && (
              <button
                onClick={() => setUseEnhanced(!useEnhanced)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  useEnhanced 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {useEnhanced ? '🎓 Deep Analysis ON' : '📝 Basic Mode'}
              </button>
            )}
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="bg-green-50 px-3 py-1 rounded">
              Correct: {sessionStats.correct}/{sessionStats.attempted}
            </div>
            <div className="bg-purple-50 px-3 py-1 rounded">
              Accuracy: {accuracy}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Display - Use appropriate component based on question complexity */}
      {currentQuestion.explanation?.question_breakdown ? (
        <MasterQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          showExplanation={true}
        />
      ) : currentQuestion.explanation?.deep_dive && useEnhanced ? (
        <EnhancedQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          showExplanation={true}
        />
      ) : (
        <Question
          question={currentQuestion}
          onAnswer={handleAnswer}
          showExplanation={true}
        />
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-md font-medium ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          ← Previous
        </button>

        <div className="flex space-x-2">
          {/* Question Number Indicators */}
          {questions.slice(Math.max(0, currentQuestionIndex - 2), Math.min(questions.length, currentQuestionIndex + 3)).map((_, idx) => {
            const actualIndex = Math.max(0, currentQuestionIndex - 2) + idx;
            return (
              <button
                key={actualIndex}
                onClick={() => setCurrentQuestionIndex(actualIndex)}
                className={`w-8 h-8 rounded-full ${
                  actualIndex === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {actualIndex + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`px-4 py-2 rounded-md font-medium ${
            currentQuestionIndex === questions.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next →
        </button>
      </div>

      {/* Study Tips */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Study Tip</h3>
        <p className="text-sm text-yellow-700">
          Take your time to understand each question. The explanations are designed to help you learn the concepts, not just memorize answers.
        </p>
      </div>
    </div>
  );
};

export default StudyView;