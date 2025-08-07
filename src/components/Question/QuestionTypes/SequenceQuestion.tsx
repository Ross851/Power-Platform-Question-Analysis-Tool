import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SequenceQuestionProps {
  question: {
    id: number;
    question_text: string;
    items: string[];
    correct_order: string[];
    explanation?: {
      correct: string;
      step_explanations?: string[];
    };
  };
  onAnswer: (answer: string[], isCorrect: boolean, timeSpent: number) => void;
}

function SortableItem({ id, item, index }: { id: string; item: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border-2 rounded-lg cursor-move hover:shadow-lg transition-all ${
        isDragging ? 'border-blue-500 shadow-xl' : 'border-gray-300'
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center">
        <span className="mr-3 text-lg font-bold text-gray-500">
          {index + 1}.
        </span>
        <span className="flex-1 text-gray-800">{item}</span>
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
    </div>
  );
}

export const SequenceQuestion: React.FC<SequenceQuestionProps> = ({
  question,
  onAnswer,
}) => {
  const [items, setItems] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Shuffle items initially
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [question.items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    if (isAnswered) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correct = JSON.stringify(items) === JSON.stringify(question.correct_order);
    
    setIsCorrect(correct);
    setIsAnswered(true);
    onAnswer(items, correct, timeSpent);
  };

  const resetSequence = () => {
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            📝 Sequence Question
          </span>
          <span className="ml-3 text-sm text-gray-500">
            Drag items to arrange in correct order
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
            💡 <strong>Tip:</strong> Drag and drop the items below to arrange them in the correct sequence. 
            You can also use keyboard navigation (Tab + Space + Arrow keys).
          </p>
        </div>
      )}

      {/* Draggable Items */}
      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <SortableItem
                  key={item}
                  id={item}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Submit/Reset Buttons */}
      <div className="flex gap-4">
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Sequence
          </button>
        ) : (
          <>
            <div className={`flex-1 py-3 px-4 rounded-lg font-medium text-center ${
              isCorrect 
                ? 'bg-green-100 text-green-800 border-2 border-green-500' 
                : 'bg-red-100 text-red-800 border-2 border-red-500'
            }`}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </div>
            <button
              onClick={resetSequence}
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
          <h4 className="font-bold text-gray-900 mb-3">
            {isCorrect ? '✅ Correct Sequence:' : '❌ The Correct Sequence Is:'}
          </h4>
          
          <div className="space-y-2">
            {question.correct_order.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-3 mt-1 flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{item}</p>
                  {question.explanation?.step_explanations?.[index] && (
                    <p className="text-sm text-gray-600 mt-1">
                      {question.explanation.step_explanations[index]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {question.explanation?.correct && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">{question.explanation.correct}</p>
            </div>
          )}

          {/* Your sequence vs correct sequence comparison */}
          {!isCorrect && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h5 className="font-semibold text-orange-900 mb-2">Your Sequence:</h5>
              <div className="space-y-1">
                {items.map((item, index) => {
                  const correctIndex = question.correct_order.indexOf(item);
                  const isInCorrectPosition = correctIndex === index;
                  return (
                    <div key={index} className="flex items-center text-sm">
                      <span className={`mr-2 ${isInCorrectPosition ? 'text-green-600' : 'text-red-600'}`}>
                        {isInCorrectPosition ? '✓' : '✗'}
                      </span>
                      <span className={isInCorrectPosition ? 'text-gray-700' : 'text-gray-500 line-through'}>
                        {index + 1}. {item}
                      </span>
                      {!isInCorrectPosition && (
                        <span className="ml-2 text-orange-600">
                          (Should be position {correctIndex + 1})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SequenceQuestion;