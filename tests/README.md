# 📁 Тестовая документация SMM League

## Структура тестов

```
tests/
├── setup.ts                    # Глобальная настройка тестов
├── integration/
│   └── auth.api.spec.ts        # Интеграционные тесты API
├── e2e/
│   ├── app.spec.ts             # E2E тесты с Playwright
│   └── playwright.config.ts    # Конфигурация Playwright
├── load/
│   ├── scenarios.js            # Load тесты с k6
│   └── config.yaml             # Конфигурация нагрузки
└── README.md                   # Этот файл
```

---

## 🚀 Запуск тестов

### 1. Установка зависимостей

```bash
# Backend dependencies (из корня проекта)
cd apps/backend
npm install

# Frontend dependencies
cd apps/frontend
npm install

# Playwright
npm install -D @playwright/test
npx playwright install

# k6 (отдельно)
brew install k6  # macOS
# или скачать с https://k6.io/download/
```

### 2. Unit Tests (Backend)

```bash
# Из корня backend
cd apps/backend

# Все тесты
npm test

# С покрытием
npm test -- --coverage

# Смотреть изменения
npm run test:watch
```

### 3. Integration Tests

```bash
# Из корня проекта
npx jest --config jest.integration.config.js

# С покрытием
npx jest --config jest.integration.config.js --coverage
```

### 4. E2E Tests (Playwright)

```bash
# Запуск всех E2E тестов
npx playwright test

# Только chromium
npx playwright test --project=chromium

# С репортом
npx playwright test --reporter=html

# Открыть HTML репорт
npx playwright show-report
```

### 5. Load Tests (k6)

```bash
# Smoke test (1 VU, 1 iteration)
k6 run tests/load/scenarios.js

# Load test (10 VUs, 2 minutes)
k6 run --vus=10 --duration=2m tests/load/scenarios.js

# Stress test (100 VUs, 5 minutes)
k6 run --vus=100 --duration=5m tests/load/scenarios.js

# Breakpoint test (gradual ramp-up)
k6 run --vus=500 --duration=10m tests/load/scenarios.js

# С экспортом результатов
k6 run --vus=100 --duration=5m --out json=results.json tests/load/scenarios.js
```

---

## 📋 Тестовые сценарии

### Smoke Tests

Быстрые тесты для проверки базовой функциональности:

```bash
k6 run tests/load/scenarios.js --env VUS=1 --env ITERATIONS=1
```

### Load Tests

Тесты производительности:

- **VUs**: Количество виртуальных пользователей
- **Duration**: Продолжительность теста
- **Iterations**: Количество итераций на пользователя

### Stress Tests

Тесты на предельные нагрузки:

```bash
# Постепенное увеличение нагрузки
k6 run --vus=100 --vus-start=10 --duration=10m tests/load/scenarios.js
```

### Spike Tests

Резкие скачки нагрузки:

```bash
k6 run --vus=500 --duration=1m tests/load/scenarios.js
```

---

## 🎯 API Endpoints для тестирования

### Public Endpoints

```
GET  /influencers/league      - Лига инфлюенсеров
GET  /influencers/search      - Поиск инфлюенсеров
GET  /campaigns               - Список кампаний
GET  /health                  - Проверка здоровья
```

### Protected Endpoints (требуют JWT)

```
POST /auth/me                 - Текущий пользователь
GET  /deals                   - Сделки пользователя
POST /campaigns               - Создать кампанию
POST /campaigns/:id/bids      - Сделать ставку
```

### Admin Endpoints (требуют роль ADMIN)

```
GET  /admin/dashboard         - Дашборд
GET  /admin/users             - Все пользователи
GET  /admin/campaigns         - Все кампании
GET  /admin/deals             - Все сделки
```

---

## 📊 Метрики и thresholds

### Backend (Jest)

- **Coverage**: Минимум 70% для CI
- **Test time**: Менее 5 секунд на тест

### E2E (Playwright)

- **Response time**: p(95) < 3s
- **Error rate**: < 1%
- **Tests pass rate**: 100%

### Load (k6)

- **HTTP req duration**: p(95) < 500ms, p(99) < 1000ms
- **Error rate**: < 1%
- **Throughput**: > 100 req/s

---

## 🐛 Troubleshooting

### Jest не находит модули

```bash
# Очистить кэш
npx jest --clearCache

# Пересоздать node_modules
rm -rf node_modules package-lock.json
npm install
```

### Playwright не запускается

```bash
# Переустановить браузеры
npx playwright install --with-deps

# Проверить установку
npx playwright --version
```

### k6 тесты падают

```bash
# Проверить доступность API
curl http://localhost:3001/influencers/league

# Запустить backend
cd apps/backend && npm run dev
```

---

## 🔄 CI/CD Integration

### GitHub Actions (пример)

```yaml
- name: Run Unit Tests
  run: cd apps/backend && npm test

- name: Run E2E Tests
  run: npx playwright test --project=chromium

- name: Run Load Tests
  run: k6 run tests/load/scenarios.js
```

---

## 📝 Написание новых тестов

### Unit Test Template

```typescript
describe("ServiceName", () => {
  let service: ServiceName;
  let mockPrisma: any;

  beforeEach(async () => {
    // Моки и инициализация
  });

  it("should do something", async () => {
    // Тест
  });
});
```

### E2E Test Template

```typescript
test.describe("Feature", () => {
  test("should do something", async ({ page }) => {
    // Тест
  });
});
```

### Load Test Template

```javascript
export default function (data) {
  // Сценарий нагрузки
}
```
