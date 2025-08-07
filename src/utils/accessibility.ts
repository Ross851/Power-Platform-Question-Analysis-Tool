/**
 * Accessibility utilities for PL-600 Exam Prep Platform
 */

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusableElement = focusableElements[0] as HTMLElement;
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  element.addEventListener('keydown', (e) => {
    const isTabPressed = e.key === 'Tab';
    
    if (!isTabPressed) {
      return;
    }
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  });
  
  firstFocusableElement?.focus();
};

/**
 * Get appropriate ARIA label for question status
 */
export const getQuestionStatusLabel = (isCorrect: boolean | null, isAnswered: boolean): string => {
  if (!isAnswered) {
    return 'Question not yet answered';
  }
  return isCorrect ? 'Correct answer' : 'Incorrect answer';
};

/**
 * Get appropriate color contrast ratio compliant colors
 */
export const getAccessibleColors = () => ({
  // WCAG AAA compliant color combinations
  text: {
    primary: '#000000', // Pure black for maximum contrast
    secondary: '#1a1a1a',
    light: '#4a4a4a',
    onDark: '#ffffff',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    dark: '#1a1a1a',
  },
  status: {
    success: '#0d7a2e', // Dark green
    error: '#b91c1c', // Dark red
    warning: '#92400e', // Dark amber
    info: '#1e40af', // Dark blue
  },
  interactive: {
    primary: '#1e40af', // Dark blue
    primaryHover: '#1e3a8a',
    focus: '#2563eb', // Bright blue for focus states
  }
});

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get keyboard shortcut descriptions
 */
export const getKeyboardShortcuts = () => [
  { key: 'Tab', description: 'Navigate forward through interactive elements' },
  { key: 'Shift + Tab', description: 'Navigate backward through interactive elements' },
  { key: 'Enter/Space', description: 'Select or activate focused element' },
  { key: 'Escape', description: 'Close modal or cancel action' },
  { key: 'Arrow Keys', description: 'Navigate within menus or options' },
  { key: '1-4', description: 'Quick select answer options' },
  { key: 'N', description: 'Next question' },
  { key: 'P', description: 'Previous question' },
  { key: 'S', description: 'Submit answer' },
  { key: 'H', description: 'Show/hide help' },
];

/**
 * Format time for screen readers
 */
export const formatTimeForScreenReader = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
};

/**
 * Get ARIA description for progress
 */
export const getProgressDescription = (current: number, total: number, correct: number): string => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  return `Question ${current} of ${total}. You have answered ${correct} correctly, which is ${percentage} percent.`;
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get appropriate button size for touch devices
 */
export const getTouchFriendlySize = (): string => {
  return isTouchDevice() ? 'min-h-[44px] min-w-[44px]' : '';
};