#!/bin/sh
# Диагностика 502 на сервере (запускать там, где установлен Docker).
set -e

echo "=== Containers ==="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'gogol|mysite|NAMES' || true

echo ""
echo "=== gogol-dashboard logs (last 40 lines) ==="
docker logs gogol-dashboard --tail 40 2>&1 || echo "Container gogol-dashboard not found"

echo ""
echo "=== Network web ==="
docker network inspect web --format '{{range .Containers}}{{.Name}} {{end}}' 2>&1 || echo "Network web missing"

echo ""
echo "=== Probe from nginx ==="
docker exec mysite-nginx wget -qSO- --timeout=5 http://gogol-dashboard:3000/dashboard/ 2>&1 | head -15 || echo "wget failed"
