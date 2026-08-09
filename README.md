# tizaia-mobile

Android MVP foundation for the teacher support app. The functional source of truth is the PDF specification and its normalized extraction in [`spec/`](spec/00-mission.md).

This bootstrap intentionally does not implement feature HUs, business tables, migrations, or RLS policies. See [`mobile/README.md`](mobile/README.md) for local Android setup.

## Repository workflow

- Issue: [#5](https://github.com/GenesisAI-team/tizaia-mobile/issues/5)
- Foundation branch: `chore/BOOTSTRAP-001-project-foundation`
- Android-only React Native + Expo app in `mobile/`

## References consulted

- Expo create project and TypeScript guides: https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/guides/typescript/
- Expo Continuous Native Generation: https://docs.expo.dev/workflow/continuous-native-generation/
- Supabase Expo React Native quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native

