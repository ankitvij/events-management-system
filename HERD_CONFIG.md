This repository includes a minimal Herd project configuration to prefer `public_html` as the web root.

If your local Laravel Herd installation supports a repo-local config file (for example `herd.json`), it can use the `public`/`docroot` keys to set the document root.

What I added
- `herd.json` — sets `public_html` as the `public` / `docroot` value.

Verify locally
1. Restart Herd (or refresh the project in the Herd UI).
2. Visit: https://events.test and confirm the site loads and assets are served from `/build`.
3. If Herd does not pick up `herd.json`, open the Herd UI and set the project Document Root to `public_html`.

Storage link
- Locally I created a junction so `public_html/storage` points to `storage/app/public` (this exposes files stored by the app at `/storage/...`). On production run `php artisan storage:link` to create the same link under `public_html`.

Undo
- Remove `herd.json` or revert the Document Root in Herd UI to `public`.

Notes
- If Herd expects a different config filename/shape, edit `herd.json` accordingly or use the Herd UI.
