#!/bin/bash

# SMM League - Complete Test Runner
# Tests Backend API, Frontend Routes, and Database

echo "🚀 Starting SMM League Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if services are running
echo ""
echo "📋 Checking services..."

# Check Backend
if nc -z localhost 3001 2>/dev/null; then
  echo "✅ Backend running on port 3001"
else
  echo "❌ Backend not running on port 3001"
  exit 1
fi

# Check Frontend
if nc -z localhost 3000 2>/dev/null; then
  echo "✅ Frontend running on port 3000"
else
  echo "⚠️  Frontend not running on port 3000 (may not be critical)"
fi

# Check PostgreSQL
if nc -z localhost 5432 2>/dev/null; then
  echo "✅ PostgreSQL running on port 5432"
else
  echo "❌ PostgreSQL not running on port 5432"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the TypeScript test file using npx ts-node
cd /Users/muhammadumar/Desktop/smm-league

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run tests
echo "🧪 Running API tests..."
echo ""

npx ts-node tests/api-test.ts

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Test suite completed!"
echo ""
