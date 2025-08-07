# Contributing to PL-600 Exam Prep Platform

First off, thank you for considering contributing to the PL-600 Exam Prep Platform! It's people like you that make this tool amazing for the Power Platform community.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Style Guidelines](#style-guidelines)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account
- Basic knowledge of React and TypeScript
- (Optional) Microsoft 365 account for testing MCP integrations

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Power-Platform-Question-Analysis-Tool.git
   cd Power-Platform-Question-Analysis-Tool
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Ross851/Power-Platform-Question-Analysis-Tool.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
6. **Run the development server**:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- Rationale for why this enhancement would be useful
- Possible implementation approach
- Examples or mockups (if applicable)

### Contributing Questions

We welcome contributions to our question bank! To contribute questions:

1. Ensure questions are relevant to PL-600 exam objectives
2. Include detailed explanations for correct and incorrect answers
3. Provide references to official Microsoft documentation
4. Follow our question format schema:
   ```json
   {
     "id": "PL600-XXX",
     "questionText": "...",
     "options": [...],
     "correctAnswer": "...",
     "explanation": "...",
     "examArea": "Solution Envisioning|Architecture|Implementation",
     "difficulty": 1-5,
     "tags": [...],
     "microsoftLearnLink": "..."
   }
   ```

### Contributing Code

1. **Find an issue** to work on or create a new one
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch** from `main`
4. **Write your code** following our style guidelines
5. **Write/update tests** for your changes
6. **Update documentation** if needed
7. **Submit a pull request**

## Development Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Performance: `perf/description`
- Refactoring: `refactor/description`

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Check coverage
npm run test:coverage
```

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Type checking
npm run type-check
```

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks for React
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for complex functions

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and sizing
- Use CSS modules for component-specific styles

### File Organization

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific modules
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── config/         # Configuration files
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(questions): add PDF extraction pipeline
fix(quiz): correct scoring calculation bug
docs(readme): update installation instructions
test(components): add Question component tests
```

## Pull Request Process

### Before Submitting

1. **Update documentation** including README.md if needed
2. **Add tests** for new functionality
3. **Run all tests** and ensure they pass
4. **Update CHANGELOG.md** with your changes
5. **Ensure no console.logs** are left in code
6. **Check that build succeeds** with `npm run build`

### PR Template

Your PR should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] CHANGELOG.md updated
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. No merge conflicts
4. Constructive feedback is welcome
5. Be patient - reviews may take time

## Community

### Getting Help

- **Discord**: Join our study group (link coming soon)
- **GitHub Discussions**: Ask questions and share ideas
- **Stack Overflow**: Tag with `pl600-prep`

### Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- CONTRIBUTORS.md file
- Release notes

### Becoming a Maintainer

Active contributors who demonstrate:
- Consistent quality contributions
- Good understanding of the codebase
- Helpful community participation
- Alignment with project goals

May be invited to become maintainers.

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this platform better for everyone preparing for the PL-600 exam. Together, we're helping professionals succeed in their Power Platform journey!

---

**Questions?** Feel free to reach out to the maintainers or open a discussion.