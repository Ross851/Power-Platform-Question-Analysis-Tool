import React, { useState } from 'react';

interface CaseStudyQuestionProps {
  question: {
    question_number: string;
    question_text: string;
    sub_questions: Array<{
      id: string;
      question: string;
      options: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
    }>;
    explanation?: {
      overall?: string;
      details?: Record<string, string>;
    };
    difficulty?: string;
    tags?: string[];
  };
  onAnswer: (answer: any, isCorrect: boolean, timeSpent: number) => void;
}

export const CaseStudyQuestion: React.FC<CaseStudyQuestionProps> = ({ question, onAnswer }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  const handleOptionSelect = (subQuestionId: string, optionId: string) => {
    if (!submitted) {
      setAnswers({
        ...answers,
        [subQuestionId]: optionId
      });
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Check if all answers are correct
    const isCorrect = question.sub_questions.every(subQ => {
      const selectedAnswer = answers[subQ.id];
      const correctOption = subQ.options.find(opt => opt.isCorrect);
      return selectedAnswer === correctOption?.id;
    });
    
    setSubmitted(true);
    setShowExplanation(true);
    onAnswer(answers, isCorrect, timeSpent);
  };

  const allAnswered = question.sub_questions.every(subQ => answers[subQ.id]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">
            {question.question_number} - CASE STUDY
          </span>
          {question.difficulty && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              question.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty.toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Case Study Background */}
        <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-lg mb-2">Scenario</h3>
          <div className="text-gray-800 whitespace-pre-wrap">
            {question.question_text}
          </div>
        </div>
      </div>

      {/* Sub Questions */}
      <div className="space-y-6">
        {question.sub_questions.map((subQ, index) => (
          <div key={subQ.id} className="border-t pt-4 first:border-t-0 first:pt-0">
            <h4 className="font-bold text-gray-900 mb-3">
              Question {index + 1}: {subQ.question}
            </h4>
            
            <div className="space-y-2">
              {subQ.options.map((option) => {
                const isSelected = answers[subQ.id] === option.id;
                const showCorrect = submitted && option.isCorrect;
                const showIncorrect = submitted && isSelected && !option.isCorrect;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(subQ.id, option.id)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showCorrect ? 'border-green-500 bg-green-50' :
                      showIncorrect ? 'border-red-500 bg-red-50' :
                      isSelected ? 'border-blue-500 bg-blue-50' :
                      'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start">
                      <span className="font-bold mr-3 text-gray-700">
                        {option.id.toUpperCase()}.
                      </span>
                      <span className={`flex-1 ${
                        showCorrect ? 'text-green-800' :
                        showIncorrect ? 'text-red-800' :
                        'text-gray-800'
                      }`}>
                        {option.text}
                      </span>
                      {submitted && (
                        <span className="ml-2">
                          {showCorrect && '✓'}
                          {showIncorrect && '✗'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`mt-6 w-full py-3 px-6 rounded-lg font-bold transition-all ${
            allAnswered
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {allAnswered ? 'Submit All Answers' : `Answer All Questions (${
            Object.keys(answers).length
          }/${question.sub_questions.length})`}
        </button>
      )}

      {/* Explanation */}
      {submitted && showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-3 text-blue-900">
            Case Study Analysis
          </h3>
          
          {question.explanation.overall && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Overall Explanation:</h4>
              <p className="text-gray-800">{question.explanation.overall}</p>
            </div>
          )}
          
          {question.explanation.details && (
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Detailed Analysis:</h4>
              {Object.entries(question.explanation.details).map(([key, value]) => (
                <div key={key} className="pl-4">
                  <span className="font-medium text-gray-700 capitalize">{key}:</span>
                  <span className="ml-2 text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseStudyQuestion;