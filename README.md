# Flupy Time · Admin panel

Next.js admin UI for Flupy Time (connects to the existing Ponches / Flupy API).

## Requirements

- **Node.js 20+** (required for Tailwind CSS v4 / `@tailwindcss/oxide` native bindings)
- `NEXT_PUBLIC_API_URL` — public API origin, no trailing slash (e.g. `https://api.flupy.io`)

## Local development

```bash
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL

npm install
npm run dev
```

## Production build (Linux VPS)

If `npm run build` fails with **Cannot find native binding** (`@tailwindcss/oxide`) or **EBADENGINE**:

1. **Upgrade Node to 20 LTS** (Debian/Ubuntu example):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # should show v20.x
```

2. **Clean install** (fixes npm optional-dependency issues on Linux):

```bash
cd /var/www/Flupy-Time-Admin   # or your clone path
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. Run:

```bash
npm start
# or e.g. PORT=3000 pm2 start npm --name flupy-admin -- start
```

Use `.env` or `.env.production` on the server with `NEXT_PUBLIC_API_URL=...` before `npm run build` so the value is baked into the client bundle.

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Development server       |
| `npm run build`   | Production build         |
| `npm run start`   | Start production server  |
| `npm run clean`   | Remove `.next`           |
| `npm run build:clean` | Clean + build        |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
