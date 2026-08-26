# tizaia-mobile

Android MVP foundation for the teacher support app. The functional source of truth is the PDF specification and its normalized extraction in [`spec/`](spec/00-mission.md).

This bootstrap intentionally does not implement feature HUs, business tables, migrations, or RLS policies. See [`mobile/README.md`](mobile/README.md) for local Android setup.

## Repository layout

- `mobile/` — Android-only React Native + Expo app; consume la API del backend mediante un adaptador HTTP (`MOB-API-001`, `EXPO_PUBLIC_API_BASE_URL`).
- `backend/` — Node 22 + Express + Zod REST API over an in-memory store with deterministic seeds (API-001, [RFC-001](spec/07-assistant-backend-rfc.md)). See [`backend/README.md`](backend/README.md).

## Backend quickstart

```powershell
pnpm --dir backend install
pnpm --dir backend dev
curl http://localhost:3000/health
```

## CI (`.github/workflows/ci.yml`)

GitHub Actions runs two parallel jobs on every pull request to `main` and every
push to `main`:

| Job | Validates |
|---|---|
| **Mobile CI** | `pnpm --dir mobile validate` (typecheck, lint, tests, format) |
| **Backend CI** | `pnpm --dir backend validate` + `build` + smoke test (`/health` 200, `/v1/bootstrap` 200) |

### Reproduce locally

```bash
# Mobile
pnpm --dir mobile validate

# Backend
pnpm --dir backend validate
pnpm --dir backend build
node backend/dist/server.js &          # starts on port 3000
curl http://localhost:3000/health
curl http://localhost:3000/v1/bootstrap
```

### Branch protection (manual step)

Once the workflow is stable, configure branch protection rules for `main` to
require the following **required checks** before allowing merge:

- `Mobile CI`
- `Backend CI`

This is a one-time manual configuration in the GitHub repository settings
(Settings > Branches > Branch protection rules > Add rule).

## References consulted

- Expo create project and TypeScript guides: https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/guides/typescript/
- Expo Continuous Native Generation: https://docs.expo.dev/workflow/continuous-native-generation/
- Supabase Expo React Native quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Express 5 and Zod v4 official docs via Context7; pnpm workspace/script docs via Context7 (see `spec/01-tech-stack.md`).
