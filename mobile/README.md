# SPION Mobile — Frontend

Smart Protection & Intrusion Observation Network. This is the **frontend-only**
build of the SPION mobile app (React Native + Expo + TypeScript), driven by
mock data in `src/data/mockData.ts`. It is structured so a backend can be
wired in later without touching any screen/UI code.

## Structure

```
App.tsx                     Entry point: loads fonts, sets up navigation
src/
  theme/theme.ts             Colors, spacing, typography — single source of truth
  types/index.ts              Shared TypeScript domain types
  data/mockData.ts             Placeholder data (swap for API calls later)
  utils/date.ts                 Formatting helpers
  navigation/
    RootNavigator.tsx           Bottom tab navigator
    types.ts                     Navigation type helpers
  components/                  Reusable UI building blocks
  screens/
    DashboardScreen.tsx          Risk gauge, stats, recent activity
    ActivityLogScreen.tsx        Searchable/filterable event log
    AnalyticsScreen.tsx           Risk trend chart + category breakdown
    AlertsScreen.tsx              Actionable alerts with acknowledge flow
    SettingsScreen.tsx             Monitoring & notification preferences
```

## Swapping in a backend later

Every screen reads from `src/data/mockData.ts`. When the backend is ready,
replace those imports with API calls (e.g. React Query hooks) that return the
same shapes defined in `src/types/index.ts` — no screen code needs to change.
