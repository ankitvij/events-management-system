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
