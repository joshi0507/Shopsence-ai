# Contributing to ShopSense AI

Thank you for your interest in contributing to ShopSense AI! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🎯 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Gracefully accept constructive criticism
- Focus on what is best for the community

---

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your copy of the repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/shopsense-ai.git
cd shopsense-ai
```

### 3. Set Up Upstream

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/shopsense-ai.git
git fetch upstream
```

---

## 💻 Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies (including dev)
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run tests to verify setup
pytest
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

---

## 🔧 Making Changes

### 1. Create a Branch

```bash
# Ensure you're up to date
git checkout main
git pull upstream main

# Create your branch
git checkout -b feature/your-feature-name
```

### 2. Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

Examples:
- `feature/add-export-to-pdf`
- `fix/login-validation-error`
- `docs/update-api-documentation`

### 3. Make Your Changes

- Follow the coding standards
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

**Examples:**
```
feat(analytics): add sales forecasting with Prophet

- Implement Facebook prophet integration
- Add forecast endpoint to API
- Add forecast chart to dashboard

Closes #123
```

```
fix(auth): resolve JWT token expiration issue

- Extend token expiration to 15 minutes
- Add refresh token endpoint
- Update frontend token handling
```

---

## 📤 Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is rebased on main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks** - CI/CD pipeline must pass
2. **Code Review** - At least one maintainer review required
3. **Testing** - Changes must be tested
4. **Approval** - Maintainer approval required for merge

---

## 📝 Coding Standards

### Python

Follow [PEP 8](https://pep8.org/) style guide:

```python
# Use type hints
def calculate_revenue(units: int, price: float) -> float:
    """Calculate total revenue.
    
    Args:
        units: Number of units sold
        price: Price per unit
    
    Returns:
        Total revenue
    """
    return units * price

# Use meaningful variable names
total_revenue = calculate_revenue(units_sold, unit_price)

# Follow import order: standard library, third-party, local
import os
from datetime import datetime

import pandas as pd
from flask import Flask

from models.user import User
```

### TypeScript/JavaScript

Follow consistent style:

```typescript
// Use TypeScript types
interface User {
  id: string;
  username: string;
  email: string;
}

// Use functional components with hooks
const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  return <div>{/* ... */}</div>;
};

// Use meaningful names
const calculateTotalRevenue = (sales: Sale[]): number => {
  return sales.reduce((sum, sale) => sum + sale.revenue, 0);
};
```

### CSS/Tailwind

```tsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
  <span className="text-2xl font-bold text-green-600">$12,345</span>
</div>
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_auth.py -v

# Run tests matching pattern
pytest -k "test_login"
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- Auth.test.tsx

# Run E2E tests
npm run test:e2e
```

### Test Coverage Requirements

- **Backend:** Minimum 80% coverage
- **Frontend:** Minimum 70% coverage
- **Critical paths:** 100% coverage required

---

## 📖 Documentation

### Code Comments

```python
def generate_forecast(daily_df: pd.DataFrame, periods: int = 30) -> Dict:
    """
    Generate sales forecast using Facebook Prophet.
    
    Args:
        daily_df: DataFrame with date, units_sold, revenue columns
        periods: Number of days to forecast (default: 30)
    
    Returns:
        Dictionary containing forecast predictions and metadata
    
    Raises:
        ValueError: If insufficient data for forecasting
    """
```

### API Documentation

Update [docs/API.md](./docs/API.md) for API changes:

```markdown
### New Endpoint

**POST** `/api/analytics/export`

Export analytics data.

**Request:**
```json
{
  "format": "pdf",
  "include_charts": true
}
```
```

### README Updates

Update README.md for:
- New features
- Changed requirements
- Updated installation steps
- New configuration options

---

## 🔍 Code Review

### Reviewer Checklist

- [ ] Code is clean and readable
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Follows project conventions

### Common Review Comments

**Architecture:**
- "Consider extracting this logic to a service"
- "This could benefit from caching"

**Security:**
- "Add input validation here"
- "Consider rate limiting this endpoint"

**Performance:**
- "This query could be optimized with an index"
- "Consider pagination for large result sets"

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 2.0.0]

**Logs**
Relevant error logs
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches

**Additional Context**
Mockups, examples, etc.
```

---

## 📦 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes written
- [ ] Deployment tested

---

## 🙏 Questions?

- **General Questions:** GitHub Discussions
- **Bug Reports:** GitHub Issues
- **Security Issues:** security@shopsense.ai

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
