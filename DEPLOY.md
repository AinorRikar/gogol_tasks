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

### Сайт не открывается по IP (ни `/`, ни `/dashboard/`)

1. **Проверьте контейнеры и сеть `web`**

```bash
docker ps -a | grep -E 'mysite|gogol'
docker network inspect web --format '{{range .Containers}}{{.Name}} {{end}}'
```

В списке сети должны быть как минимум: `mysite-nginx`, `mysite-app`, `gogol-dashboard`. Если чего-то нет — этот стек не подключён к `web` или контейнер упал.

2. **Логи**

```bash
docker logs mysite-nginx --tail 80
docker logs mysite-app --tail 80
docker logs gogol-dashboard --tail 80
```

Сообщения вида `host not found in upstream` / `no resolver defined` — проблема имён или конфига nginx.

3. **Доступность бэкендов из nginx**

```bash
docker exec mysite-nginx wget -qO- --timeout=3 http://mysite-app:3000/ 2>&1 | head
docker exec mysite-nginx wget -qO- --timeout=3 http://gogol-dashboard:3000/dashboard/ 2>&1 | head
```

Первая команда — визитка, вторая — дашборд. Если первая падает, **главная страница** не откроется (nginx отдаст 502).

4. **Upstream в nginx** — для визитки в конфиге указано **`mysite-app:3000`** (имя контейнера), не абстрактное `app`: на общей внешней сети имя сервиса `app` иногда не резолвится. После правки конфига: `docker exec mysite-nginx nginx -t && docker exec mysite-nginx nginx -s reload`.

5. **Порт 80 с хоста**

```bash
curl -v --max-time 5 http://127.0.0.1/
```

На сервере должно ответить что-то от Nuxt (или редирект). Если «Connection refused» — порт не проброшен (`ports: "80:80"` у `mysite-nginx`) или фаервол режет входящие на 80.

6. **Не смешивайте `https://IP`**, если в `default.conf` ещё закомментирован блок `listen 443 ssl` — тогда снаружи открывайте **`http://IP`**.

## Дашборд (этот проект)

Создайте `.env` рядом с `docker-compose.yml`:

```env
JWT_SECRET=длинная-случайная-строка
INTEGRATION_SECRET=другая-случайная-строка-общая-с-MySite
CORS_ORIGIN=http://ВАШ_IP
```

Сборка и запуск (после `git pull` **обязательно** пересобрать образ, иначе контейнер останется на старом слое без схемы):

```bash
cd /path/to/gogol_tasks
docker compose build --no-cache
docker compose up -d --force-recreate
```

Быстрея вариант, если уверены в кэше: `docker compose up -d --build`. Если снова «schema not found» — только с `--no-cache`.

При старте контейнера выполняется `prisma db push` к файлу `file:/data/prod.db` в томе `gogol-sqlite-data`.

### Миграция `email` → `login` (существующая prod-БД)

Если в таблице `User` ещё колонка `email`, `db push` без сброса не сработает. Сохранить данные:

```bash
docker exec -i gogol-dashboard sh -c 'sqlite3 /data/prod.db' < prisma/migrations/email-to-login.sql
docker exec gogol-dashboard npx prisma db push
```

Либо после бэкапа тома `gogol-sqlite-data` удалить `prod.db` и пересоздать (`POST /api/seed` — разработчик `admin` / `12345678`).

### Ошибка «Could not find Prisma Schema» (часто на шаге **5/9** `RUN npm ci`)

Причина: в `package.json` скрипт **`prepare`** вызывает `prisma generate` сразу после установки пакетов, а в Dockerfile **`COPY . .` идёт только после `npm ci`**, поэтому файла `prisma/schema.prisma` ещё нет.

В Dockerfile используется **`npm ci --ignore-scripts`**, затем после копирования исходников вручную выполняются `prisma generate` и `nuxt prepare`.

Другие причины той же формулировки ошибки:

1. **Сборка не из корня репозитория** — проверка: `ls prisma/schema.prisma`.
2. **`.dockerignore` отрезает `prisma`** — в репозитории игнорируются только `prisma/*.db`.
3. **Старый образ без пересборки** — `docker compose build --no-cache`.

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
