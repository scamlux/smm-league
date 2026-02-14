#!/bin/bash

# Install dependencies for all parts of the project

echo "🚀 Installing dependencies..."

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd apps/backend
npm install
echo "✅ Backend dependencies installed"

# Frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Root level test dependencies
echo "📦 Installing test dependencies..."
cd ../..
npm install --save-dev supertest @types/supertest jest @types/jest ts-jest
echo "✅ Test dependencies installed"

# Playwright
echo "📦 Installing Playwright..."
npm install -D @playwright/test
npx playwright install --with-deps
echo "✅ Playwright installed"

echo ""
echo "🎉 All dependencies installed successfully!"
echo ""
echo "To run tests:"
echo "  Backend tests:  cd apps/backend && npm test"
echo "  E2E tests:      npx playwright test"
echo "  Load tests:     k6 run tests/load/scenarios.js"
echo "  API tests:      node tests/test.js"


