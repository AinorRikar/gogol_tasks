# Gogol CRM Tasks

Веб-приложение на Nuxt для фрилансера: CRM + управление проектами с ролями, приватностью, чатом, канбаном и галереей.

## 1) Цель проекта

Проект решает 2 задачи:
- **CRM-часть**: взаимодействие разработчика с заказчиками (назначение в проекты, коммуникация, контроль доступа).
- **Project management**: ведение проектного портфеля с жизненными статусами, канбан-задачами, архивом и медиа-галереей.

## 2) Использованный стек

- **Frontend**
  - `Nuxt 4` (SSR, routing, единая fullstack-платформа)
  - `Vue 3` (Composition API, SFC)
  - `Tailwind CSS` (утилитарная стилизация)
  - `@nuxtjs/color-mode` (светлая/темная тема)
  - `@nuxt/icon` (Material-style иконки)
- **Backend**
  - `Nitro/h3` (API-роуты внутри Nuxt)
  - `zod` (валидация входных данных)
  - `jsonwebtoken` (JWT-аутентификация)
- **Данные**
  - `SQLite` (локальная БД)
  - `Prisma` (ORM, схема и миграции через `db push`)
- **Realtime**
  - `SSE` (`EventSource`) для живого обновления чата

## 3) Архитектурный подход

Использована FSD-структура на фронтенде:
- `src/shared` — публичные точки входа: `types/index.ts`, `api`, `lib` (см. ниже).
- `src/entities` — сущности интерфейса (карточка проекта).
- `src/features` — функциональные блоки (авторизация, тема, создание проекта).
- `src/widgets` — компоновка блоков (список проектов, оболочка приложения).
- `src/pages` — страницы и бизнес-сценарии.
- `src/layouts` — тонкий слой: импортирует виджет-оболочку и инициализацию сессии.

**Публичный API слайсов.** Каждый слайс (`entities`, `features`, `widgets`, `shared`) отдаёт наружу только то, что перечислено в своём корневом `index.ts`. Внешние модули импортируют из `~/entities/...`, `~/features/...` и т.д., а не из внутренних путей вида `.../ui/Component.vue` — это проверяется скриптом `scripts/fsd/check-public-api.mjs`.

**Проверка границ:** `npm run fsd:check` — падает, если в коде встречаются «глубокие» импорты в `ui`/`model`/… другого слайса.

**Компоненты Nuxt.** Глобальная регистрация через длинный список путей в `nuxt.config` не используется: компоненты подключаются явными импортами там, где нужны (в т.ч. из публичных `index.ts` виджетов и фич).

**Layout.** Реальная разметка шапки и навигации живёт в `src/widgets/layout` (`DefaultAppShell`); `src/layouts/default.vue` только оборачивает страницу в этот виджет и вызывает `useInitActiveUser`.

Бэкенд расположен в `server/api` (эндпоинты) и `server/utils` (утилиты auth/prisma/project). В коде и в `prisma/schema.prisma` есть русскоязычные комментарии к домену и правам доступа.

## 4) Роли и модель доступа

- **DEVELOPER**
  - создает/редактирует/архивирует проекты;
  - управляет участниками;
  - работает с галереей;
  - видит все проекты.
- **CLIENT**
  - видит список проектов;
  - для приватных/скрытых проектов доступны ограничения по содержимому и переходу;
  - чат и задачи доступны только при назначении в проект.
- **Неавторизованный пользователь**
  - может просматривать список проектов и публичные проекты в рамках правил доступа.

## 5) Данные и доменная модель

Схема Prisma: `prisma/schema.prisma`.

Ключевые сущности:
- `User` — пользователь (роль, login, passwordHash).
- `Project` — проект (status, visibility, hidden, archivedAt, **useForPortfolio** — участие в портфельной выборке на фронте, **techStack** — строка со стеком в формате CSV для простого хранения без отдельной таблицы).
- `ProjectMember` — назначение заказчиков в проект.
- `ChatMessage` — сообщения чата (включая `sentAt`).
- `ProjectTask` — задачи канбана.
- `ProjectImage` — изображения галереи проекта.

