# 🚀 ShopSense AI

### Intelligent AI-Powered Business Analytics Platform

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://mongodb.com)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()

---

## 📌 Overview

**ShopSense AI** is a full-stack AI-powered business analytics platform that transforms raw sales data into actionable insights, intelligent forecasts, and automated business recommendations.

It enables businesses, startups, and analysts to make smarter, data-driven decisions using modern AI and analytics technologies.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

### Key Capabilities

- 📊 **Real-Time Analytics** - Interactive dashboards with live data updates
- 🤖 **AI-Powered Insights** - Google Gemini generates strategic recommendations
- 📈 **Predictive Forecasting** - Facebook Prophet for accurate sales predictions
- 🔒 **Enterprise Security** - JWT authentication, rate limiting, RBAC
- 🎨 **Modern UI/UX** - Beautiful React interface with 3D visualizations
- 📁 **Easy Data Import** - CSV upload with automatic validation

---

## ✨ Features

### Analytics & Insights

| Feature                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| **Product Performance** | Identify top sellers and underperformers       |
| **Sales Trends**        | Track daily/weekly/monthly patterns            |
| **Price Analysis**      | Optimize pricing strategy                      |
| **Revenue Forecasting** | Predict future sales with confidence intervals |
| **AI Recommendations**  | Get actionable business advice                 |
| **Executive Reports**   | One-page summaries for stakeholders            |

## Analytics Features in Detailed

### Business Insights Generated

1. **Executive Summary**: Overview of key performance indicators
2. **Product Performance**: Detailed analysis of product performance
3. **Pricing Strategy**: Recommendations for price optimization
4. **Growth Opportunities**: Identification of expansion opportunities
5. **Inventory Management**: Stock level recommendations
6. **Marketing Insights**: Data-driven marketing strategies
7. **Risk Analysis**: Business risk assessment and mitigation
8. **Action Items**: Prioritized recommendations with timelines

### Key Metrics Tracked

- Total products and revenue
- Average price and sales volume
- Top and bottom performing products
- Revenue leaders and underperformers
- Price elasticity and market trends
- Growth potential and market opportunities

## Development

### Adding New Analytics

1. Update `analytics_mongo.py` with new insight functions
2. Modify the `generate_insights()` function to include new analytics
3. Update the frontend in `index_mongo.html` to display new insights

### Database Operations

- All database operations use MongoDB aggregation pipelines for efficiency
- Data is automatically cleaned and validated before storage
- Historical data is maintained for trend analysis and forecasting

### Real-time Features

- Socket.IO enables live data streaming
- Background thread simulates real-time sales data
- Charts update automatically with new data

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Configure MongoDB Atlas with proper security
3. Use Gunicorn for WSGI serving

### Security & Compliance

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ Security headers (CSP, HSTS)
- ✅ Audit logging
- ✅ GDPR-ready data handling

### Developer Experience

- 📚 Comprehensive API documentation
- 🧪 80%+ test coverage
- 🔄 CI/CD with GitHub Actions
- 🐳 Docker support
- 📦 Modular architecture
- 🔍 CodeQL security scanning

---

## 🛠️ Tech Stack

### Backend

```yaml
Runtime: Python 3.11+
Framework: Flask 3.0
Database: MongoDB 7.0
Authentication: PyJWT 2.8
Analytics: Pandas, NumPy, Plotly
Forecasting: Facebook Prophet 1.1
AI: Google Gemini AI
Security: Flask-Limiter, Flask-Talisman
```

### Frontend

```yaml
Framework: React 18.3 + TypeScript
Build Tool: Vite 6.0
Styling: Tailwind CSS 3.4
Charts: Plotly.js, Recharts
Animations: Framer Motion
3D Graphics: Three.js, React Three Fiber
UI Components: Radix UI, shadcn/ui
```

### Infrastructure

```yaml
Hosting: Render.com / AWS
CDN: Cloudflare
Database: MongoDB Atlas
Cache: Redis
CI/CD: GitHub Actions
Monitoring: Sentry, Datadog
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 20 or higher
- MongoDB 7.0 or higher (or MongoDB Atlas account)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/shopsense-ai.git
cd shopsense-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# - MONGO_URI
# - SECRET_KEY (generate secure random string)
# - JWT_SECRET_KEY (generate secure random string)
# - GEMINI_API_KEY

# Run the application
python app.py
```

Backend will start on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template (optional)
cp .env.example .env

# Run development server
npm run dev
```

Frontend will start on `http://localhost:5173`

### 4. Docker (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📖 Installation

### Detailed Backend Setup

1. **Install Python Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

2. **Configure Environment Variables**

Create `.env` file in the backend directory:

