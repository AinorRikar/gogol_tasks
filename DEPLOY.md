# Деплой дашборда рядом с MySite (один IP: `/` и `/dashboard/`)

## Идея

- Снаружи открыт только **nginx из проекта MySite** (порты 80 / при необходимости 443).
- Контейнер **gogol-dashboard** слушает **3000 только во внутренней сети Docker**, на хост не пробрасывается.
- Оба стека подключены к **одной сети** с именем `web`.

## Один раз на сервере

```bash
docker network create web
```

Если сеть уже создана старым compose MySite под другим именем — либо переименуйте/пересоздайте, либо укажите то же `name:` в обоих `docker-compose.yml`.

## MySite

В репозитории MySite:

- `docker-compose.yml` использует `networks.web.external: true`, `name: web`.
- `nginx/conf.d/default.conf` проксирует `/dashboard/` на сервис `gogol-dashboard:3000`.

После изменения nginx:

```bash
cd /path/to/MySite
docker compose up -d
# при правке только конфига nginx:
docker exec mysite-nginx nginx -s reload
```

## Дашборд (этот проект)

Создайте `.env` рядом с `docker-compose.yml`:

```env
JWT_SECRET=длинная-случайная-строка
INTEGRATION_SECRET=другая-случайная-строка-общая-с-MySite
CORS_ORIGIN=http://ВАШ_IP
```

Сборка и запуск:

```bash
cd /path/to/gogol_tasks
docker compose build
docker compose up -d
```

При старте контейнера выполняется `prisma db push` к файлу `file:/data/prod.db` в томе `gogol-sqlite-data`.

### Ошибка «Could not find Prisma Schema»

Обычно это значит одно из трёх:

1. **Сборка не из корня репозитория** — `docker compose build` нужно запускать из каталога, где лежат `Dockerfile`, `prisma/schema.prisma` и `package.json`. Проверка: `ls prisma/schema.prisma`.
2. **В `.dockerignore` случайно игнорируется вся папка `prisma`** — в репозитории игнорируются только `*.db` в `prisma/`, не сам `schema.prisma`. Если правили ignore на сервере — уберите строку, которая отрезает `prisma`.
3. **Запускали `prisma` на хосте** не из каталога проекта — для продакшена схема должна быть в образе; пересоберите: `docker compose build --no-cache && docker compose up -d`.

В образе при сборке проверяется наличие `/app/prisma/schema.prisma` и CLI в `node_modules/.bin/prisma`; если сборка падает на этом шаге — в контекст сборки не попала схема.

## Обновление без остановки «всего Docker»

- Обновляете **только MySite**: `cd MySite && docker compose build app && docker compose up -d app` — nginx и дашборд продолжают работать.
- Обновляете **только дашборд**: `cd gogol_tasks && docker compose build && docker compose up -d` — MySite не трогается.

У пересоздаваемого контейнера возможен короткий простой (секунды). Полный zero-downtime — два инстанса и переключение upstream в nginx (см. обсуждение в плане).

## API для MySite (портфолио)

Узкие маршруты (нужны **INTEGRATION_SECRET** на дашборде и тот же секрет на MySite):

- `GET /dashboard/api/integration/portfolio` — список проектов с `useForPortfolio`.
- `GET /dashboard/api/integration/projects/:id` — карточка (только портфельные, не архив; правила как у гостя).

Токен: JWT **HS256**, срок жизни до **3 минут**, payload произвольный (например `{ "iss": "mysite" }`).

Пример выдачи токена на стороне MySite (Node, тот же `jsonwebtoken`):

```js
import jwt from "jsonwebtoken";

export function mintDashboardIntegrationToken() {
  return jwt.sign({ iss: "mysite" }, process.env.INTEGRATION_SECRET, {
    expiresIn: "2m",
    algorithm: "HS256"
  });
}
```

Запрос с MySite (SSR или прокси):

```http
GET http://gogol-dashboard:3000/dashboard/api/integration/portfolio
Authorization: Bearer <token>
```

С браузера (после того как сервер MySite отдал токен на страницу):

```http
GET http://ВАШ_IP/dashboard/api/integration/portfolio
Authorization: Bearer <token>
```

Внутренний URL использует имя сервиса Docker; с браузера — публичный хост и префикс `/dashboard/`.

## Переменные окружения дашборда

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | В compose задан `file:/data/prod.db` |
| `JWT_SECRET` | Подпись cookie-сессии |
| `INTEGRATION_SECRET` | Общий секрет с MySite для `/api/integration/*` |
| `NUXT_PUBLIC_APP_BASEURL` | В compose: `/dashboard/` (должен совпадать с build-arg в Dockerfile) |
| `CORS_ORIGIN` | Для кросс-origin (при одном хосте с MySite обычно не критично) |

## Локальная разработка

Без префикса: не задавайте `NUXT_PUBLIC_APP_BASEURL` (или `/`). Cookie и клиентские пути останутся от корня.

Проверка «как в проде»: `NUXT_PUBLIC_APP_BASEURL=/dashboard/ npm run dev` и локальный nginx не обязателен, если смотрите только относительные пути (часть сценариев удобнее проверять через Docker).
