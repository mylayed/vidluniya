# 🎧 Відлуння

Голосові капсули на карті: запиши голосове й «закопай» його в точці — почути його зможе лише той, хто прийде на місце.
План розробки — у [PLAN.md](PLAN.md).

## Запуск

```bash
npm install
npx expo start          # Expo Go / dev build
npx expo start --web    # швидкий перегляд у браузері
```

## Supabase

1. Скопіюйте `.env.example` у `.env` і впишіть Project URL та publishable-ключ (Project Settings → API).
2. Виконайте [міграцію](supabase/migrations/20261106000000_init.sql) у SQL Editor (один раз).
3. Вхід через Google: **Authentication → Providers → Google** (Client ID і Secret із Google Cloud), а в
   **Authentication → URL Configuration → Redirect URLs** додайте:
   - `vidlunnia://**` — dev/production збірки;
   - `exp://**` — Expo Go;
   - `http://localhost:8081` — web-перегляд.
4. Після зміни `.env` перезапустіть `npx expo start`.

Secret-ключ (`sb_secret_...`) у застосунок і в `.env` не додається: він лише для Edge Functions.

## Перевірки

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Структура

```
src/
  app/                  # екрани (expo-router)
    _layout.tsx         # шрифти, теми, i18n, захищені маршрути
    onboarding.tsx      # 3 слайди + дозволи
    sign-in.tsx         # вхід (поки тестовий, Supabase — далі)
    (tabs)/             # Карта, Профіль
  components/           # UI-компоненти, хвиля капсули
  features/session/     # стан онбордингу й входу
  i18n/                 # uk / en
  lib/storage.ts        # несекретні налаштування
  theme/                # дизайн-токени, світла/темна тема
```

Стек: Expo SDK 58, TypeScript, expo-router, i18next, Unbounded + Manrope.
