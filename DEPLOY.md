# Развёртывание Gogol Dashboard

Инструкция для сценария: **основной сайт** отдаётся публичным nginx, дашборд живёт в Docker на том же сервере по префиксу `/dashboard/` (или другому — через `NUXT_PUBLIC_APP_BASEURL`).

Контракт Integration API для внешнего сайта: **[API.md](API.md)**.

## Схема

```text
Интернет → nginx (основной сайт) :80 / :443
              ├─ /              → upstream основного приложения
              └─ /dashboard/    → http://gogol-dashboard:3000/dashboard/

Docker network "web":
  - контейнер edge-nginx (проброс 80/443 на хост)
  - контейнер основного приложения
  - контейнер gogol-dashboard (порт 3000 только внутри сети)
```

Дашборд **не пробрасывает** порт 3000 на хост — к нему ходит только nginx по имени сервиса `gogol-dashboard`.

## Один раз на сервере

```bash
docker network create web
```

В `docker-compose.yml` **основного сайта** и **дашборда** укажите:

```yaml
networks:
  web:
    external: true
    name: web
```

## Nginx основного сайта

Пример фрагмента `location` (имена upstream подставьте свои):

```nginx
location /dashboard/ {
  proxy_pass http://gogol-dashboard:3000/dashboard/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

После правки конфига:

```bash
docker exec <edge-nginx> nginx -t
docker exec <edge-nginx> nginx -s reload
```

## Переменные окружения дашборда

Создайте `.env` рядом с `docker-compose.yml` дашборда:

```env
JWT_SECRET=длинная-случайная-строка
INTEGRATION_SECRET=другая-длинная-строка-общая-с-клиентом-сайта
CORS_ORIGIN=https://ваш-публичный-хост
```

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | В compose: `file:/data/prod.db` (том `gogol-sqlite-data`) |
| `JWT_SECRET` | Подпись cookie-сессии CRM |
| `INTEGRATION_SECRET` | Секрет для `/api/integration/*` (см. [API.md](API.md)) |
| `NUXT_PUBLIC_APP_BASEURL` | В compose: `/dashboard/` (должен совпадать с build-arg в Dockerfile) |
| `CORS_ORIGIN` | Разрешённый origin для `/api/**` (если API вызывают с другого домена) |
| `UPLOADS_DIR` | Каталог загрузок в контейнере (`/data/uploads`, том `gogol-uploads`) |
| `PUBLIC_APP_ORIGIN` | Публичный `http(s)://хост` для абсолютных URL картинок в API (без пути) |

## Первый деплой

```bash
cd /path/to/gogol-dashboard
cp .env.example .env   # и заполните секреты
docker compose build --no-cache
docker compose up -d
```

При старте контейнера [docker-entrypoint.sh](docker-entrypoint.sh):

1. при необходимости применяет SQL-миграции к существующей БД;
2. выполняет `prisma db push`;
3. запускает Nitro на порту 3000.

Демо-данные (опционально): `POST /api/seed` — разработчик `admin` / `12345678`.

## Обновление уже развёрнутого дашборда

Типичный цикл после `git pull`:

```bash
cd /path/to/gogol-dashboard
git pull
docker compose build --no-cache    # при смене схемы Prisma или entrypoint
docker compose up -d --force-recreate
docker logs gogol-dashboard --tail 50
```

Для небольшого патча без смены схемы часто достаточно:

```bash
docker compose up -d --build
```

Обновление **только дашборда** не требует пересборки основного сайта (и наоборот). У пересоздаваемого контейнера возможен простой в несколько секунд.

## Миграции SQLite (существующая prod-БД)

Entrypoint автоматически проверяет старую схему и применяет SQL из `prisma/migrations/`:

| Условие | Файл |
|---------|------|
| В `User` ещё есть колонка `email` | `email-to-login.sql` |
| В `Project` ещё есть колонка `description` | `project-descriptions.sql` |

Ручной запуск (если контейнер не стартует):

```bash
docker exec -i gogol-dashboard sh -c 'sqlite3 /data/prod.db' < prisma/migrations/email-to-login.sql
docker exec -i gogol-dashboard sh -c 'sqlite3 /data/prod.db' < prisma/migrations/project-descriptions.sql
docker exec gogol-dashboard npx prisma db push
```

**Внимание:** без бэкапа тома `gogol-sqlite-data` удаление `prod.db` уничтожит данные.

## Картинки не отображаются (видно только имя файла)

1. **Образ после коммита с `server/routes/uploads` и томом `gogol-uploads`** — в `.env` должны быть актуальные `docker-compose.yml` (том `gogol-uploads`, `UPLOADS_DIR=/data/uploads`). Пересоберите: `docker compose build --no-cache && docker compose up -d --force-recreate`.

2. **Файлы не переносятся с локальной машины** — в БД есть `fileUrl`, но сами файлы лежали в локальном `public/uploads`. На сервере их нужно **загрузить заново** через галерею или скопировать в том:
   ```bash
   docker cp ./uploads/. gogol-dashboard:/data/uploads/
   ```

3. **`PUBLIC_APP_ORIGIN` для Integration API** — если внешний сайт запрашивает API по внутреннему имени Docker (`http://gogol-dashboard:3000/...`), в ответе будут битые ссылки вида `http://gogol-dashboard:3000/dashboard/uploads/...`. В `.env` дашборда задайте:
   ```env
   PUBLIC_APP_ORIGIN=http://ВАШ_ПУБЛИЧНЫЙ_IP
   ```
   (без `/dashboard` в конце; путь добавится автоматически).

4. **Проверка отдачи файла** (подставьте реальное имя из БД):
   ```bash
   curl -sI "http://127.0.0.1/dashboard/uploads/projects/ИМЯ_ФАЙЛА.jpg"
   ```
   Ожидается `HTTP/1.1 200` и `Content-Type: image/...`. Из контейнера nginx:
   ```bash
   docker exec <edge-nginx> wget -qSO- --timeout=3 "http://gogol-dashboard:3000/dashboard/uploads/projects/ИМЯ_ФАЙЛА.jpg" 2>&1 | head
   ```

## 502 Bad Gateway на `/dashboard/`

Обычно nginx не достучался до `gogol-dashboard:3000` (контейнер упал при старте).

```bash
docker ps -a | grep gogol-dashboard
docker logs gogol-dashboard --tail 80
```

| Сообщение в логах | Действие |
|-------------------|----------|
| `FATAL: prisma db push failed` | Миграции выше или обновите образ с актуальным entrypoint |
| `Prisma schema not found` | `docker compose build --no-cache` из корня репозитория |
| `set JWT_SECRET in .env` | Заполните `.env` и `docker compose up -d` |

Проверка из контейнера nginx:

```bash
docker exec <edge-nginx> wget -qO- --timeout=3 http://gogol-dashboard:3000/dashboard/ 2>&1 | head
```

Если здесь HTML, а снаружи 502 — смотрите `location /dashboard/` в nginx.

### Сайт целиком не открывается

1. Контейнеры в сети `web`: `docker network inspect web`
2. Логи edge-nginx и основного приложения
3. С хоста: `curl -v --max-time 5 http://127.0.0.1/`
4. Не используйте `https://IP`, если SSL в nginx ещё не настроен — проверяйте `http://`

## Сборка Docker и Prisma

В Dockerfile используется `npm ci --ignore-scripts`, затем `COPY` исходников и отдельно `prisma generate` — иначе `prepare` в package.json падает до появления `prisma/schema.prisma`.

Если ошибка «Could not find Prisma Schema» на шаге `npm ci`:

- сборка из корня репозитория (`ls prisma/schema.prisma`);
- в `.dockerignore` не исключена папка `prisma/` (игнорируются только `*.db`);
- пересоберите: `docker compose build --no-cache`.

## Локальная разработка

Без префикса: не задавайте `NUXT_PUBLIC_APP_BASEURL` (или `/`). Cookie и пути API — от корня.

Проверка «как в проде»:

```bash
NUXT_PUBLIC_APP_BASEURL=/dashboard/ npm run dev
```

Диагностика на сервере (опционально): [scripts/server-diagnose-dashboard.sh](scripts/server-diagnose-dashboard.sh).
