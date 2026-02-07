# events-management-system

## Running tests / CI

This project uses a dedicated testing environment file `.env.testing`. It contains test database credentials and other test-friendly settings.

Local test steps:

1. Copy the example `.env.testing` (already included) if you need to modify values.

2. Ensure the test database exists (MySQL):

```bash
# create database if needed (replace <your_test_db> with your test DB name)
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS <your_test_db> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. Run migrations and seeders for tests as needed (the PHPUnit config uses the `testing` env vars):

```bash
# run migrations
php artisan migrate --env=testing --force

# optionally seed tickets or sample data
php artisan db:seed --class=TicketsSeeder --env=testing --force
```

4. Run the test suite (phpunit reads `.env.testing` when running):

```bash
php artisan test --compact
# or
vendor/bin/phpunit --configuration phpunit.xml
```

CI tips:

- Use the `.env.testing` values or set equivalent CI environment variables for the test database.
- Ensure your CI runner has MySQL available and create your test DB (replace `<your_test_db>`) before running migrations/tests.
- Run `php artisan migrate --env=testing --force` in CI before `php artisan test` when your CI environment does not run migrations automatically.

## Secret handling

- **Do not commit** secrets or `.env` files to the repository. Use `.env.example` to share required keys and variable names without values.
- If secrets are accidentally committed, **rotate** the exposed credentials immediately (database, mail, API keys, app keys).
- To remove secrets from git history, use a history-rewriting tool such as [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo`; after rewriting you must force-push and notify collaborators. Example commands (use with caution):

```bash
# Remove a file entirely from history (BFG)
java -jar bfg.jar --delete-files .env
# or with git filter-repo (recommended):
git filter-repo --path .env --invert-paths
# then force-push
git push --force origin main
```

- After rotating credentials and rewriting history, invalidate old credentials (revoke tokens, change passwords) and redeploy with new secrets stored securely (environment variables, secret manager, or CI secrets store).
- The project already includes `.env.example` as a template — copy it to `.env` locally and fill in secrets per environment.

## Security Guidelines

The following are concise, actionable security practices for this repository and its deployments.

- Secrets: never commit `.env` or any credentials into the repository. Use `.env.example` for variable names only. Store secrets in a secrets manager (GitHub Actions/Secrets, HashiCorp Vault, AWS Secrets Manager) or environment variables provided by your host.
- Least privilege: create separate database and service accounts per environment with the minimum permissions required. Avoid using `root`/admin credentials for app runtime.
- Rotate on exposure: if a secret is exposed, rotate it immediately (DB password, SMTP/API keys, `APP_KEY` if necessary) and revoke old tokens. Update CI/host secret stores and redeploy.
- APP_KEY caution: rotating `APP_KEY` will invalidate encrypted data and sessions. Plan and backup encrypted values before changing it in production.
- Access control: enable MFA for all developer and admin accounts, limit SSH access, and use fine-grained deploy keys for CI systems. Review collaborator and token access regularly.
- CI/CD: never print secrets in CI logs. Use ephemeral tokens for deploys and avoid baking secrets into build artifacts. Use masked secrets in pipelines.
- Scanning & dependency hygiene: run regular secret-scans (detect-secrets, trufflehog) and dependency vulnerability scans; keep dependencies up to date and apply security patches promptly.
- Logging & monitoring: enable structured logging, alerts for anomalous activity, and retain audit logs for investigations. Monitor failed login spikes and unusual database activity.
- Backups & recovery: maintain encrypted backups of critical data and test restore procedures periodically.
- Incident response: have a clear playbook — rotate affected secrets, remove secrets from history (git-filter-repo or BFG), revoke tokens, inform stakeholders, and verify remediation.

If you want, I can add a short `SECURITY.md` with contact and disclosure instructions for external reporters.

---

## Production deployment checklist

Follow these steps when deploying to a production server (example: `chancepass.com`). Adjust paths and commands for your environment.

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
export RAYON_NUM_THREADS=1
export LIGHTNINGCSS_NUM_THREADS=1
npm run build
```

4) Ensure Vite manifest path

Laravel expects the manifest at `public_html/build/manifest.json`. If the build writes it to `public_html/build/.vite/manifest.json`, copy it:

```bash
cp public_html/build/.vite/manifest.json public_html/build/manifest.json
```

5) Webserver document root

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

6) Create storage symlink

```bash
cd /path/to/project
php artisan storage:link
# verifies: ls -la public_html/storage -> ../storage/app/public
```

Note: Locally we use a Windows junction to achieve the same mapping (`public_html/storage` → `storage/app/public`).

7) Database migrations & seeders

```bash
php artisan migrate --force
php artisan db:seed --force   # optional
```

8) Cache & optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

9) Restart services

```bash
php artisan queue:restart
sudo systemctl reload php-fpm
sudo systemctl reload nginx
```

10) Verification

```bash
curl -I https://chancepass.com
php artisan migrate:status
```

11) Notes

- If images or assets 404, confirm `public_html` contains `index.php`, `build/` and a `storage` link to `storage/app/public`.
- This project uses Boost tooling; ensure `laravel/boost` is available if post-update composer scripts reference it.
- If you prefer a deploy script, I can produce one that runs these steps and supports rollbacks.
