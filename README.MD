# DevInsightHub: Code Analysis Platform

<p align="center">
  <img src="docs/images/logo.png" alt="DevInsightHub Logo" width="200"/>
</p>

DevInsightHub is a comprehensive code analysis platform that helps developers understand, improve, and maintain their code quality through advanced static analysis.

## Features

- **Static Code Analysis**: Analyze code quality, complexity, and patterns
- **GitHub Integration**: Automatically analyze repositories with webhook integration
- **Visualization Dashboard**: View code quality metrics and trends
- **Customizable Reports**: Generate detailed reports for your team
- **Multi-language Support**: Supports Python with expandability for other languages

## Architecture

DevInsightHub is built with a microservices architecture:

- **FastAPI Backend**: High-performance API with async support
- **React Frontend**: Modern, responsive user interface
- **PostgreSQL & MongoDB**: Hybrid database approach for structured and unstructured data
- **Redis & Celery**: Asynchronous task processing for code analysis
- **Docker & Kubernetes**: Containerized deployment for scalability

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Celery
- MongoDB
- PostgreSQL
- Redis

### Frontend
- React
- Chakra UI
- React Router
- React Query

### DevOps
- Docker
- Docker Swarm
- GitHub Actions
- AWS (ECS, Lambda, S3)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- Python 3.9+ (for local development)
- Node.js 14+ (for local frontend development)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devinsighthub.git
   cd devinsighthub