## 6) Фронтенд: текущая структура (после декомпозиции)

- `src/app.vue`  
  Корневой рендер `NuxtLayout + NuxtPage`.

- `src/layouts/default.vue`  
  Глобальный layout: шапка, навигация, переключение темы, сессионный блок.

- `src/pages/index.vue`  
  Главная: форма создания проекта (для разработчика) + список проектов.

- `src/pages/cabinet.vue`  
  Кабинет / дополнительный сценарий для авторизованного пользователя (маршрут `/cabinet`).

- `src/pages/projects/[id].vue`  
  Тонкий orchestration-роут: собирает composables и рендерит `ProjectDetailsPage`.

- `src/features/session-switcher/ui/SessionSwitcher.vue`  
  Вход по логину/паролю, выход, отображение текущей сессии.

- `src/features/theme-toggle/ui/ThemeToggle.vue`  
  Переключение `light/dark`.

- `src/features/project-create/ui/ProjectCreateForm.vue`  
  Создание проекта (статус, public/private, hidden).

- `src/features/project-chat`
  - `model/useProjectChat.ts` — загрузка/отправка сообщений, lifecycle SSE (`subscribe/unsubscribe`).
  - `ui/ProjectChatPanel.vue` — UI чата.

- `src/features/project-tasks`
  - `model/useProjectTasks.ts` — CRUD задач, вычисления для канбана и прав.
  - `ui/ProjectKanbanBoard.vue` — UI доски.

- `src/features/project-images`
  - `model/useProjectImages.ts` — загрузка/удаление/preview/upload изображений.
  - `ui/ProjectGallery.vue` — галерея.
  - `ui/ImagePreviewOverlay.vue` — полноэкранный preview.

- `src/features/project-members/ui/ProjectMembersManager.vue`
  Управление назначенными/доступными заказчиками.

- `src/features/project-edit/ui/ProjectEditForm.vue`
  Отдельная форма редактирования проекта.

- `src/widgets/project-list/ui/ProjectList.vue`  
  Фильтрация и вывод списка проектов.

- `src/entities/project/ui/ProjectCard.vue`  
  Карточка проекта: статус, тип доступа, кнопка перехода.

- `src/entities/project/model`
  - `useProjectId.ts` — получение/валидация `projectId` из роута.
  - `useProject.ts` — загрузка проекта, edit form, сохранение, архивирование.
  - `useProjectMembers.ts` — загрузка пользователей, назначение/удаление участников.

- `src/widgets/project-details/ui/ProjectDetailsPage.vue`
  Компоновка вкладок проекта (overview/kanban/chat) из feature-компонентов.

- `src/shared/api/client.ts`  
  Общий клиент запросов (`credentials: include`) + инициализация текущего пользователя.

- `src/shared/types/domain.ts`  
  Единые TS-типы домена для фронта.

- `src/shared/lib/date/formatMessageDate.ts`
  Форматирование timestamp сообщений чата.

- `src/assets/css/main.css`  
  Базовые глобальные стили, темы, стеклянные панели, кнопки/инпуты.

## 7) Backend API: что делает каждый модуль

### Auth (`server/api/auth`)
- `login.post.ts` — вход по логину и паролю, установка JWT-cookie.
- `me.get.ts` — возврат текущего пользователя по cookie.
- `logout.post.ts` — очистка auth-cookie.

### Users (`server/api/users`)
- `index.get.ts` — список пользователей (ограниченный набор полей).
- `index.post.ts` — создание клиента разработчиком (имя, логин, пароль).

### Projects (`server/api/projects`)
- `index.get.ts` — список проектов с фильтрами и логикой видимости.
- `index.post.ts` — создание проекта.
- `[id].get.ts` — детали проекта с проверками доступа.
- `[id].patch.ts` — редактирование проекта.
- `[id]/archive.post.ts` — архивирование проекта.

