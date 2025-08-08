import React, { useState } from 'react';
import { getMicrosoftLearnUrl } from '@/data/exam-topics';
import { Question as QuestionType } from '@/types/question';

interface QuestionProps {
  question: QuestionType;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showExplanation?: boolean;
}

export const Question: React.FC<QuestionProps> = ({ 
  question, 
  onAnswer, 
  showExplanation = false 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);

  const handleAnswerSelect = (optionId: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionId);
    setIsAnswered(true);
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const selectedOption = question.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOption?.isCorrect || optionId === question.correct_answer;
    
    onAnswer(optionId, isCorrect, timeSpent);
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors[3];
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Very Hard'
    };
    return labels[difficulty as keyof typeof labels] || 'Medium';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-500">
            {question.question_number}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {question.exam_area}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Est. time: {question.estimated_time}s
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {question.question_text}
        </h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {question.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hint Button */}
      {!isAnswered && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800"
        >
          💡 Need a hint?
        </button>
      )}

      {/* Hint Display */}
      {showHint && !isAnswered && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💡 Hint: Consider the best practices for {question.tags[0]} in Power Platform.
          </p>
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.isCorrect || option.id === question.correct_answer;
          
          let optionClass = 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
          
          if (isAnswered) {
            if (isSelected && isCorrect) {
              optionClass = 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrect) {
              optionClass = 'border-red-500 bg-red-50';
            } else if (isCorrect) {
              optionClass = 'border-green-500 bg-green-50';
            } else {
              optionClass = 'border-gray-300 bg-gray-50 cursor-not-allowed';
            }
          }
          
          return (
            <div
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              className={`p-4 rounded-lg font-medium transition-all ${optionClass}`}
            >
              <div className="flex items-start">
                <span className="font-semibold mr-3 text-gray-700">
                  {option.id.toUpperCase()}.
                </span>
                <span className="text-gray-800">{option.text}</span>
                {isAnswered && (
                  <span className="ml-auto">
                    {isCorrect && '✅'}
                    {isSelected && !isCorrect && '❌'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {isAnswered && showExplanation && (
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 shadow-lg">
          <h4 className="font-black text-xl text-gray-900 mb-3">Explanation:</h4>
          
          {/* Correct Answer Explanation */}
          <div className="mb-4 p-3 bg-green-100 rounded-lg border-2 border-green-400">
            <p className="text-green-900 font-black mb-2">
              ✅ Why {typeof question.correct_answer === 'string' ? question.correct_answer.toUpperCase() : 'this answer'} is correct:
            </p>
            <p className="text-gray-900 font-medium">{question.explanation.correct}</p>
          </div>
          
          {/* Incorrect Answer Explanations */}
          {selectedAnswer && selectedAnswer !== question.correct_answer && (
            <div className="mb-4 p-3 bg-red-100 rounded-lg border-2 border-red-400">
              <p className="text-red-900 font-black mb-2">
                ❌ Why {selectedAnswer.toUpperCase()} is incorrect:
              </p>
              <p className="text-gray-900 font-medium">
                {question.explanation.incorrect[selectedAnswer]}
              </p>
            </div>
          )}
          
          {/* Microsoft Learn Links */}
          <div className="mt-4 pt-4 border-t-2 border-blue-300 bg-blue-50 p-4 rounded-lg">
            <h5 className="font-black text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span>Study Resources</span>
            </h5>
            <div className="space-y-2">
              {question.microsoft_learn_url && (
                <a
                  href={question.microsoft_learn_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  🔗 Direct Microsoft Learn Article
                </a>
              )}
              
              {/* Topic-based Microsoft Learn search */}
              {'topic' in question && (question as any).topic && (
                <a
                  href={getMicrosoftLearnUrl((question as any).topic as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  🔍 Search: {(question as any).topic}
                </a>
              )}
              
              {/* General PL-600 resources */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a
                  href="https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center bg-gray-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-all text-sm"
                >
                  PL-600 Home
                </a>
                <a
                  href="https://learn.microsoft.com/en-us/training/browse/?products=power-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center bg-gray-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-all text-sm"
                >
                  All Training
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;