```env
# Application
FLASK_ENV=development
FLASK_DEBUG=True

# Security (GENERATE SECURE RANDOM STRINGS!)
SECRET_KEY=your-super-secret-key-min-32-chars
JWT_SECRET_KEY=another-super-secret-key-min-32-chars

# Database
MONGO_URI=mongodb://localhost:27017/shopsense_analytics

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS (for local development)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

3. **Generate Secure Keys**

```python
# Run this in Python to generate secure keys
import secrets
print(f"SECRET_KEY: {secrets.token_hex(32)}")
print(f"JWT_SECRET_KEY: {secrets.token_hex(32)}")
```

4. **Create Admin User**

```bash
flask create-admin
```

5. **Run Tests**

```bash
pytest --cov=. --cov-report=html
```

### Detailed Frontend Setup

1. **Install Node Dependencies**

```bash
cd frontend
npm install
```

2. **Configure Environment (Optional)**

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

3. **Run Development Server**

```bash
npm run dev
```

4. **Build for Production**

```bash
npm run build
```

---

## 📚 Documentation

| Document                                     | Description                   |
| -------------------------------------------- | ----------------------------- |
| [PRD.md](./PRD.md)                           | Product Requirements Document |
| [API.md](./docs/API.md)                      | Complete API Reference        |
| [DEPLOYMENT.md](./backend/DEPLOYMENT.md)     | Production Deployment Guide   |
| [GEMINI_SETUP.md](./backend/GEMINI_SETUP.md) | Google Gemini Setup           |
| [CONTRIBUTING.md](./CONTRIBUTING.md)         | Contribution Guidelines       |

---

## 🔌 API Reference

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"john@example.com","password":"SecurePass123!"}'
```

### Upload Data

```bash
# Upload CSV
curl -X POST http://localhost:8000/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sales_data.csv"
```

### Get Analytics

```bash
# Dashboard data
curl -X GET http://localhost:8000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# AI Insights
curl -X POST http://localhost:8000/api/analytics/insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"upload_id":"abc123"}'
```

For complete API documentation, see [docs/API.md](./docs/API.md)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

---

## 📁 Project Structure

```
    shopsense-ai/
    ├── backend/                    # Flask API Server
    │   ├── app.py                 # Application entry point
    │   ├── security_config.py     # Security configuration
    │   ├── config.py              # Environment config
    │   ├── routes/                # API route blueprints
    │   │   ├── auth.py           # Authentication routes
    │   │   ├── uploads.py        # File upload routes
    │   │   ├── analytics.py      # Analytics routes
    │   │   └── dashboard.py      # Dashboard routes
    │   ├── models/                # Database models
    │   │   ├── user.py           # User model
    │   │   ├── upload.py         # Upload session model
    │   │   └── sales_data.py     # Sales data model
    │   ├── services/              # Business logic
    │   │   ├── auth_service.py   # Authentication service
    │   │   ├── analytics_service.py
    │   │   └── forecast_service.py
    │   ├── middleware/            # Request middleware
    │   ├── utils/                 # Utility functions
    │   ├── tests/                 # Test suite
    │   └── requirements.txt       # Python dependencies
    ├── frontend/                   # React Application
    │   ├── src/
    │   │   ├── App.tsx           # Main component
    │   │   ├── components/       # React components
    │   │   ├── lib/              # Utilities
    │   │   └── lib/api.ts        # API client
    │   ├── package.json
    │   └── vite.config.ts
    ├── docs/                       # Documentation
    │   ├── API.md                 # API reference
    │   └── ...
    ├── PRD.md                      # Product requirements
    ├── docker-compose.yml          # Docker configuration
    └── .github/workflows/          # CI/CD pipelines
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
# Fork the repository
git clone https://github.com/your-org/shopsense-ai.git

# Create a branch
git checkout -b feature/your-feature

# Make changes and test
# ...

# Commit and push
git commit -m "feat: add your feature"
git push origin feature/your-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Facebook Prophet](https://facebook.github.io/prophet/) - Time series forecasting
- [Google Gemini AI](https://ai.google.dev/) - Generative AI insights
- [Plotly](https://plotly.com/) - Data visualization
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - Frontend framework
- [Flask](https://flask.palletsprojects.com/) - Backend framework

---

## 📞 Support

For support and questions:

- Check the troubleshooting section
- Review the application logs
- Verify MongoDB connection and data format
- **Email:** tanishqjoshi200507@gmail.com

---

<div align="center">

**Built with ❤️ by the ShopSense AI Team**

[Website](https://webinosolutions.com) • [LinkedIn](https://www.linkedin.com/in/tanishq-joshi-9921b3285/)

</div>
#
