# Self-Assessment

## Features Table

Ниже собраны мои личные фичи для self-assessment.
| Category | Feature | Points | What I Did | Code / Notes | PR Link |
| --- | --- | ---: | --- | --- | --- |
| My Components | Code Runner | 25 | Реализовал компонент запуска и отображения результатов выполнения команд в игровом процессе. | `frontend/` | [PR #41](https://github.com/yermekyerden/typocalypse-tandem/pull/41)<br>[PR #55](https://github.com/yermekyerden/typocalypse-tandem/pull/55) |
| Game | Leaderboard | 5 | Сделал таблицу рекордов с сохранением результатов между сессиями. | `frontend/` | [PR #56](https://github.com/yermekyerden/typocalypse-tandem/pull/56) |
| UI & Interaction | i18n | 10 | Добавил локализацию интерфейса и переключение языков. | `frontend/src/` | [PR #94](https://github.com/yermekyerden/typocalypse-tandem/pull/94) |
| UI & Interaction | Accessibility (a11y) | 10 | Улучшил доступность интерфейса: навигацию, читаемость и UX для пользователей. | `frontend/src/` | `[PR #100](https://github.com/yermekyerden/typocalypse-tandem/pull/100)` |
| Quality | Unit Tests (Basic, 20%+) | 10 | Написал unit-тесты для своей части проекта с базовым покрытием. | `frontend/src/` | [PR #68](https://github.com/yermekyerden/typocalypse-tandem/pull/68) |
| Architecture | Zustand | 10 | Использовал Zustand для управления состоянием приложения. | `frontend/src/` | [PR #31](https://github.com/yermekyerden/typocalypse-tandem/pull/31) |
| Architecture | API Layer | 10 | Выделил слой работы с API отдельно от UI-компонентов. | `frontend/src/` | [PR #85](https://github.com/yermekyerden/typocalypse-tandem/pull/85) |
| Frameworks | React | 5 | Разрабатывал пользовательский интерфейс на React. | `frontend/src/` | [PR #53](https://github.com/yermekyerden/typocalypse-tandem/pull/53) |
|  | **Total** | **85** |  |  |  |

## Personal Feature Components

Мои 2 личных Feature Component:

1. `Code Runner`
2. `Leaderboard`

## Description Of My Work

В этом проекте я в основном занимался фронтендом. Больше всего работал над учебным интерфейсом `Terminal Dojo`, экраном с модулями, логикой прохождения и тем, как пользователь взаимодействует с терминалом и контентом. Также я подключал и настраивал `Zustand`, чтобы в приложении было нормальное и понятное управление состоянием, без лишней путаницы.

Из технологий я работал с `React`, `TypeScript`, `Zustand` и `xterm.js`. Одной из моих главных задач был `Code Runner` и сам учебный терминал. Я подключил терминал на `xterm.js`, настроил вывод команд, историю, `Ctrl+C`, автоизменение размера под контейнер и в целом постарался сделать так, чтобы он ощущался ближе к настоящему терминалу. Параллельно я занимался учебными модулями: добавлял новый контент, продумывал шаги прохождения, делал отображение прогресса через звезды и улучшал логику завершения модулей, чтобы пользователь не мог пройти их случайно или слишком рано.

Еще я работал над структурой фронтенда. Например, рефакторил `LibraryScreen`, выносил большие куски интерфейса в отдельные компоненты и старался разделять логику и отображение, чтобы экран не превращался в один большой перегруженный файл. Кроме этого, я добавлял unit-тесты для основной логики экрана и его секций, занимался `i18n`, accessibility и общей UI-полировкой.

Если коротко, я делал фронтенд не только визуально, но и с точки зрения структуры, состояния и пользовательского сценария. Самым сложным для меня было удерживать баланс между новой функциональностью и чистотой кода, чтобы проект не начал разваливаться по мере роста. С нуля я лично реализовывал и развивал учебный терминальный интерфейс, логику прогресса внутри модулей и часть архитектуры фронтенда.
