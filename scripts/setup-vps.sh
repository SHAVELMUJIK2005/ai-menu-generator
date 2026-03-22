#!/bin/bash
# Первичная настройка VPS для AI Menu Generator
# Запускать под root или через sudo
# Проверено на Ubuntu 22.04 LTS

set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "Использование: ./setup-vps.sh your-domain.com"
  exit 1
fi

echo "=== Настройка VPS для AI Menu Generator ==="
echo "Домен: $DOMAIN"

# 1. Обновление системы
apt-get update && apt-get upgrade -y

# 2. Установка зависимостей
apt-get install -y \
  curl \
  git \
  ufw \
  fail2ban \
  htop

# 3. Установка Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 4. Firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "Firewall настроен"

# 5. Создание рабочей директории
mkdir -p /opt/menu-app/nginx/ssl
chown -R $SUDO_USER:$SUDO_USER /opt/menu-app 2>/dev/null || true

# 6. Fail2ban для защиты от брутфорса
systemctl enable fail2ban
systemctl start fail2ban

# 7. Настройка Certbot для SSL
echo "=== Получение SSL-сертификата ==="
apt-get install -y certbot

# Запускаем временный HTTP-сервер для верификации
certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "admin@${DOMAIN}" \
  -d "${DOMAIN}" || {
    echo "ПРЕДУПРЕЖДЕНИЕ: SSL-сертификат не получен. Запустите вручную после настройки DNS."
  }

# 8. Автообновление сертификата
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/menu-app/docker-compose.prod.yml restart nginx") | crontab -

echo ""
echo "=== VPS настроен! ==="
echo ""
echo "Следующие шаги:"
echo "1. Добавьте GitHub Secrets в репозитории:"
echo "   VPS_HOST, VPS_USER, VPS_SSH_KEY"
echo "   POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD"
echo "   REDIS_PASSWORD, JWT_SECRET, TG_BOT_TOKEN, OPENROUTER_API_KEY"
echo "   DOMAIN=$DOMAIN"
echo ""
echo "2. Обновите nginx.conf: замените \${DOMAIN} на $DOMAIN"
echo ""
echo "3. Задеплойте: git push origin main"
