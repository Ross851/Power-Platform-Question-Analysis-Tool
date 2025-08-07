import React, { useState } from 'react';
import { Question as QuestionType } from '@/types/question';

interface EnhancedQuestionProps {
  question: QuestionType;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showExplanation?: boolean;
}

export const EnhancedQuestion: React.FC<EnhancedQuestionProps> = ({ 
  question, 
  onAnswer, 
  showExplanation = true 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleAnswerSelect = (optionId: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionId);
    setIsAnswered(true);
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const selectedOption = question.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOption?.isCorrect || optionId === question.correct_answer;
    
    onAnswer(optionId, isCorrect, timeSpent);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getDifficultyInfo = (difficulty: number) => {
    const configs = {
      1: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Foundation', icon: '🌱' },
      2: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Intermediate', icon: '📘' },
      3: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Advanced', icon: '⚡' },
      4: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Expert', icon: '🔥' },
      5: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Architect', icon: '🏗️' }
    };
    return configs[difficulty as keyof typeof configs] || configs[3];
  };

  const difficultyInfo = getDifficultyInfo(question.difficulty);
  const deepDive = question.explanation.deep_dive;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
              {question.question_number}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${difficultyInfo.color} border`}>
              {difficultyInfo.icon} {difficultyInfo.label}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {question.exam_area.charAt(0).toUpperCase() + question.exam_area.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Estimated time</div>
            <div className="text-xl font-bold">{Math.floor(question.estimated_time / 60)}:{(question.estimated_time % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {question.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
            {question.question_text}
          </h3>
          
          {/* Scenario Context Indicator */}
          {question.question_text.length > 200 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>📊 Complex Scenario:</strong> This question tests your ability to analyze multi-faceted 
                architectural decisions with real-world constraints.
              </p>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect || option.id === question.correct_answer;
            
            let optionClass = 'border-2 transition-all duration-300 transform hover:scale-[1.02]';
            
            if (!isAnswered) {
              optionClass += ' border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
            } else {
              if (isSelected && isCorrect) {
                optionClass += ' border-green-500 bg-green-50 ring-2 ring-green-300';
              } else if (isSelected && !isCorrect) {
                optionClass += ' border-red-500 bg-red-50 ring-2 ring-red-300';
              } else if (isCorrect) {
                optionClass += ' border-green-500 bg-green-50';
              } else {
                optionClass += ' border-gray-200 bg-gray-50 opacity-60';
              }
            }
            
            return (
              <div
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                className={`p-4 rounded-lg ${optionClass}`}
              >
                <div className="flex items-start">
                  <span className="font-bold mr-3 text-lg text-gray-700 mt-0.5">
                    {option.id.toUpperCase()}.
                  </span>
                  <span className="text-gray-800 flex-1">{option.text}</span>
                  {isAnswered && (
                    <span className="ml-3 text-2xl">
                      {isCorrect && '✅'}
                      {isSelected && !isCorrect && '❌'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Basic Explanation */}
        {isAnswered && showExplanation && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                💡 Explanation
              </h4>
              
              {/* Correct Answer Explanation */}
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-green-900 font-semibold mb-2">
                  ✅ Why {typeof question.correct_answer === 'string' ? question.correct_answer.toUpperCase() : 'this answer'} is correct:
                </p>
                <p className="text-gray-700">{question.explanation.correct}</p>
              </div>
              
              {/* Incorrect Answer Explanation */}
              {selectedAnswer && selectedAnswer !== question.correct_answer && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-red-900 font-semibold mb-2">
                    ❌ Why {selectedAnswer.toUpperCase()} is incorrect:
                  </p>
                  <p className="text-gray-700">
                    {question.explanation.incorrect[selectedAnswer]}
                  </p>
                </div>
              )}
            </div>

            {/* Deep Dive Section */}
            {deepDive && (
              <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDeepDive(!showDeepDive)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-left flex justify-between items-center hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  <span className="flex items-center">
                    🎓 Deep Dive Analysis - Master the Concepts
                  </span>
                  <span className="text-2xl">{showDeepDive ? '−' : '+'}</span>
                </button>
                
                {showDeepDive && (
                  <div className="p-6 bg-gradient-to-b from-purple-50 to-white">
                    {/* Why It Matters */}
                    <div className="mb-6">
                      <h5 className="font-bold text-purple-900 mb-3 text-lg flex items-center">
                        🎯 Why This Matters
                      </h5>
                      <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-purple-100">
                        {deepDive.why_it_matters}
                      </p>
                    </div>

                    {/* Real World Scenario */}
                    <div className="mb-6">
                      <h5 className="font-bold text-purple-900 mb-3 text-lg flex items-center">
                        🏢 Real-World Scenario
                      </h5>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed">
                          {deepDive.real_world_scenario}
                        </p>
                      </div>
                    </div>

                    {/* Common Mistakes */}
                    <div className="mb-6">
                      <button
                        onClick={() => toggleSection('mistakes')}
                        className="font-bold text-purple-900 mb-3 text-lg flex items-center cursor-pointer hover:text-purple-700"
                      >
                        ⚠️ Common Mistakes to Avoid
                        <span className="ml-2 text-sm">{expandedSections.has('mistakes') ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections.has('mistakes') && (
                        <ul className="space-y-2">
                          {deepDive.common_mistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2 mt-1">•</span>
                              <span className="text-gray-700 bg-red-50 px-3 py-1 rounded-lg flex-1">
                                {mistake}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Best Practices */}
                    <div className="mb-6">
                      <button
                        onClick={() => toggleSection('practices')}
                        className="font-bold text-purple-900 mb-3 text-lg flex items-center cursor-pointer hover:text-purple-700"
                      >
                        ✨ Best Practices
                        <span className="ml-2 text-sm">{expandedSections.has('practices') ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections.has('practices') && (
                        <ul className="space-y-2">
                          {deepDive.best_practices.map((practice, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-1">✓</span>
                              <span className="text-gray-700 bg-green-50 px-3 py-1 rounded-lg flex-1">
                                {practice}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* When to Use */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h6 className="font-bold text-green-700 mb-2">✅ When to Use</h6>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-lg text-sm">
                          {deepDive.when_to_use}
                        </p>
                      </div>
                      <div>
                        <h6 className="font-bold text-red-700 mb-2">❌ When NOT to Use</h6>
                        <p className="text-gray-700 bg-red-50 p-3 rounded-lg text-sm">
                          {deepDive.when_not_to_use}
                        </p>
                      </div>
                    </div>

                    {/* Expert Tip */}
                    <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
                      <h5 className="font-bold text-orange-900 mb-2 flex items-center">
                        💎 Expert Tip
                      </h5>
                      <p className="text-gray-700 italic">
                        {deepDive.expert_tip}
                      </p>
                    </div>

                    {/* Technical Deep Dives */}
                    <div className="space-y-4">
                      {deepDive.architecture_considerations && (
                        <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
                          <summary className="font-bold text-gray-900">🏗️ Architecture Considerations</summary>
                          <p className="mt-3 text-gray-700">{deepDive.architecture_considerations}</p>
                        </details>
                      )}
                      
                      {deepDive.security_implications && (
                        <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
                          <summary className="font-bold text-gray-900">🔒 Security Implications</summary>
                          <p className="mt-3 text-gray-700">{deepDive.security_implications}</p>
                        </details>
                      )}
                      
                      {deepDive.performance_impact && (
                        <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
                          <summary className="font-bold text-gray-900">⚡ Performance Impact</summary>
                          <p className="mt-3 text-gray-700">{deepDive.performance_impact}</p>
                        </details>
                      )}
                      
                      {deepDive.cost_analysis && (
                        <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
                          <summary className="font-bold text-gray-900">💰 Cost Analysis</summary>
                          <p className="mt-3 text-gray-700">{deepDive.cost_analysis}</p>
                        </details>
                      )}
                    </div>

                    {/* Related Concepts */}
                    {deepDive.related_concepts && (
                      <div className="mt-6">
                        <h5 className="font-bold text-purple-900 mb-3">🔗 Related Concepts</h5>
                        <div className="flex flex-wrap gap-2">
                          {deepDive.related_concepts.map((concept, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Learn More Link */}
            {question.microsoft_learn_url && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <a
                  href={question.microsoft_learn_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-medium flex items-center"
                >
                  📚 Deep dive into Microsoft Learn documentation
                  <span className="ml-2">→</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuestion;