# Development Guide

## 🚀 Getting Started

This guide will help you set up your development environment and understand the development workflow for the PL-600 Exam Prep Platform.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - React snippets

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Ross851/Power-Platform-Question-Analysis-Tool.git
cd Power-Platform-Question-Analysis-Tool

# Or if you're working on a fork
git clone https://github.com/YOUR-USERNAME/Power-Platform-Question-Analysis-Tool.git
cd Power-Platform-Question-Analysis-Tool
git remote add upstream https://github.com/Ross851/Power-Platform-Question-Analysis-Tool.git
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install

# Install development tools globally (optional)
npm install -g typescript eslint prettier
```

### 3. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - VITE_API_URL (backend API URL)
# - VITE_AZURE_CLIENT_ID (for Microsoft integration)
# - VITE_GITHUB_TOKEN (for GitHub MCP)
```

### 4. Extract Questions from PDF

```bash
# Run the extraction script
npm run extract-questions

# This will:
# 1. Parse the PDF file
# 2. Extract questions and answers
# 3. Generate questions.json
# 4. Validate the extracted data
```

### 5. Start Development Server

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:5173
```

## 📁 Project Structure

```
Power-Platform-Question-Analysis-Tool/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Question/       # Question display component
│   │   ├── Quiz/           # Quiz engine component
│   │   ├── Dashboard/      # User dashboard
│   │   └── common/         # Shared components
│   ├── features/           # Feature modules
│   │   ├── mcpIntegration/ # MCP server integrations
│   │   ├── spacedRepetition/ # Spaced repetition algorithm
│   │   ├── gamification/   # Gamification features
│   │   └── ai/             # AI-powered features
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript definitions
│   ├── styles/             # Global styles
│   ├── config/             # Configuration files
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
├── tests/                  # Test files
└── docs/                   # Documentation
```

## 🛠️ Development Workflow

### 1. Creating a New Feature

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests
npm test

# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### 2. Component Development

When creating a new component:

```typescript
// src/components/YourComponent/YourComponent.tsx
import React from 'react';
import { YourComponentProps } from './types';
import styles from './YourComponent.module.css';

export const YourComponent: React.FC<YourComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
};

// src/components/YourComponent/index.ts
export { YourComponent } from './YourComponent';
export type { YourComponentProps } from './types';

// src/components/YourComponent/YourComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

### 3. MCP Server Integration

To add a new MCP server integration:

```typescript
// src/features/mcpIntegration/servers/yourServer.ts
import { MCPClient } from '../client';

export class YourMCPServer {
  private client: MCPClient;

  constructor() {
    this.client = new MCPClient({
      url: process.env.VITE_YOUR_SERVER_URL,
      // Additional config
    });
  }

  async yourMethod() {
    return await this.client.call('method_name', { /* params */ });
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Writing Tests

```typescript
// Unit Test Example
describe('SpacedRepetition', () => {
  it('should calculate next review date correctly', () => {
    const result = calculateNextReview(2, 0.8);
    expect(result).toBe(5);
  });
});

// Integration Test Example
describe('Question Flow', () => {
  it('should complete a quiz session', async () => {
    const { user } = render(<Quiz />);
    await user.click(screen.getByText('Start Quiz'));
    // ... test interactions
  });
});
```

## 🔧 Build & Deployment

### Development Build

```bash
# Create a development build
npm run build:dev

# This includes:
# - Source maps
# - Development warnings
# - Debug logging
```

### Production Build

```bash
# Create a production build
npm run build

# This includes:
# - Minification
# - Tree shaking
# - Asset optimization
# - No source maps
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview

# Available at http://localhost:4173
```

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for component props
- Use enums for constants
- Avoid `any` type

### React

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for shared logic
- Implement error boundaries

### Naming Conventions

- **Components**: PascalCase (e.g., `QuestionCard`)
- **Functions**: camelCase (e.g., `calculateScore`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ATTEMPTS`)
- **Files**: Component files in PascalCase, others in camelCase

### Import Order

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { useQuery } from '@tanstack/react-query';

// 3. Local imports
import { QuestionCard } from '@/components';
import { calculateScore } from '@/utils';

// 4. Style imports
import styles from './Component.module.css';
```

## 🐛 Debugging

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug in Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5173
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process or use a different port
npm run dev -- --port 3000
```

#### Module Resolution Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### MCP Servers
- [Microsoft 365 MCP](docs/MCP_INTEGRATION.md#microsoft-365)
- [GitHub MCP](docs/MCP_INTEGRATION.md#github)
- [Pieces MCP](docs/MCP_INTEGRATION.md#pieces)

### Power Platform Resources
- [Microsoft Learn - PL-600](https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/)
- [Power Platform Documentation](https://learn.microsoft.com/en-us/power-platform/)

## 🤝 Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Join our community (link in README)
- **Stack Overflow**: Tag questions with `pl600-prep`

---

**Happy coding!** 🎉 Remember to update documentation and tests as you develop.