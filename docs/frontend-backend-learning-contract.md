# Frontend to Backend Contract

Этот документ фиксирует, какие endpoint-ы и правила взаимодействия ожидает frontend после удаления локальных моков.

## Base Rules

- Base URL: `/api`
- Format: `application/json`
- Auth for protected routes: `Authorization: Bearer <accessToken>`
- Ошибки должны возвращать HTTP status `4xx/5xx` и поле `message`
- Frontend умеет читать как plain JSON response, так и envelope вида:

```json
{
  "ok": true,
  "data": {}
}
```

## Required Endpoints

### `GET /api/learning/overview`

Нужен для sidebar, library screen и progress overview.

```json
{
  "modules": [
    {
      "id": "cmd-basics",
      "slug": "cmd-basics",
      "title": "Command Line Basics",
      "description": "Navigate directories and inspect files.",
      "order": 1,
      "lessons": [
        {
          "id": "ls-home",
          "slug": "ls-home",
          "title": "List home directory",
          "order": 1,
          "status": "active"
        }
      ]
    }
  ]
}
```

Правила:

- `status` только один из: `locked | active | completed`
- В одном curriculum должен быть максимум один `active` lesson
- Модули и lessons должны приходить уже отсортированными по `order`

### `GET /api/lessons/:id`

Нужен для блока theory/task/hints в library screen.

```json
{
  "lesson": {
    "id": "ls-home",
    "moduleId": "cmd-basics",
    "slug": "ls-home",
    "title": "List home directory",
    "order": 1,
    "theoryMarkdown": "The `ls` command prints files and folders.",
    "taskDescription": "Print the list of files in your home directory.",
    "hints": ["Try `ls` first."]
  }
}
```

Правила:

- `id` должен совпадать с lesson из overview
- `moduleId` должен совпадать с module из overview
- `theoryMarkdown` и `taskDescription` обязательны, даже если пустые строки
- `hints` можно не возвращать, тогда frontend подставит пустой массив

### `POST /api/attempts`

Нужен для старта terminal attempt из выбранного lesson.

Ожидаемый request:

```json
{
  "lessonId": "ls-home"
}
```

Ожидаемый response:

```json
{
  "ok": true,
  "data": {
    "attemptId": "uuid",
    "initialCwd": "/home/student",
    "initialFs": {}
  }
}
```

Правила:

- Frontend сейчас ожидает именно `lessonId`
- Если backend хочет жить на `missionId`, нужен либо backward-compatible support, либо отдельный mapping endpoint
- `attemptId` должен быть стабильным UUID/string identifier
- `initialCwd` обязателен

### `PATCH /api/attempts/:id/command`

Нужен для выполнения команды в terminal.

Ожидаемый request:

```json
{
  "command": "ls",
  "clientCommandId": "uuid"
}
```

Ожидаемый response:

```json
{
  "ok": true,
  "data": {
    "stdout": "mission.txt",
    "stderr": "",
    "exitCode": 0,
    "cwdAfter": "/home/student",
    "attemptStatus": "in_progress",
    "validation": {
      "type": "validation_failed",
      "failedAtUtc": "2026-03-23T10:00:00.000Z",
      "failedCheckId": "check-1",
      "reports": [
        {
          "checkId": "check-1",
          "checkType": "cwd",
          "ok": false,
          "message": "Command executed, but mission is not complete."
        }
      ]
    },
    "trace": {},
    "progressChanged": false
  }
}
```

Правила:

- `clientCommandId` должен поддерживать idempotency
- `stdout` и `stderr` всегда должны быть строками
- `attemptStatus` только `in_progress | completed | abandoned`
- `validation.type` только `validation_ok | validation_failed`
- При `validation_ok` frontend локально помечает lesson как `completed` и unlock-ит следующий

### `PATCH /api/attempts/:id/abandon`

Нужен для reset current terminal session.

```json
{
  "ok": true,
  "data": {
    "attemptId": "uuid",
    "status": "abandoned"
  }
}
```

## Optional Endpoint

### `GET /api/progress`

Пока фронт может жить без него, потому что lesson statuses приходят из `learning/overview`.
Но endpoint полезен для отдельного dashboard/reporting слоя.

## Frontend Behavior

- Если `learning/overview` не загрузился, sidebar и library показывают error state
- Если `lessons/:id` не загрузился, frontend не падает и показывает `No lesson details available yet`
- Если `attempts` endpoint недоступен, ошибка попадает в terminal output как `stderr`
- После refresh страницы frontend заново запрашивает overview и details, локальные моки больше не используются
