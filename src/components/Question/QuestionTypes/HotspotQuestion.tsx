import React, { useState } from 'react';

interface HotspotArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isCorrect: boolean;
}

interface HotspotQuestionProps {
  question: {
    id: number;
    question_text: string;
    image_url: string;
    hotspots: HotspotArea[];
    correct_spots: string[];
    max_selections?: number;
    explanation?: {
      correct: string;
      spot_explanations?: Record<string, string>;
    };
  };
  onAnswer: (answer: string[], isCorrect: boolean, timeSpent: number) => void;
}

export const HotspotQuestion: React.FC<HotspotQuestionProps> = ({
  question,
  onAnswer,
}) => {
  const [selectedSpots, setSelectedSpots] = useState<Set<string>>(new Set());
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);

  const maxSelections = question.max_selections || question.correct_spots.length;

  const handleSpotClick = (spotId: string) => {
    if (isAnswered) return;

    setSelectedSpots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spotId)) {
        newSet.delete(spotId);
      } else {
        if (newSet.size < maxSelections) {
          newSet.add(spotId);
        }
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (isAnswered) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const selectedArray = Array.from(selectedSpots);
    const correctSet = new Set(question.correct_spots);
    
    const isCorrect = 
      selectedArray.length === question.correct_spots.length &&
      selectedArray.every(spot => correctSet.has(spot));
    
    setIsAnswered(true);
    onAnswer(selectedArray, isCorrect, timeSpent);
  };

  const resetSelection = () => {
    setSelectedSpots(new Set());
    setIsAnswered(false);
  };

  const getSpotColor = (spot: HotspotArea) => {
    if (!isAnswered) {
      if (selectedSpots.has(spot.id)) {
        return 'rgba(59, 130, 246, 0.5)'; // Blue for selected
      }
      if (hoveredSpot === spot.id) {
        return 'rgba(59, 130, 246, 0.2)'; // Light blue for hover
      }
      return 'rgba(156, 163, 175, 0.2)'; // Gray for unselected
    }
    
    // After answer
    const isSelected = selectedSpots.has(spot.id);
    const isCorrect = question.correct_spots.includes(spot.id);
    
    if (isSelected && isCorrect) {
      return 'rgba(34, 197, 94, 0.5)'; // Green - correctly selected
    }
    if (isSelected && !isCorrect) {
      return 'rgba(239, 68, 68, 0.5)'; // Red - incorrectly selected
    }
    if (!isSelected && isCorrect) {
      return 'rgba(251, 146, 60, 0.5)'; // Orange - missed correct spot
    }
    return 'rgba(156, 163, 175, 0.1)'; // Light gray - correctly not selected
  };

  const getSpotBorder = (spot: HotspotArea) => {
    if (!isAnswered) {
      return selectedSpots.has(spot.id) ? '3px solid #3B82F6' : '2px solid #9CA3AF';
    }
    
    const isSelected = selectedSpots.has(spot.id);
    const isCorrect = question.correct_spots.includes(spot.id);
    
    if (isSelected && isCorrect) {
      return '3px solid #22C55E';
    }
    if (isSelected && !isCorrect) {
      return '3px solid #EF4444';
    }
    if (!isSelected && isCorrect) {
      return '3px solid #FB923C';
    }
    return '2px solid #E5E7EB';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            🎯 Hotspot Question
          </span>
          <span className="text-sm text-gray-500">
            Select {maxSelections} area{maxSelections > 1 ? 's' : ''}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {question.question_text}
        </h3>
      </div>

      {/* Instructions */}
      {!isAnswered && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Instructions:</strong> Click on the highlighted areas in the image to select your answer. 
            You can select up to {maxSelections} area{maxSelections > 1 ? 's' : ''}.
            Selected areas will be highlighted in blue.
          </p>
        </div>
      )}

      {/* Selection Counter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium">
          Selected: {selectedSpots.size} / {maxSelections}
        </div>
        {selectedSpots.size > 0 && !isAnswered && (
          <button
            onClick={() => setSelectedSpots(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Image with Hotspots */}
      <div className="mb-6 relative inline-block">
        {/* Mock image - in real implementation, use actual image */}
        <div className="relative bg-gray-100 rounded-lg" style={{ width: '100%', minHeight: '400px' }}>
          <img 
            src={question.image_url || '/api/placeholder/800/400'} 
            alt="Hotspot diagram"
            className="w-full rounded-lg"
          />
          
          {/* Hotspot Areas */}
          {question.hotspots.map(spot => (
            <div
              key={spot.id}
              className={`absolute cursor-pointer transition-all duration-200 rounded ${
                !isAnswered ? 'hover:shadow-lg' : ''
              }`}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${spot.width}%`,
                height: `${spot.height}%`,
                backgroundColor: getSpotColor(spot),
                border: getSpotBorder(spot),
              }}
              onClick={() => handleSpotClick(spot.id)}
              onMouseEnter={() => setHoveredSpot(spot.id)}
              onMouseLeave={() => setHoveredSpot(null)}
            >
              {/* Spot Label */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedSpots.has(spot.id) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-white'
                }`}>
                  {spot.label}
                </span>
              </div>
              
              {/* Selection Indicator */}
              {isAnswered && (
                <div className="absolute top-1 right-1">
                  {selectedSpots.has(spot.id) && question.correct_spots.includes(spot.id) && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  {selectedSpots.has(spot.id) && !question.correct_spots.includes(spot.id) && (
                    <span className="text-red-600 text-xl">✗</span>
                  )}
                  {!selectedSpots.has(spot.id) && question.correct_spots.includes(spot.id) && (
                    <span className="text-orange-600 text-xl">!</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit/Reset Buttons */}
      <div className="flex gap-4">
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={selectedSpots.size === 0}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              selectedSpots.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <>
            <div className={`flex-1 py-3 px-4 rounded-lg font-medium text-center ${
              Array.from(selectedSpots).every(spot => question.correct_spots.includes(spot)) &&
              selectedSpots.size === question.correct_spots.length
                ? 'bg-green-100 text-green-800 border-2 border-green-500' 
                : 'bg-red-100 text-red-800 border-2 border-red-500'
            }`}>
              {Array.from(selectedSpots).every(spot => question.correct_spots.includes(spot)) &&
               selectedSpots.size === question.correct_spots.length
                ? '✅ Correct!' 
                : '❌ Incorrect'}
            </div>
            <button
              onClick={resetSelection}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Answer Explanation */}
      {isAnswered && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-3">Explanation:</h4>
          
          {/* Correct Spots */}
          <div className="mb-4">
            <h5 className="font-semibold text-green-700 mb-2">✅ Correct Areas:</h5>
            <div className="space-y-2">
              {question.correct_spots.map(spotId => {
                const spot = question.hotspots.find(h => h.id === spotId);
                if (!spot) return null;
                
                return (
                  <div key={spotId} className="flex items-start">
                    <span className={`mr-2 mt-1 ${
                      selectedSpots.has(spotId) ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {selectedSpots.has(spotId) ? '✓' : '⚠'}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{spot.label}</span>
                      {question.explanation?.spot_explanations?.[spotId] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {question.explanation.spot_explanations[spotId]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incorrect Selections */}
          {Array.from(selectedSpots).some(spot => !question.correct_spots.includes(spot)) && (
            <div className="mb-4">
              <h5 className="font-semibold text-red-700 mb-2">❌ Incorrect Selections:</h5>
              <div className="space-y-2">
                {Array.from(selectedSpots)
                  .filter(spotId => !question.correct_spots.includes(spotId))
                  .map(spotId => {
                    const spot = question.hotspots.find(h => h.id === spotId);
                    if (!spot) return null;
                    
                    return (
                      <div key={spotId} className="flex items-start">
                        <span className="mr-2 mt-1 text-red-600">✗</span>
                        <div className="flex-1">
                          <span className="font-medium">{spot.label}</span>
                          <p className="text-sm text-gray-600 mt-1">
                            This area is not part of the correct answer.
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {question.explanation?.correct && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-700">{question.explanation.correct}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotspotQuestion;