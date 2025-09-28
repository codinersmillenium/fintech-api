# 💳 Fintech API - Mini Project

This project is a **Fintech API** built using **NestJS (TypeScript)** and running on **Bun** runtime.  
It manages customers, payments, invoices, and transactions, designed with **Hexagonal Architecture** and **API Versioning** to ensure maintainability, scalability, and backward compatibility.

---

## 📑 Table of Contents
1. [Architecture](#-architecture)  
2. [Tech Stack](#-tech-stack)  
3. [Database & External Integrations](#-database--external-integrations)  
4. [Testing & Documentation](#-testing--documentation)  
5. [Deployment & CI/CD](#-deployment--cicd)  
6. [Project Structure](#-project-structure)  
7. [How to Run](#-how-to-run)  
8. [Scripts](#-scripts-bun)  

---

## 🏗 Architecture

### Hexagonal Architecture
- Separates domain (business logic) from framework, database, and external services.  
- Each module is independent, making the system easier to scale and handle high concurrency.  
- Supports service isolation in case the system evolves into microservices.  
- Maintainability: core logic remains stable even if database/framework changes.  

### API Versioning
The project applies **API Versioning** in the folder structure (e.g., `src/modules/customers/v1/`).  
This ensures that breaking changes can be introduced without affecting existing integrations.

---

## ⚙ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) ⚡ (fast JS/TS runtime).  
- **Backend Framework**: [NestJS](https://nestjs.com/) (TypeScript).  
- **ORM**: [Prisma](https://www.prisma.io/) - schema-driven, type-safe queries, maintainable.  
- **Database**: [PostgreSQL](https://www.postgresql.org/) hosted on Railway.  
- **Authentication**: JWT + (planned) Google Authenticator (2FA via TOTP).  
- **API Documentation**: Swagger (OpenAPI).  
- **Payment Gateway**: Stripe integration (mock/test mode).  
- **Testing**: Jest + Supertest (via Bun compatibility).  
- **Deployment**: Docker + Railway.  
- **CI/CD**: GitHub Actions (linting, testing, build, deployment).  

---

## 🗄 Database & External Integrations

- **Database**: PostgreSQL (Railway or local Docker).  
- **Integrations**:  
  - **Stripe (Mock Payment Gateway)** → simulates payments.  
  - **Webhook Service (Mock)** → Stripe Webhook.  

---

## 🧪 Testing & Documentation

- **Unit Tests**: Jest + Supertest (works on Bun).  
- **API Docs**: Swagger at `/api/docs`.  
- **Authentication flow**:  
  1. Login.  
  2. Generate OTP (if enabled) (planned).  
  3. Verify OTP (planned).  
  4. Set JWT in `Authorization: Bearer <token>`.  

---

## 🚀 Deployment & CI/CD

- **Deployment**: Dockerized and deployed to Railway.  
- **CI/CD**: GitHub Actions with steps:
  1. Install dependencies (`bun install`).  
  2. Run lint & tests (`bun run lint`, `bun run test`).  
  3. Build (`bun run build`).  
  4. Deploy to Railway.  

Example GitHub Action workflow (`.github/workflows/ci.yml`):

```yaml
name: CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Install Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun run test

      - name: Build
        run: bun run build

# ▶ How to Run

```bash
# 1. Clone Repository
git clone https://github.com/your-username/fintech-api.git
cd fintech-api

# 2. Install Dependencies (Bun)
bun install

# 3. Setup Environment Variables
# Create a .env file in the project root:
# ----------------------------------------
# DATABASE_URL="postgresql://user:password@localhost:5432/postgres"
# JWT_SECRET="your_jwt_secret"
# STRIPE_SECRET_KEY="your_stripe_test_key"
# ----------------------------------------

# 4. Run Database Migration
bunx prisma migrate dev

# 5. Start Development Server
bun run start:dev
# API     → http://localhost:3000
# Swagger → http://localhost:3000/api/docs

# 6. Run Tests
bun run test

# 7. Build for Production
bun run build
bun run start:build
