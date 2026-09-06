# Anixart Tizen TV

Неофициальный клиент [Anixart](https://anixart.tv) для Samsung Tizen TV. Веб-приложение на чистом JS без фреймворков, адаптированное под управление ТВ-пультом (D-pad навигация).

Референс: оригинальное Android-приложение Anixart 10.0 (APK).

---

## Текущий статус: ~75% готово

### Что реализовано

| Компонент | Файл | Описание |
|-----------|------|----------|
| **Авторизация** | `src/screens/login.js` | Экран входа: вкладки Пароль/QR-код. QR-логин через телефон (auth-helper.html), PIN-код |
| **Главный экран** | `src/screens/home.js` | Горизонтальные ряды карточек: "Интересное", "Рекомендации", "Смотрят сейчас", "Обсуждаемое". Skeleton-загрузка. Клик на поиск-бар открывает поиск |
| **Детали аниме** | `src/screens/details.js` | Постер с blur-фоном, название (RU/EN), бейджи (год, возраст, статус), описание, жанры, список эпизодов. Клик на эпизод или "Смотреть" открывает плеер |
| **Поиск** | `src/screens/search.js` | Поиск с debounce (400мс), результаты в виде карточек с постером/названием/мета/жанрами |
| **Видеоплеер** | `src/screens/player.js` | HTML5 video с overlay-управлением, TV remote key handling, авто-переход к следующему эпизоду |
| **Закладки** | `src/screens/bookmarks.js` | 5 вкладок: Смотрю, В планах, Просмотрено, Отложено, Брошено. Сетка карточек |
| **Профиль** | `src/screens/profile.js` | Аватар, статистика, переключение темы (тёмная/светлая), выход из аккаунта |
| **Нижняя навигация** | `src/components/bottom-nav.js` | 5 вкладок, все подключены: Главная, Обзор (→поиск), Закладки, Лента, Профиль |
| **D-pad навигация** | `src/navigation/focus.js` | Управление пультом ТВ: стрелки (перемещение фокуса), Enter (выбор), Back/Backspace (назад). Автоскролл к фокусу |
| **Отладка** | `src/services/debug.js` | Панель логов (уровни: info/api/warn/error/nav), вкл. клавишей 'i' или Green на пульте |
| **QR-генератор** | `src/lib/qrcode.js` | Генерация QR-кодов без внешних зависимостей (для логина) |
| **API-клиент** | `src/api/client.js` | XHR-обёртка с Promise, поддержка GET/POST, form-data, JSON, таймауты 15с |
| **API авторизации** | `src/api/auth.js` | `auth/signIn` — вход по логину/паролю |
| **API каталога** | `src/api/discover.js` | `discover/interesting`, `discover/recommendations`, `discover/watching`, `discover/discussing` |
| **API релизов** | `src/api/release.js` | `release/{id}` — детали, `release/{id}/episode` — эпизоды, `release/{id}/source` — источники |
| **API поиска** | `src/api/search.js` | `search/releases/{page}` — поиск по названию |
| **API профиля** | `src/api/profile.js` | `profile/{id}`, `profile/list/{status}/{page}`, добавление/удаление из списков |
| **Хранилище** | `src/services/storage.js` | localStorage-обёртка: токен, профиль, тема |
| **Темы** | `styles/theme.css` | Полные light/dark палитры с CSS-переменными. По умолчанию dark |
| **Стили** | `styles/main.css` | Вся вёрстка: логин, поиск, плеер, закладки, профиль, карточки, детали, навигация, скелетоны, фокус-кольца |

### Что НЕ реализовано (~25%)

| Приоритет | Фича | Описание |
|-----------|-------|----------|
| **P1** | История просмотра | Запоминание позиции воспроизведения, отметка просмотренных серий |
| **P1** | Лента | Экран ленты: новые серии, обновления избранных релизов |
| **P2** | Кэширование | Оффлайн-данные, кэш постеров и API-ответов |
| **P2** | Обработка ошибок | Потеря сети, таймауты, ретраи, user-friendly сообщения |
| **P2** | Упаковка .wgt | Финальный Tizen-пакет, подпись, установка на реальное устройство |
| **P3** | Уведомления | Новые серии, ответы на комментарии |
| **P3** | Комментарии | Просмотр/написание комментариев к релизам и эпизодам |

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
│   │   ├── client.js       # ApiClient — базовый HTTP-клиент (XHR + Promise)
│   │   ├── auth.js         # AuthApi — авторизация
│   │   ├── discover.js     # DiscoverApi — главная лента
│   │   ├── release.js      # ReleaseApi — детали релиза, эпизоды, источники
│   │   ├── search.js       # SearchApi — поиск по названию
│   │   └── profile.js      # ProfileApi — профиль, закладки (списки)
│   ├── screens/
│   │   ├── login.js        # LoginScreen — вход (пароль + QR-код)
│   │   ├── home.js         # HomeScreen — главная с рядами карточек
│   │   ├── details.js      # DetailsScreen — страница аниме
│   │   ├── search.js       # SearchScreen — поиск аниме
│   │   ├── player.js       # PlayerScreen — видеоплеер
│   │   ├── bookmarks.js    # BookmarksScreen — закладки (5 категорий)
│   │   └── profile.js      # ProfileScreen — профиль, тема, выход
│   ├── components/
│   │   └── bottom-nav.js   # BottomNav — нижняя панель навигации
│   ├── navigation/
│   │   └── focus.js        # FocusManager — D-pad навигация для ТВ
│   └── services/
│       ├── debug.js        # Debug — панель логов (info/api/warn/error/nav)
│       └── storage.js      # Storage — localStorage обёртка
├── styles/
│   ├── theme.css           # CSS-переменные, шрифты, light/dark тема
│   └── main.css            # Все стили UI-компонентов
└── assets/
    ├── icons/              # Иконка приложения, логотипы
    └── fonts/              # Product Sans, Roboto, Proxima Nova, YTSans
```

### Паттерны и конвенции

- **Чистый JavaScript** — без фреймворков, без сборки, без ES-модулей. Все файлы подключаются через `<script>` в `index.html`. Глобальные объекты-синглтоны (`App`, `HomeScreen`, `Storage`, ...).
- **Роутинг** — `App.showScreen(name, params)` / `App.goBack()`. Стек истории для кнопки "Назад".
- **Рендеринг** — императивный DOM (`document.createElement`). Каждый экран имеет метод `render()`, который полностью пересоздаёт содержимое `#app`.
- **D-pad фокус** — элементы с атрибутом `data-focusable="true"` участвуют в навигации. `FocusManager` обрабатывает стрелки и находит ближайший элемент в направлении нажатия (spatial navigation).
- **API** — все запросы через `ApiClient.post()`/`.get()`. Токен передаётся query-параметром `?token=...`.
- **Стили** — CSS-переменные в `:root` (light) и `[data-theme="dark"]`. Фокус-кольцо через класс `.focused`.

---

## Anixart API

Base URL: `https://api-s.anixsekai.com/`

Токен передаётся query-параметром: `?token=<profileToken>`.

### Известные эндпоинты

| Метод | Endpoint | Body / Params | Описание |
|-------|----------|---------------|----------|
| POST | `auth/signIn` | form: `login`, `password` | Авторизация. Ответ: `{profileToken: {token, id}, profile: {...}, status: 0}` |
| POST | `discover/interesting` | — | Интересное (баннеры). Ответ: `{content: [{release: {...}}, ...]}` |
| POST | `discover/recommendations/{page}` | `?token=...&previous_page=0` | Рекомендации |
| POST | `discover/watching/{page}` | `?token=...` | Сейчас смотрят |
| POST | `discover/discussing` | `?token=...` | Обсуждаемое |
| POST | `discover/comments` | — | Последние комментарии |
| POST | `release/{id}` | `?token=...` | Детали релиза. Ответ: `{release: {id, title_ru, title_en, image, poster, description, genres, year, status, ...}}` |
| POST | `release/{id}/source` | `?token=...` | Источники видео. Ответ: `{content: [{id, name, ...}]}` |
| POST | `release/{id}/episode` | `?token=...&sourceId=...` | Список эпизодов. Ответ: `{content: [{position, name, ...}]}` |

### Реализованные дополнительные эндпоинты

| Метод | Endpoint | Файл | Описание |
|-------|----------|------|----------|
| POST | `search/releases/{page}` | `search.js` | Поиск. Body: `{searchText: "query"}` |
| POST | `profile/{id}` | `profile.js` | Профиль пользователя |
| POST | `profile/list/{status}/{page}` | `profile.js` | Закладки по статусу (1-5) |
| POST | `profile/list/add` | `profile.js` | Добавить в список. Body: `{release_id, status}` |
| POST | `profile/list/delete` | `profile.js` | Удалить из списка. Body: `{release_id}` |

### Эндпоинты для реализации

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `release/{id}/episode/link` | Получение прямой ссылки на видеофайл |

### Структура данных Release

```json
{
  "id": 12345,
  "title_ru": "Название на русском",
  "title_en": "English Title",
  "title_original": "原題",
  "image": "https://...",
  "poster": "https://...",
  "description": "Описание...",
  "genres": [{"id": 1, "name": "Экшен"}, ...],
  "year": 2024,
  "season": 1,
  "status": 1,
  "age_rating": 16,
  "episodes_total": 12,
  "grade": 8.5,
  "episodesCount": 12
}
```

Статус: `1` = Онгоинг, `2` = Вышел, `3` = Анонс

---

## Tizen TV: ключевые моменты

### config.xml привилегии

```xml
<tizen:privilege name="http://tizen.org/privilege/internet"/>
<tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
<tizen:privilege name="http://tizen.org/privilege/application.launch"/>
```

### Зарегистрированные ТВ-клавиши

```javascript
tizen.tvinputdevice.registerKeyBatch([
  'MediaPlay', 'MediaPause', 'MediaPlayPause',
  'MediaStop', 'MediaFastForward', 'MediaRewind'
]);
```

### Коды клавиш пульта

| Клавиша | keyCode | Назначение |
|---------|---------|------------|
| Back | 10009 | Назад |
| Play | 415 | Воспроизведение |
| Pause | 19 | Пауза |
| Play/Pause | 10252 | Переключение |
| Stop | 413 | Остановка |
| FastForward | 417 | Перемотка вперёд |
| Rewind | 412 | Перемотка назад |
| ChannelUp | 427 | — |
| ChannelDown | 428 | — |
| VolumeUp | 447 | Громкость + |
| VolumeDown | 448 | Громкость - |
| Mute | 449 | Без звука |

### Разрешение

Целевое: 1920x1080. Viewport зафиксирован: `<meta name="viewport" content="width=1920">`.

### Упаковка

```bash
npm run package   # создаёт anixart-tizen.wgt (zip-архив)
```

Для подписи и установки на ТВ нужен Tizen Studio с сертификатом Samsung.

---

## Как запустить для разработки

```bash
npm run serve     # http-server на порту 8080
```

Открыть в браузере `http://localhost:8080`. Для эмуляции ТВ-пульта использовать стрелки клавиатуры + Enter + Backspace.

---

## Рекомендации по реализации оставшегося

### Лента (P1)

Создать `src/screens/feed.js`. Показывать новые серии избранных релизов. API: может использовать `discover/watching` или аналогичный эндпоинт для ленты обновлений.

### История просмотра (P1)

Сохранять позицию воспроизведения в localStorage: `{releaseId: {episodeIndex, currentTime}}`. При открытии плеера — восстанавливать позицию. На карточке закладки показывать прогресс.

### Видеоплеер — улучшения

Текущий плеер использует HTML5 `<video>`. Возможные доработки:
- **Tizen AVPlay API** — нативный плеер Samsung для HLS/DRM
- Выбор качества видео (если доступны несколько ссылок)
- Субтитры

### Новый экран — чеклист

При добавлении нового экрана:
1. Создать файл `src/screens/<name>.js` с объектом `<Name>Screen` и методом `render()`
2. Подключить в `index.html` через `<script>`
3. Добавить `case` в `App.showScreen()` и `App.goBack()`
4. Обработать клик в `BottomNav.onTabClick()` (если это вкладка)

---

## Контакты и происхождение

- Оригинальное приложение: [Anixart](https://anixart.tv) (Android)
- Этот порт: неофициальная адаптация для Samsung Tizen Smart TV
- Репозиторий: `yukinine-dev/anixart-tizenOS`
