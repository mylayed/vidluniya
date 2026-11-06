# 🎧 Відлуння

Голосові капсули на карті: запиши голосове й «закопай» його в точці — почути його зможе лише той, хто прийде на місце.
План розробки — у [PLAN.md](PLAN.md).

## Запуск

```bash
npm install
npx expo start          # Expo Go / dev build
npx expo start --web    # швидкий перегляд у браузері
```

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
