# AI Menu Generator
AI-генератор персонализированного меню питания для российского рынка. Telegram Mini App.

## Стек
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + @tma.js/sdk-react
- Backend: NestJS + Prisma + PostgreSQL 16 + Redis 7 + BullMQ
- AI: OpenRouter API (GPT-4.1-mini default, Claude Sonnet 4.6 premium)

## Правила
- TypeScript strict mode везде
- camelCase для переменных, PascalCase для типов и компонентов
- Все API-ответы типизированы через /shared типы
- Все ответы AI валидируются через Zod
- Функциональный React, хуки, не классы
- NestJS: модульная архитектура, каждая фича = отдельный модуль
- Комментарии к бизнес-логике на русском

## Команды
- npm run docker:up — запуск PostgreSQL + Redis
- npm run dev:backend — запуск бэкенда (порт 3000)
- npm run dev:frontend — запуск фронта (порт 5173)
- cd backend && npx prisma migrate dev — миграции
- cd backend && npx prisma studio — GUI для БД
