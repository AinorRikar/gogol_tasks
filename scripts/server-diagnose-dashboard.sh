#!/bin/sh
# Диагностика 502 на сервере (запускать там, где установлен Docker).
# Замените <edge-nginx> на имя контейнера nginx основного сайта.
set -e

EDGE_NGINX="${EDGE_NGINX:-edge-nginx}"

echo "=== Containers ==="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'gogol|nginx|NAMES' || true

echo ""
echo "=== gogol-dashboard logs (last 40 lines) ==="
docker logs gogol-dashboard --tail 40 2>&1 || echo "Container gogol-dashboard not found"

echo ""
echo "=== Network web ==="
docker network inspect web --format '{{range .Containers}}{{.Name}} {{end}}' 2>&1 || echo "Network web missing"

echo ""
echo "=== Probe from nginx (EDGE_NGINX=$EDGE_NGINX) ==="
docker exec "$EDGE_NGINX" wget -qSO- --timeout=5 http://gogol-dashboard:3000/dashboard/ 2>&1 | head -15 || echo "wget failed (set EDGE_NGINX=your-nginx-container)"
