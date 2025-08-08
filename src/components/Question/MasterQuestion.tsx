import React, { useState } from 'react';
import { Question as QuestionType } from '@/types/question';

interface MasterQuestionProps {
  question: QuestionType;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showExplanation?: boolean;
}

export const MasterQuestion: React.FC<MasterQuestionProps> = ({ 
  question, 
  onAnswer, 
  showExplanation = true 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'breakdown' | 'deepdive'>('breakdown');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['key_phrases']));

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

  const breakdown = question.explanation.question_breakdown;
  const deepDive = question.explanation.deep_dive;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Question Header with Strategy Alert */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
              {question.question_number}
            </span>
            <span className="ml-3 text-sm font-medium">
              ⏱️ Recommended: {breakdown?.exam_strategy.time_allocation}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium mb-1">
              {breakdown?.exam_strategy.priority_level} Priority
            </div>
            <div className="text-xs opacity-90">
              {breakdown?.exam_strategy.scoring_weight}
            </div>
          </div>
        </div>
      </div>

      {/* Question Text with Key Phrase Highlighting */}
      <div className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
          {isAnswered && breakdown ? (
            <span>
              {question.question_text.split(' ').map((word, idx) => {
                const isKeyPhrase = breakdown.key_phrases.some(kp => 
                  question.question_text.includes(kp.phrase) && 
                  kp.phrase.includes(word)
                );
                return (
                  <span key={idx}>
                    {isKeyPhrase ? (
                      <span className="bg-yellow-200 px-1 rounded font-bold">{word}</span>
                    ) : (
                      word
                    )}
                    {' '}
                  </span>
                );
              })}
            </span>
          ) : (
            question.question_text
          )}
        </h3>

        {/* Pre-Answer Strategy Tips */}
        {!isAnswered && breakdown && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <h4 className="font-bold text-blue-900 mb-2">🎯 Before You Answer - Look For:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {breakdown.answer_validation.must_have_elements.slice(0, 3).map((element, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{element}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Answer Options with Distractor Analysis */}
      <div className="p-6">
        <div className="space-y-3 mb-6">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect || option.id === question.correct_answer;
            const distractor = breakdown?.distractors_analysis.find(d => 
              d.option.includes(option.id.toUpperCase())
            );
            
            let optionClass = 'border-2 transition-all duration-300 transform hover:scale-[1.01]';
            
            if (!isAnswered) {
              optionClass += ' border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer';
            } else {
              if (isSelected && isCorrect) {
                optionClass += ' border-green-500 bg-green-50 ring-4 ring-green-200';
              } else if (isSelected && !isCorrect) {
                optionClass += ' border-red-500 bg-red-50 ring-4 ring-red-200';
              } else if (isCorrect) {
                optionClass += ' border-green-500 bg-green-50';
              } else {
                optionClass += ' border-gray-200 bg-gray-50 opacity-60';
              }
            }
            
            return (
              <div key={option.id}>
                <div
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
                
                {/* Distractor Analysis for Wrong Answers */}
                {isAnswered && distractor && !isCorrect && (
                  <div className="mt-2 ml-8 p-3 bg-orange-50 border-l-4 border-orange-300 rounded text-sm">
                    <div className="font-semibold text-orange-900 mb-1">
                      ⚠️ Why This Seemed Right:
                    </div>
                    <p className="text-orange-800 mb-2">{distractor.why_tempting}</p>
                    <div className="font-semibold text-red-900 mb-1">🚩 Red Flags:</div>
                    <ul className="text-red-800">
                      {distractor.red_flags.map((flag, idx) => (
                        <li key={idx}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Analysis Section */}
      {isAnswered && showExplanation && (
        <div className="border-t-2 border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b bg-gray-100">
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'breakdown' 
                  ? 'bg-white text-indigo-600 border-b-4 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Question Breakdown & Strategy
            </button>
            <button
              onClick={() => setActiveTab('deepdive')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'deepdive' 
                  ? 'bg-white text-purple-600 border-b-4 border-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎓 Deep Dive & Real World
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'breakdown' && breakdown && (
              <div className="space-y-6">
                {/* Key Phrases Analysis */}
                <div>
                  <button
                    onClick={() => toggleSection('key_phrases')}
                    className="w-full flex justify-between items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <span className="font-bold text-indigo-900 text-lg">
                      🔍 Key Phrases to Spot
                    </span>
                    <span className="text-2xl">{expandedSections.has('key_phrases') ? '−' : '+'}</span>
                  </button>
                  {expandedSections.has('key_phrases') && (
                    <div className="mt-4 space-y-3">
                      {breakdown.key_phrases.map((kp, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                          <div className="font-bold text-indigo-900 mb-1">
                            "{kp.phrase}"
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Why Important:</strong> {kp.significance}
                          </div>
                          <div className="text-sm text-indigo-600">
                            <strong>Look For:</strong> {kp.what_to_look_for}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Critical Thinking Framework */}
                <div>
                  <button
                    onClick={() => toggleSection('critical')}
                    className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all border-2 border-purple-400 shadow-lg"
                  >
                    <span className="font-black text-purple-900 text-xl">
                      🧠 Critical Thinking Framework
                    </span>
                    <span className="text-2xl">{expandedSections.has('critical') ? '−' : '+'}</span>
                  </button>
                  {expandedSections.has('critical') && breakdown.critical_thinking && (
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <h5 className="font-bold text-purple-900 mb-2">Assumptions to Validate</h5>
                        <ul className="space-y-1 text-sm">
                          {breakdown.critical_thinking.assumptions_to_validate.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">?</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <h5 className="font-bold text-purple-900 mb-2">Constraints to Consider</h5>
                        <ul className="space-y-1 text-sm">
                          {breakdown.critical_thinking.constraints_to_consider.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">⚡</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <h5 className="font-bold text-purple-900 mb-2">Trade-offs to Evaluate</h5>
                        <ul className="space-y-1 text-sm">
                          {breakdown.critical_thinking.trade_offs_to_evaluate.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">⚖️</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <h5 className="font-bold text-purple-900 mb-2">Stakeholders Impacted</h5>
                        <ul className="space-y-1 text-sm">
                          {breakdown.critical_thinking.stakeholders_impacted.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">👥</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Validation Checklist */}
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-600 shadow-2xl">
                  <h4 className="font-black text-green-900 mb-4 text-xl flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-lg">Answer Validation Checklist</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/80 p-4 rounded-lg border-2 border-green-400">
                      <h5 className="font-black text-green-900 mb-3 text-lg bg-green-200 px-3 py-1 rounded inline-block">✓ Must Have Elements:</h5>
                      <ul className="space-y-2">
                        {breakdown.answer_validation.must_have_elements.map((element, idx) => (
                          <li key={idx} className="flex items-start bg-green-50 p-2 rounded-lg border-l-4 border-green-500">
                            <span className="text-green-700 mr-2 text-lg font-black">✓</span>
                            <span className="font-semibold text-gray-900">{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg border-2 border-red-400">
                      <h5 className="font-black text-red-900 mb-3 text-lg bg-red-200 px-3 py-1 rounded inline-block">✗ Automatic Eliminators:</h5>
                      <ul className="space-y-2">
                        {breakdown.answer_validation.automatic_eliminators.map((element, idx) => (
                          <li key={idx} className="flex items-start bg-red-50 p-2 rounded-lg border-l-4 border-red-500">
                            <span className="text-red-700 mr-2 text-lg font-black">✗</span>
                            <span className="font-semibold text-gray-900">{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Exam Strategy Box */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-xl border-4 border-orange-500 shadow-2xl">
                  <h4 className="font-black text-orange-900 mb-4 text-xl flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-lg">Exam Strategy & Related Topics</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white/90 p-4 rounded-lg border-2 border-orange-300">
                      <span className="font-black text-orange-900 text-lg">🔄 Common Variations:</span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {breakdown.exam_strategy.common_variations.map((variation, idx) => (
                          <span key={idx} className="px-4 py-2 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full font-bold text-gray-900 border-2 border-orange-400 shadow-md">
                            {variation}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/90 p-4 rounded-lg border-2 border-orange-300 mt-3">
                      <span className="font-black text-orange-900 text-lg">📖 Related Questions to Study:</span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {breakdown.exam_strategy.related_questions.map((related, idx) => (
                          <span key={idx} className="px-4 py-2 bg-gradient-to-r from-orange-200 to-red-200 rounded-full font-bold text-gray-900 border-2 border-red-400 shadow-md hover:shadow-lg transition-all cursor-pointer">
                            {related}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deepdive' && deepDive && (
              <div className="space-y-6">
                {/* All the deep dive content from EnhancedQuestion component */}
                {/* ... (keeping it shorter for space, but would include all sections) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="font-bold text-indigo-900 mb-4 text-lg">🎯 Why This Matters</h4>
                  <p className="text-gray-700">{deepDive.why_it_matters}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-4 text-lg">🏢 Real World Scenario</h4>
                  <p className="text-gray-700">{deepDive.real_world_scenario}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-4 text-lg">💎 Expert Tip</h4>
                  <p className="text-gray-700 italic">{deepDive.expert_tip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterQuestion;