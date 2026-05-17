# Integration API (портфолио)

Read-only API для **внешнего сайта** (портфолио, лендинг, витрина): забирает проекты, отмеченные в дашборде флагом «для портфолио». Сессия CRM (cookie/JWT пользователя) **не используется**.

Остальные маршруты (`/api/auth`, `/api/projects`, …) предназначены только для веб-интерфейса Gogol Dashboard.

## Базовый URL

| Окружение | Пример |
|-----------|--------|
| Локальная разработка | `http://localhost:3000/api/integration/...` |
| За reverse proxy с префиксом | `https://example.com/dashboard/api/integration/...` |

Префикс задаётся переменной `NUXT_PUBLIC_APP_BASEURL` (в Docker обычно `/dashboard/`). Все пути ниже — от корня приложения: `/api/integration/...`.

## Аутентификация

На дашборде и на стороне клиента должен быть **один и тот же** секрет `INTEGRATION_SECRET`.

Клиент передаёт **короткоживущий JWT** (HS256, срок жизни до **3 минут**):

- заголовок `Authorization: Bearer <token>`, или
- заголовок `X-Site-Token: <token>`.

Токен должен выдаваться **только на сервере** клиента (SSR, BFF, cron). Не встраивайте `INTEGRATION_SECRET` во фронтенд без прокси.

### Пример выдачи токена (Node.js)

```js
import jwt from "jsonwebtoken";

export function mintIntegrationToken() {
  return jwt.sign({ iss: "portfolio" }, process.env.INTEGRATION_SECRET, {
    expiresIn: "2m",
    algorithm: "HS256"
  });
}
```

### Пример запроса

```http
GET /api/integration/portfolio HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Из Docker-сети (без публичного nginx):

```http
GET http://gogol-dashboard:3000/dashboard/api/integration/portfolio
Authorization: Bearer <token>
```

## Эндпоинты

### `GET /api/integration/portfolio`

Список проектов для витрины.

**Условия отбора:** `useForPortfolio: true`, `archivedAt: null`.

**Ответ:** JSON-массив объектов проекта (см. DTO ниже), сортировка по `updatedAt` (новые первые).

### `GET /api/integration/projects/:id`

Один проект по `id`.

**Условия:** тот же отбор, что для портфолио; приватный проект (`visibility: false`) без доступа гостя → **403**.

**Ответ:** один объект проекта (DTO) или **404**, если проект не найден / не в портфеле / в архиве.

## DTO проекта

Поля одного объекта в ответе `portfolio` и `projects/:id`:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | number | Идентификатор |
| `title` | string | Название (для `hidden` — см. маскировку) |
| `shortDescription` | string | Краткое описание (карточка) |
| `fullDescription` | string | Полное описание |
| `version` | string | Версия, например `1.2.0` |
| `status` | string | `ACTIVE`, `COMPLETED`, `ABANDONED`, `SUPPORTED`, `PLANNING` |
| `visibility` | boolean | Публичный список |
| `hidden` | boolean | Скрытый контент для посторонних |
| `useForPortfolio` | boolean | Участие в портфеле |
| `techStack` | string | Технологии через запятую |
| `archivedAt` | string \| null | ISO-дата архива или `null` |
| `createdAt` | string | ISO-дата |
| `updatedAt` | string | ISO-дата |
| `referenceBlocks` | array | `{ id, title, content, order }[]` |
| `images` | array | `{ id, fileName, fileUrl, mimeType }[]` — `fileUrl` **абсолютный** |
| `links` | array | `{ id, url, title, iconUrl }[]` |
| `members` | array | `{ id, name }[]` |

Абсолютный URL картинок строится из `Host`, `X-Forwarded-Proto` и `NUXT_PUBLIC_APP_BASEURL` (см. `server/utils/assetUrl.ts`).

### Пример ответа (сокращённо)

```json
[
  {
    "id": 1,
    "title": "CRM dashboard",
    "shortDescription": "Публичный проект для демонстрации.",
    "fullDescription": "Полное описание проекта…",
    "version": "1.0.0",
    "status": "ACTIVE",
    "visibility": true,
    "hidden": false,
    "useForPortfolio": true,
    "techStack": "Nuxt, Vue, Prisma",
    "archivedAt": null,
    "createdAt": "2026-01-01T12:00:00.000Z",
    "updatedAt": "2026-05-01T12:00:00.000Z",
    "referenceBlocks": [
      { "id": 1, "title": "Активные пользователи", "content": "+40% за квартал", "order": 0 }
    ],
    "images": [
      {
        "id": 1,
        "fileName": "screen.png",
        "fileUrl": "https://example.com/dashboard/uploads/1/screen.png",
        "mimeType": "image/png"
      }
    ],
    "links": [
      { "id": 1, "url": "https://github.com/...", "title": "Репозиторий", "iconUrl": "https://..." }
    ],
    "members": [{ "id": 2, "name": "Мария Заказчик" }]
  }
]
```

## Маскировка скрытых проектов (`hidden: true`)

Для зрителя без прав (как **гость** в CRM) действуют те же правила, что в `server/utils/projectSerializer.ts`:

- `title` → заглушка «Скрытый проект»;
- `shortDescription`, `fullDescription`, `version`, `techStack` → пустые или заглушка текста;
- `referenceBlocks`, `images`, `links` → пустые массивы.

Поля `visibility`, `hidden`, `status` остаются в ответе для логики на стороне клиента.

## Коды ошибок

| Код | Когда |
|-----|--------|
| **401** | Нет токена или неверная подпись / истёк срок |
| **403** | Проект не публичный (`visibility: false`) |
| **404** | Нет проекта, не в портфеле или в архиве |
| **503** | На дашборде не задан `INTEGRATION_SECRET` |

## Настройка на дашборде

В `.env` (см. [.env.example](.env.example)):

```env
INTEGRATION_SECRET="длинная-случайная-строка-общая-с-клиентом"
```

Тот же секрет — в окружении сервера, который запрашивает API.

Если API вызывают **из Docker-сети** (не через публичный nginx), на дашборде задайте `PUBLIC_APP_ORIGIN=http://ваш-публичный-хост` — иначе в `fileUrl` картинок попадёт внутреннее имя контейнера.

Развёртывание дашборда: [DEPLOY.md](DEPLOY.md).
