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

## References consulted

- Expo create project and TypeScript guides: https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/guides/typescript/
- Expo Continuous Native Generation: https://docs.expo.dev/workflow/continuous-native-generation/
- Supabase Expo React Native quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Express 5 and Zod v4 official docs via Context7; pnpm workspace/script docs via Context7 (see `spec/01-tech-stack.md`).
