# Anixart Tizen TV

Неофициальный клиент [Anixart](https://anixart.tv) для Samsung Tizen Smart TV. Веб-приложение на чистом JS без фреймворков, адаптированное под управление ТВ-пультом (D-pad навигация).

Референс: оригинальное Android-приложение Anixart 10.0 (APK).

---

## Возможности

- **Главный экран** — горизонтальные ряды: "Интересное", "Рекомендации", "Смотрят сейчас", "Обсуждаемое" со skeleton-загрузкой
- **Поиск** — поиск по названию с debounce (400мс) и бесконечной прокруткой
- **Детали аниме** — постер с blur-фоном, описание, жанры, выбор озвучки/источника, список эпизодов, закладки, поделиться
- **Видеоплеер** — HTML5 video, управление пультом (play/pause, перемотка ±10с/±30с), навигация по эпизодам (пред./след./список), авто-переход, запоминание позиции
- **Закладки** — 5 вкладок (Смотрю / В планах / Просмотрено / Отложено / Брошено) с бесконечной прокруткой
- **Лента** — "Продолжить просмотр" (из истории), "Сейчас смотрят", "Обсуждаемое"
- **Профиль** — аватар, статистика, переключение темы (тёмная/светлая), выход
- **Авторизация** — вход по паролю или QR-коду через телефон
- **D-pad навигация** — полное управление ТВ-пультом с spatial navigation
- **История просмотра** — сохранение позиции воспроизведения в localStorage
- **Сетевые ретраи** — автоматический повтор при потере сети (2 попытки с нарастающей задержкой)
- **Тёмная/светлая тема** — CSS-переменные, переключение из профиля

---

## Архитектура

```
anixart-tizenOS/
├── index.html              # Точка входа, подключение всех скриптов
├── config.xml              # Tizen Widget конфиг (привилегии, разрешения)
├── auth-helper.html        # Страница-помощник для QR-логина (открывается на телефоне)
├── package.json            # npm-скрипты (serve, package)
├── src/
│   ├── app.js              # Роутер: history-стек, showScreen(), goBack()
│   ├── lib/
│   │   └── qrcode.js       # QR-генератор (без внешних зависимостей)
│   ├── api/
│   │   ├── client.js       # ApiClient — HTTP-клиент (XHR + Promise, retry)
│   │   ├── auth.js         # AuthApi — авторизация
│   │   ├── discover.js     # DiscoverApi — главная лента
│   │   ├── release.js      # ReleaseApi — детали, эпизоды, источники
│   │   ├── search.js       # SearchApi — поиск по названию
│   │   └── profile.js      # ProfileApi — профиль, закладки
│   ├── screens/
│   │   ├── login.js        # LoginScreen — вход (пароль + QR-код)
│   │   ├── home.js         # HomeScreen — главная с рядами карточек
│   │   ├── details.js      # DetailsScreen — страница аниме
│   │   ├── search.js       # SearchScreen — поиск аниме
│   │   ├── player.js       # PlayerScreen — видеоплеер
│   │   ├── bookmarks.js    # BookmarksScreen — закладки (5 категорий)
│   │   ├── feed.js         # FeedScreen — лента обновлений
│   │   └── profile.js      # ProfileScreen — профиль, тема, выход
│   ├── components/
│   │   └── bottom-nav.js   # BottomNav — нижняя панель навигации
│   ├── navigation/
│   │   └── focus.js        # FocusManager — D-pad навигация для ТВ
│   └── services/
│       ├── debug.js        # Debug — панель логов
│       ├── history.js      # WatchHistory — история просмотра
│       └── storage.js      # Storage — localStorage обёртка
├── styles/
│   ├── theme.css           # CSS-переменные, light/dark тема
│   └── main.css            # Все стили UI-компонентов
└── assets/
    ├── icons/              # Иконка приложения, логотипы
    └── fonts/              # Product Sans, Roboto, Proxima Nova, YTSans
```

### Паттерны

- **Чистый JavaScript** — без фреймворков, без сборки, без ES-модулей. Глобальные объекты-синглтоны.
- **Роутинг** — `App.showScreen(name, params)` / `App.goBack()`. Стек истории для кнопки "Назад".
- **Рендеринг** — императивный DOM. Каждый экран имеет `render()`, полностью пересоздающий `#app`.
- **D-pad фокус** — `data-focusable="true"` + spatial navigation через `FocusManager`.
- **API** — `ApiClient.post()`/`.get()` с автоматическим retry. Токен — query-параметр `?token=...`.
- **Темы** — CSS-переменные в `:root` / `[data-theme="dark"]`. Фокус-кольцо через `.focused`.

---

## Anixart API

Base URL: `https://api-s.anixsekai.com/`

Токен передаётся query-параметром: `?token=<profileToken>`.

### Эндпоинты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `auth/signIn` | Авторизация (form: login, password) |
| POST | `discover/interesting` | Интересное (баннеры) |
| POST | `discover/recommendations/{page}` | Рекомендации |
| POST | `discover/watching/{page}` | Сейчас смотрят |
| POST | `discover/discussing` | Обсуждаемое |
| POST | `release/{id}` | Детали релиза |
| POST | `release/{id}/source` | Источники видео |
| POST | `release/{id}/episode` | Список эпизодов (с sourceId) |
| POST | `release/{id}/episode/link` | Прямая ссылка на видеофайл |
| POST | `search/releases/{page}` | Поиск (body: {searchText}) |
| POST | `profile/{id}` | Профиль пользователя |
| POST | `profile/list/{status}/{page}` | Закладки по статусу (1-5) |
| POST | `profile/list/add` | Добавить в список (body: {release_id, status}) |
| POST | `profile/list/delete` | Удалить из списка (body: {release_id}) |

---

## Tizen TV

### Коды клавиш пульта

| Клавиша | keyCode | Назначение |
|---------|---------|------------|
| Back | 10009 | Назад |
| Play | 415 | Воспроизведение |
| Play/Pause | 10252 | Переключение |
| Stop | 413 | Остановка |
| FastForward | 417 | Перемотка вперёд |
| Rewind | 412 | Перемотка назад |
| Green | 403 | Debug-панель |

Разрешение: 1920x1080. Viewport: `<meta name="viewport" content="width=1920">`.

### Упаковка

```bash
npm run package   # создаёт anixart-tizen.wgt (zip-архив)
```

Для подписи и установки на ТВ нужен Tizen Studio с сертификатом Samsung.

---

## Разработка

```bash
npm run serve     # http-server на порту 8080
```

Открыть в браузере `http://localhost:8080`. Для эмуляции ТВ-пульта: стрелки клавиатуры + Enter + Backspace.

---

## Контакты и происхождение

- Оригинальное приложение: [Anixart](https://anixart.tv) (Android)
- Этот порт: неофициальная адаптация для Samsung Tizen Smart TV
- Репозиторий: `yukinine-dev/anixart-tizenOS`
