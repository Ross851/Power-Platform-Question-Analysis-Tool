# CLAUDE.md - PL-600 Exam Prep Platform

This file provides guidance to Claude Code when working with the PL-600 exam preparation platform.

## Project Overview

A comprehensive Microsoft Power Platform Solution Architect (PL-600) exam preparation platform with:
- 120+ questions extracted from various sources
- Deep analytical content with question breakdowns and real-world scenarios
- All question types: Multiple Choice, Sequence/Drag-Drop, Hotspot, Yes/No, Case Study
- Microsoft Learn integration with direct links to study resources
- High-contrast, accessible UI with WCAG AAA compliance
- Mobile-responsive design with touch-friendly interfaces

## Recent Updates (Latest)

### Filtering and Navigation Fixes
- **Enhanced Topic Filtering**: Fixed filtering to search across multiple fields (question text, tags, explanations)
- **Question State Reset**: Questions now properly reset when navigating between them (using React key prop)
- **Expanded Topics**: Added comprehensive topic list based on Microsoft's official PL-600 exam structure
- **Microsoft Learn Integration**: Added help section with direct links to relevant Microsoft Learn resources

### Visibility and Accessibility Improvements
- **High Contrast UI**: Implemented WCAG AAA compliant colors with strong contrast ratios
- **Enhanced Visual Hierarchy**: Bold fonts, stronger borders (2px), elevated shadows
- **Responsive Design**: Mobile-first approach with breakpoints at 640px, 768px, 1024px
- **Touch-Friendly**: 44px minimum touch targets for mobile devices
- **Accessibility Features**: ARIA labels, keyboard navigation, focus states, screen reader support

## Development Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run build:gh-pages  # Build for GitHub Pages deployment
npm run extract-questions  # Extract questions from HTML
npm run upload-questions   # Upload questions to Supabase
npm run deploy      # Deploy to GitHub Pages
```

## Architecture

### Core Components

- **src/App.tsx** - Main application with routing and authentication
- **src/components/ComprehensiveStudyView.tsx** - Main study interface with filtering
- **src/components/Dashboard.tsx** - Progress tracking and analytics
- **src/components/Question/** - Question components for all types
  - Question.tsx - Standard multiple choice
  - EnhancedQuestion.tsx - Questions with deep dive analysis
  - MasterQuestion.tsx - Questions with complete breakdown
  - QuestionTypes/SequenceQuestion.tsx - Drag and drop sequences
  - QuestionTypes/HotspotQuestion.tsx - Clickable area questions
- **src/data/exam-topics.ts** - Comprehensive exam topics with Microsoft Learn links
- **src/utils/accessibility.ts** - Accessibility utilities and helpers

### Data Structure

Questions support multiple formats:
```typescript
{
  id: string,
  question_text: string,
  question_type: 'multiplechoice' | 'sequence' | 'hotspot' | 'yesno',
  options: Array<{id: string, text: string, isCorrect: boolean}>,
  explanation: {
    correct: string,
    incorrect: Record<string, string>,
    deep_dive?: {...},
    question_breakdown?: {...}
  },
  topic: string,
  exam_area: 'envisioning' | 'architecture' | 'implementation',
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  tags: string[]
}
```

## Topic Filtering System

### Exam Areas (Based on PL-600 September 2024 Update)
1. **Solution Envisioning and Requirements Analysis (45-50%)**
   - Initiate solution planning
   - Identify organization information and metrics
   - Identify existing solutions and systems
   - Capture requirements
   - Perform fit/gap analysis

2. **Architect a Solution (35-40%)**
   - Lead the design process
   - Design the data model
   - Design integrations
   - Design the security model
   - Design user experience

3. **Implement the Solution (15-20%)**
   - Validate the solution design
   - Support go-live
   - Optimize solution performance
   - Manage change and adoption

### Enhanced Topics for Filtering
- **Technical**: Dataverse, Power Apps, Power Automate, Power BI, Power Pages, Azure Integration
- **Architecture**: ALM, DevOps, Solution Layers, Environment Strategy
- **Security**: Authentication, Authorization, Conditional Access, DLP, Encryption
- **Integration**: Connectors, Webhooks, Service Bus, Event Grid
- **Performance**: Caching, Indexing, Query Optimization, API Limits
- **Governance**: Center of Excellence, Policies, Compliance, Monitoring

## Microsoft Learn Integration

### Help Section Features
- Dynamic topic-based resource suggestions
- Direct links to:
  - Official PL-600 Study Guide
  - Microsoft Learn Training Modules
  - Power Platform Well-Architected Framework
  - Topic-specific documentation
- Study tips and common mistakes for current topic
- Hints from experienced solution architects

### Resource URLs
- Main exam page: https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/
- Study guide: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600
- Training browse: https://learn.microsoft.com/en-us/training/browse/?products=power-platform
- Well-Architected: https://learn.microsoft.com/en-us/power-platform/well-architected/

## Known Issues and Fixes

### Question State Persistence
**Issue**: Questions were maintaining state when navigating between them
**Fix**: Added `questionKey` state and use it in React key prop to force re-render

### Filtering Not Working
**Issue**: Topic filtering was too restrictive
**Fix**: Enhanced filtering to search across multiple fields (question text, tags, explanations)

### Low Contrast
**Issue**: Light text on light backgrounds made content hard to read
**Fix**: Implemented high-contrast color scheme with WCAG AAA compliance

## Deployment

### GitHub Pages
```bash
# Build for GitHub Pages with correct base path
GITHUB_PAGES=true npm run build

# Or use the convenience script
npm run build:gh-pages

# Deploy manually
npm run deploy
```

### Supabase Setup
1. Create tables using SQL in `supabase/migrations/001_initial_schema.sql`
2. Set environment variables for API keys
3. Run `npm run upload-questions` to populate database
4. Enable Row Level Security policies

## Testing Checklist

- [ ] All question types render correctly
- [ ] Filtering works for all criteria (area, type, difficulty, topic)
- [ ] Questions reset state when navigating
- [ ] Microsoft Learn links open correctly
- [ ] Progress tracking saves to Supabase
- [ ] Dashboard displays accurate statistics
- [ ] Mobile responsive design works
- [ ] Keyboard navigation functions
- [ ] Screen reader announcements work
- [ ] High contrast mode is readable

## Best Practices

1. **Always test question state reset** when modifying navigation
2. **Use semantic HTML** for accessibility
3. **Maintain WCAG AAA contrast ratios** (7:1 for normal text)
4. **Test on mobile devices** with real touch interactions
5. **Verify Microsoft Learn links** are current and working
6. **Keep question data normalized** to prevent duplicates
7. **Use React keys properly** for list items and dynamic components
8. **Test with screen readers** (NVDA, JAWS, VoiceOver)

## Future Enhancements

- [ ] Add practice exam mode with timer
- [ ] Implement spaced repetition algorithm
- [ ] Add offline support with service workers
- [ ] Create mobile app versions (React Native)
- [ ] Add collaborative study features
- [ ] Implement AI-powered hint system
- [ ] Add video explanations for complex topics
- [ ] Create custom study plans based on weak areas