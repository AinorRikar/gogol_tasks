# Gogol Dashboard

Веб-приложение для фрилансера-разработчика: **CRM** (заказчики, доступы) и **управление проектами** (статусы, канбан, чат, галерея, ссылки). Один репозиторий на **Nuxt** — и интерфейс, и API.

## Зачем так сделано

- Разработчик ведёт портфель проектов и общается с заказчиками в одном месте.
- Заказчики видят только свои проекты и только то, что им разрешено.
- Отдельный **Integration API** отдаёт выбранные проекты на публичный сайт (портфолио) без доступа к CRM.

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run prisma:push
npm run dev
```

Демо-данные: `POST http://localhost:3000/api/seed`  
Учётка разработчика: **login** `admin`, **пароль** `12345678`.

## Стек

| Слой | Технологии |
|------|------------|
| UI | Nuxt 4, Vue 3 (Composition API), Tailwind CSS, Nuxt Icon, color-mode |
| API | Nitro (h3), Zod |
| Данные | SQLite, Prisma (`db push`) |
| Сессия | JWT в httpOnly cookie |
| Чат | SSE (`EventSource`) |

## Как устроен код

### Фронтенд (FSD)

Слои снизу вверх — импорты только «наружу»:

```text
src/shared     → типы, API-клиент, UI-чипы, утилиты
src/entities   → сущности (проект: карточка, флаги)
src/features   → сценарии (чат, канбан, создание проекта, …)
src/widgets    → сборка экранов (список проектов, детали, шапка)
src/pages      → маршруты Nuxt
src/layouts    → обёртка + инициализация сессии
```

Публичный API слайса — только через `index.ts` в корне слайса. Проверка: `npm run fsd:check`.

### Бэкенд

- `server/api/**` — HTTP-обработчики (по файлу = маршрут).
- `server/utils/**` — auth, Prisma, права на проекты, сериализация, integration.

Схема БД и комментарии к полям: [prisma/schema.prisma](prisma/schema.prisma).

## Роли

| Роль | Возможности |
|------|-------------|
| **DEVELOPER** | Все проекты; создание/редактирование/архив; участники; галерея; справочные блоки; кабинет с клиентами |
| **CLIENT** | Список проектов по правилам; чат и канбан — если назначен в проект |
| **Гость** | Публичные проекты в списке; скрытые (`hidden`) — с маскировкой контента |

Флаги проекта:

- **visibility** — виден ли в общем списке без членства;
- **hidden** — «закрытый» контент для посторонних;
- **useForPortfolio** — попадает ли в Integration API для внешнего сайта.

## Функционал

- **Проекты** — краткое и полное описание, версия, статус, стек (CSV), архив.
- **Участники** — назначение заказчиков на проект.
- **Канбан** — задачи `TODO` / `IN_PROGRESS` / `DONE`.
- **Чат** — сообщения в реальном времени (SSE).
- **Галерея** — загрузка изображений (разработчик).
- **Ссылки** — кнопки с title и favicon с целевого URL.
- **Справочные блоки** — метрики/тезисы (только разработчик в CRM; в портфолио — через API).
- **Кабинет** — профиль; у разработчика — управление заказчиками (заглушка аналитики).
- **Тема** — светлая / тёмная.

## Данные (кратко)

- `User` — login, роль, passwordHash.
- `Project` — описания, версия, флаги, techStack, archivedAt.
- `ProjectMember`, `ProjectTask`, `ChatMessage`, `ProjectImage`, `ProjectLink`, `ProjectReferenceBlock`.

## Документация

| Файл | О чём |
|------|--------|
| **[API.md](API.md)** | Integration API для внешнего сайта (JWT, portfolio, DTO) |
| **[DEPLOY.md](DEPLOY.md)** | Docker, nginx, обновление prod, миграции БД |

## Локальная разработка

Переменные — [.env.example](.env.example):

- `DATABASE_URL` — по умолчанию `file:./dev.db`;
- `JWT_SECRET` — для сессии;
- `INTEGRATION_SECRET` — для `/api/integration/*` (если тестируете портфолио);
- `NUXT_PUBLIC_APP_BASEURL` — локально не нужен; для проверки префикса `/dashboard/` см. [DEPLOY.md](DEPLOY.md).

Команды:

```bash
npm run prisma:generate   # после правок schema.prisma
npm run prisma:push
npm run prisma:studio     # просмотр БД
npm run fsd:check && npm run build
```

## Структура репозитория (ориентир)

```text
prisma/           схема и SQL-миграции для старых prod-БД
server/api/       REST и integration
server/utils/     общая логика
src/features/     фичи UI (project-chat, project-links, …)
src/widgets/      layout, project-list, project-details
docker-compose.yml
Dockerfile
```

## Почему такой стек

- **Nuxt fullstack** — один деплой, SSR и API вместе.
- **SQLite + Prisma** — простой старт без отдельного сервера БД.
- **JWT в cookie** — удобная сессия для SSR.
- **FSD** — предсказуемый рост фронтенда.
- **SSE** — достаточно для чата без WebSocket-инфраструктуры.