### Members (`server/api/projects/[id]/members`)
- `index.post.ts` — добавить участника в проект.
- `[memberId].delete.ts` — удалить участника из проекта.

### Chat (`server/api/projects/[id]/chat`)
- `chat.get.ts` — получить сообщения.
- `chat.post.ts` — отправить сообщение.
- `chat/stream.get.ts` — SSE-поток обновлений сообщений.

### Tasks (`server/api/projects/[id]/tasks`)
- `index.get.ts` — список задач проекта.
- `index.post.ts` — создание задачи.
- `[taskId].patch.ts` — изменение задачи (включая перемещение по статусу).
- `[taskId].delete.ts` — удаление задачи.

### Images (`server/api/projects/[id]/images`)
- `index.get.ts` — список изображений проекта.
- `index.post.ts` — загрузка изображения в проект.
- `[imageId].delete.ts` — удаление изображения.

### Seed
- `seed.post.ts` — наполнение демо-данными и начальной учеткой.

## 8) Служебные backend-утилиты

- `server/utils/prisma.ts` — singleton Prisma client.
- `server/utils/auth.ts` — hash/verify password, JWT sign/verify, cookie-операции, текущий пользователь.
- `server/utils/project.ts` — общая загрузка проекта с участниками/проверки.

## 9) Конфигурация

- `nuxt.config.ts`
  - SSR включен;
  - **Tailwind:** в блоке `tailwindcss.config.content` задано явное сканирование `./src/**/*.{vue,js,ts,mjs}` — после отказа от глобального списка компонентов стандартный content модуля не покрывал FSD-слои, из‑за чего классы «пропадали»; такой glob снова подхватывает все слои под `src/`;
  - CORS для `/api/**` (доступ с другого локального сайта);
  - color mode с сохранением в `localStorage`.

- `.env` / `.env.example`
  - `DATABASE_URL` — для SQLite по умолчанию `file:./dev.db` (файл БД появится рядом с проектом после `db push`);
  - `JWT_SECRET`
  - `CORS_ORIGIN`

## 10) Запуск проекта и Prisma

Развёртывание за nginx MySite на префиксе `/dashboard/` (Docker, общая сеть, API интеграции с визиткой): отдельный файл **[DEPLOY.md](DEPLOY.md)**.

1. Скопируйте `.env.example` в `.env` и при необходимости поправьте переменные.
2. Установите зависимости и сгенерируйте Prisma Client (в `prepare` это тоже есть):

```bash
npm install
npm run prisma:generate
```

3. Примените схему к локальной SQLite (без отдельных файлов миграций в репозитории — режим `db push`):

```bash
npm run prisma:push
```

4. Схема и комментарии к модели: `prisma/schema.prisma`. После изменений схемы снова выполните `prisma:generate` и `prisma:push`.

5. Запуск dev-сервера:

```bash
npm run dev
```

Перед коммитом полезно прогнать проверку границ FSD и сборку:

```bash
npm run fsd:check && npm run build
```

Сборка production и превью:

```bash
npm run build
npm run preview
```

После своих изменений: зафиксируйте коммит и отправьте ветку в удалённый репозиторий (например `main`), **без** секретов и токенов в сообщениях коммита.

## 11) Ключевые пользовательские сценарии

- Разработчик логинится, создает проект, назначает заказчиков.
- Заказчик видит доступные проекты по правилам приватности.
- Назначенные участники общаются в проектном чате (в realtime режиме).
- Участники ведут задачи в канбане.
- Разработчик хранит и просматривает проектные изображения в галерее.

## 12) Почему именно такой подход

- **Nuxt fullstack** уменьшает количество инфраструктуры (одна кодовая база для UI и API).
- **Prisma + SQLite** дает быстрый старт и понятную схему данных.
- **JWT в cookie** упрощает безопасную сессию для SSR/API.
- **FSD-структура** упорядочивает рост фронтенда и снижает связность.
- **SSE** достаточно для чата без усложнения WebSocket-инфраструктурой.
