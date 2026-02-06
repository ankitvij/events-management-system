# Production Deployment Checklist

This document lists the recommended steps to deploy the application to a production server (example: `chancepass.com`). Adjust paths and commands for your environment.

1) Pull the release on the server

```bash
cd /var/www/chancepass
git fetch origin main
git checkout main
git pull --rebase origin main
```

2) Install PHP dependencies

```bash
composer install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction
```

3) Build frontend assets (either on server or CI)

```bash
# ensure Node is available (install or use nvm)
npm ci
npm run build
```

4) Webserver document root

- Ensure your webserver points to the `public_html` folder inside the project as the DocumentRoot / `root`.
- Example nginx `server` block snippet:

```nginx
server {
    listen 80;
    server_name chancepass.com www.chancepass.com;
    root /var/www/chancepass/public_html;
    index index.php index.html;
    # ... rest of vhost ...
}
```

5) Create storage symlink

```bash
cd /var/www/chancepass
php artisan storage:link
# verifies: ls -la public_html/storage -> ../storage/app/public
```

6) Database migrations & seeders

```bash
php artisan migrate --force
php artisan db:seed --force   # optional
```

7) Cache & optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

8) Restart services

```bash
php artisan queue:restart
sudo systemctl reload php-fpm
sudo systemctl reload nginx
```

9) Verification

```bash
curl -I https://chancepass.com
php artisan migrate:status
```

10) Notes

- If images or assets 404, confirm `public_html` contains `index.php`, `build/` and a `storage` link to `storage/app/public`.
- This project uses Boost tooling; ensure `laravel/boost` is available if post-update composer scripts reference it.
- If you prefer a deploy script, I can produce one that runs these steps and supports rollbacks.
