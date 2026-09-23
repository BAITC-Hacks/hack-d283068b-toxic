# PROJECT PLAN — HackAlem AI

## 0. Главная цель

За 5 часов создать работающий MVP платформы бизнес-задач.

Главный сценарий:

```text
Business
  ↓
вводит слабое описание задачи
  ↓
AI анализирует описание
  ↓
AI задаёт минимум 3 уточняющих вопроса
  ↓
Business отвечает
  ↓
формируется редактируемая Task Card
  ↓
Business редактирует и подтверждает данные
  ↓
Backend рассчитывает Rating 0–100
  ↓
Business публикует задачу
  ↓
задача появляется в Catalog
  ↓
Student Team открывает задачу
  ↓
отправляет Proposal
  ↓
Business просматривает предложения
  ↓
Accept / Reject вручную
```

Если этот сценарий полностью работает — MVP считается главным образом выполненным.

---

# 1. Приоритеты

Работаем строго в таком порядке:

## P0 — обязательно

1. Создание черновика задачи.
2. AI-анализ черновика.
3. Минимум 3 уточняющих вопроса.
4. Ответы бизнеса на вопросы.
5. Генерация Task Card.
6. Возможность редактировать Task Card.
7. Ручное подтверждение изменений.
8. Rating 0–100.
9. Breakdown рейтинга.
10. Missing fields.
11. Пересчёт рейтинга после редактирования.
12. Публикация задачи.
13. Catalog.
14. Сортировка по рейтингу.
15. Фильтр по теме.
16. Фильтр по readiness.
17. Просмотр конкретной задачи.
18. Отправка Proposal студентом.
19. Просмотр Proposal бизнесом.
20. Ручной Accept / Reject.
21. Seed/demo data.
22. README.
23. Обработка основных ошибок.

## P1 — только после полного P0

* визуальное улучшение интерфейса;
* рекомендации задач студентам;
* дополнительные AI-функции;
* deployed версия;
* дополнительная аналитика;
* красивые графики;
* анимации.

## НЕ ДЕЛАЕМ до завершения MVP

* регистрацию;
* JWT;
* OAuth;
* восстановление пароля;
* сложную систему ролей;
* WebSocket;
* чат;
* уведомления;
* календарь;
* файловое хранилище;
* vector database;
* обучение собственной ML-модели;
* полноценный project tracker;
* Kubernetes/Redis/nginx и подобную infrastructure.

---

# 2. Технологический стек

## Frontend

Ответственный: Нуртас

```text
React
Vite
JavaScript
CSS
fetch()
```

Не используем сложные state-management библиотеки без необходимости.

## Backend

Ответственный: Фархат

```text
Python
FastAPI
Pydantic
SQLite
OpenAI API
```

Backend является единственной частью системы, которая работает с OpenAI API Key.

Frontend никогда не получает OpenAI API Key.

## Database

```text
SQLite
```

Один локальный файл базы.

Причины:

* быстро;
* не нужен отдельный сервер;
* сохраняет данные;
* легко запускается у жюри.

---

# 3. Структура репозитория

```text
project/
│
├── PROJECT_PLAN.md
├── README.md
├── .gitignore
├── .env.example
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   │
│   │   ├── routers/
│   │   │   ├── tasks.py
│   │   │   └── proposals.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── task.py
│   │   │   └── proposal.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   └── rating_service.py
│   │   │
│   │   └── seed.py
│   │
│   └── tests/
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   │
    │   ├── pages/
    │   │   ├── CreateTaskPage.jsx
    │   │   ├── TaskEditorPage.jsx
    │   │   ├── CatalogPage.jsx
    │   │   ├── TaskDetailsPage.jsx
    │   │   └── ProposalsPage.jsx
    │   │
    │   ├── components/
    │   │   ├── TaskCard.jsx
    │   │   ├── Rating.jsx
    │   │   ├── QuestionForm.jsx
    │   │   └── ProposalForm.jsx
    │   │
    │   └── services/
    │       └── api.js
    │
    └── src/styles/
```

Структуру можно немного менять, но разделение:

```text
frontend/
backend/
```

не меняем.

---

# 4. Владение кодом

## Фархат — backend owner

Фархат отвечает за:

```text
backend/**
.env.example
backend requirements
database
OpenAI integration
rating algorithm
API
validation
seed backend data
```

## Нуртас — frontend owner

Нуртас отвечает за:

```text
frontend/**
pages
components
forms
API requests
displaying responses
frontend validation
loading/error states
```

## Общие файлы

```text
PROJECT_PLAN.md
README.md
.gitignore
```

Меняем только после согласования.

---

# 5. Главное правило команды

Frontend и Backend разрабатываются **по API CONTRACT из этого документа**.

Не по памяти.

Не по сообщениям Telegram.

Не по предположениям.

Если API меняется:

```text
1. Сначала договорились.
2. Изменили PROJECT_PLAN.md.
3. Потом изменили backend.
4. Потом frontend.
```

Нельзя молча поменять:

```text
field name
endpoint
request
response
data type
```

---

# 6. Главный объект — Task

```json
{
  "id": 1,
  "title": "AI-анализ документов",
  "topic": "AI",
  "context": "Компания вручную проверяет документы.",
  "need": "Нужно ускорить проверку документов.",
  "users": "Сотрудники отдела проверки",
  "data_materials": "Примеры документов PDF",
  "constraints": "Решение должно работать с русским языком",
  "expected_result": "Работающий прототип анализа документов",
  "success_criteria": "Время проверки уменьшено минимум на 30%",
  "contact": "business@example.com",
  "interaction_format": "1 консультация в неделю",

  "score": 100,
  "readiness": "priority",

  "missing_fields": [],

  "status": "published"
}
```

---

# 7. Readiness levels

Backend определяет readiness автоматически.

```text
0–39
draft

40–69
working

70–89
ready

90–100
priority
```

Frontend только отображает значение.

Frontend самостоятельно readiness не рассчитывает.

---

# 8. Rating algorithm

Рейтинг считается **только Backend**.

AI рейтинг не определяет.

Используем прозрачную фиксированную формулу.

## Контекст + потребность — 20

```text
context заполнен = 10
need заполнен = 10
```

## Данные и материалы — 20

```text
data_materials заполнен = 20
```

## Ожидаемый результат — 15

```text
expected_result заполнен = 15
```

## Критерии успеха — 15

```text
success_criteria заполнен = 15
```

## Ограничения — 10

```text
constraints заполнен = 10
```

## Пользователи — 10

```text
users заполнен = 10
```

## Связь с бизнесом — 10

```text
contact заполнен = 5

interaction_format заполнен = 5
```

Итого:

```text
100
```

`title` и `topic` обязательны для нормальной карточки, но отдельно баллов не дают.

---

# 9. Rating response

Frontend должен получать не только число.

Пример:

```json
{
  "score": 65,
  "readiness": "working",

  "breakdown": {
    "context_need": 20,
    "data_materials": 0,
    "expected_result": 15,
    "success_criteria": 0,
    "constraints": 10,
    "users": 10,
    "business_connection": 10
  },

  "missing_fields": [
    "data_materials",
    "success_criteria"
  ]
}
```

Это позволит frontend показать:

```text
Rating: 65 / 100

✓ Context and need: +20
✗ Data: +0
✓ Expected result: +15
✗ Success criteria: +0

Missing:
- Data and materials
- Success criteria
```

---

# 10. AI rules

AI используется только через Backend.

Основные задачи AI:

```text
1. Analyse draft
2. Найти недостающую информацию
3. Сгенерировать минимум 3 уместных вопроса
4. После ответов структурировать информацию в Task Card
```

## AI запрещено

Придумывать данные, которых бизнес не предоставил.

Если информации нет:

```json
{
  "data_materials": ""
}
```

а не выдуманная информация.

## AI output

Backend должен пытаться получать структурированный JSON.

Если AI возвращает неправильный ответ:

```text
backend ловит ошибку
→ не падает
→ возвращает понятную ошибку frontend
```

---

# 11. API CONTRACT

Base URL:

```text
http://localhost:8000/api
```

Frontend хранит backend URL централизованно в:

```text
frontend/src/services/api.js
```

Не размазывать URL по компонентам.

---

# 12. Health

## GET /api/health

Response:

```json
{
  "status": "ok"
}
```

Это первый endpoint, которым проверяем соединение Frontend ↔ Backend.

---

# 13. Analyze draft

## POST /api/tasks/analyze

Request:

```json
{
  "description": "Хотим улучшить работу с клиентами",
  "topic": "Customer Service"
}
```

Response:

```json
{
  "missing_fields": [
    "users",
    "data_materials",
    "expected_result",
    "success_criteria"
  ],

  "questions": [
    {
      "id": "q1",
      "field": "users",
      "question": "Кто будет основным пользователем решения?"
    },
    {
      "id": "q2",
      "field": "data_materials",
      "question": "Какие данные или материалы доступны команде?"
    },
    {
      "id": "q3",
      "field": "expected_result",
      "question": "Какой конкретный результат вы ожидаете получить?"
    }
  ]
}
```

Условие:

```text
questions.length >= 3
```

---

# 14. Create Task Card

## POST /api/tasks

Request:

```json
{
  "draft": "Хотим улучшить работу с клиентами",

  "topic": "Customer Service",

  "answers": [
    {
      "field": "users",
      "answer": "Операторы контакт-центра"
    },
    {
      "field": "data_materials",
      "answer": "История обращений клиентов"
    },
    {
      "field": "expected_result",
      "answer": "Прототип AI-помощника"
    }
  ]
}
```

Backend:

```text
draft
+
answers
↓
OpenAI
↓
Task Card
↓
rating calculation
↓
save SQLite
```

Response:

полный объект `Task`.

Статус:

```text
draft
```

---

# 15. Edit Task

## PUT /api/tasks/{task_id}

Request:

```json
{
  "title": "...",
  "topic": "...",
  "context": "...",
  "need": "...",
  "users": "...",
  "data_materials": "...",
  "constraints": "...",
  "expected_result": "...",
  "success_criteria": "...",
  "contact": "...",
  "interaction_format": "..."
}
```

Backend:

```text
валидирует
↓
сохраняет
↓
пересчитывает score
↓
пересчитывает readiness
↓
пересчитывает missing_fields
```

Response:

обновлённый Task.

Это действие во frontend называется примерно:

```text
Save & Recalculate
```

---

# 16. Publish Task

## POST /api/tasks/{task_id}/publish

Это отдельное ручное действие бизнеса.

Backend:

```text
status = published
```

Response:

полный Task.

ВАЖНО:

Низкий рейтинг **не запрещает публикацию**.

---

# 17. Catalog

## GET /api/tasks

Поддерживаем параметры:

```text
topic
readiness
sort
```

Пример:

```text
GET /api/tasks?readiness=ready&sort=rating_desc
```

По умолчанию опубликованные задачи:

```text
rating DESC
```

Response:

```json
[
  {
    "id": 4,
    "title": "...",
    "topic": "...",
    "score": 95,
    "readiness": "priority",
    "status": "published"
  }
]
```

В каталог не выводим внутренние draft задачи.

---

# 18. Task details

## GET /api/tasks/{task_id}

Response:

полный объект Task.

Эта страница используется Student Team перед отправкой Proposal.

---

# 19. Proposal object

```json
{
  "id": 1,
  "task_id": 4,

  "team_name": "HackTeam",
  "idea": "Мы предлагаем...",
  "plan": "1. Анализ\n2. Prototype\n3. Testing",

  "deadline": "2 weeks",

  "prototype_url": "https://github.com/...",

  "status": "pending"
}
```

Statuses:

```text
pending
accepted
rejected
```

---

# 20. Submit Proposal

## POST /api/tasks/{task_id}/proposals

Request:

```json
{
  "team_name": "HackTeam",
  "idea": "Создать AI помощника...",
  "plan": "Сначала анализ, затем прототип...",
  "deadline": "2 weeks",
  "prototype_url": "https://github.com/example/project"
}
```

Response:

созданный Proposal.

Одна задача может иметь много Proposal.

---

# 21. Business proposals

## GET /api/tasks/{task_id}/proposals

Response:

```json
[
  {
    "id": 1,
    "team_name": "HackTeam",
    "idea": "...",
    "plan": "...",
    "deadline": "2 weeks",
    "prototype_url": "...",
    "status": "pending"
  }
]
```

---

# 22. Accept / Reject

## PATCH /api/proposals/{proposal_id}/status

Request:

```json
{
  "status": "accepted"
}
```

или:

```json
{
  "status": "rejected"
}
```

Response:

обновлённый Proposal.

ВАЖНО:

Backend НЕ выбирает команду автоматически.

AI НЕ выбирает команду.

Можно принять:

```text
0
1
несколько
```

команд.

Принятие одного Proposal автоматически не отклоняет остальные.

---

# 23. Frontend pages

## PAGE 1 — Create Task

URL примерно:

```text
/business/new
```

Содержит:

```text
Topic
Description

[Analyze]
```

После Analyze:

```text
AI Questions

Question 1
[input]

Question 2
[input]

Question 3
[input]

[Generate Task Card]
```

---

# 24. PAGE 2 — Task Editor

```text
/business/tasks/:id
```

Все поля Task Card редактируемые.

Справа или сверху:

```text
Rating 65 / 100
WORKING

Missing:
- Data
- Success Criteria
```

Кнопки:

```text
[Save & Recalculate]

[Publish]
```

Это один из самых важных экранов демо.

---

# 25. PAGE 3 — Catalog

```text
/catalog
```

Содержит:

```text
Topic filter
Readiness filter
Sort
```

Карточка:

```text
Task name
Topic
Short description
Rating
Readiness

[Open]
```

---

# 26. PAGE 4 — Task Details / Student

```text
/tasks/:id
```

Показывает Task Card.

Ниже:

```text
Submit proposal

Team name
Idea
Plan
Deadline
Prototype URL

[Submit Proposal]
```

---

# 27. PAGE 5 — Business Proposals

```text
/business/tasks/:id/proposals
```

Показывает:

```text
Team A

Idea
Plan
Deadline
Prototype

[Accept]
[Reject]
```

---

# 28. Role switching

Полноценная authentication не нужна.

Для демонстрации допускаем простой UI:

```text
Business
Student
```

или отдельные страницы.

Это только способ показать разные пользовательские сценарии.

Не тратить время на настоящую систему аккаунтов.

---

# 29. Seed data

Если организаторы не дают dataset, Backend создаёт:

```text
5 drafts
5 task cards
5 team profiles
5 proposals
```

Данные синтетические.

Seed запускается один раз при создании базы.

---

# 30. Environment variables

## .env.example

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Настоящий `.env`:

```text
НЕ COMMIT
НЕ PUSH
НЕ GITHUB
```

`.gitignore`:

```text
.env
.venv/
__pycache__/
node_modules/
*.db
```

Можно решить оставить demo database в Git отдельно, но рабочую локальную БД по умолчанию не пушим.

---

# 31. Backend Definition of Done

Backend функция считается готовой ТОЛЬКО если:

```text
1. Endpoint запускается.
2. Request соответствует PROJECT_PLAN.
3. Response соответствует PROJECT_PLAN.
4. Неверные данные не роняют сервер.
5. Функцию можно проверить через Swagger/curl.
6. Данные сохраняются при необходимости.
```

Не считать backend готовым потому что:

```text
"Codex написал код"
```

Готово = код реально запущен и проверен.

---

# 32. Frontend Definition of Done

Frontend функция считается готовой ТОЛЬКО если:

```text
1. Элемент отображается.
2. Пользователь может взаимодействовать.
3. Request соответствует API CONTRACT.
4. Response корректно отображается.
5. Есть loading state.
6. Есть error state.
7. Нет мёртвых кнопок.
```

---

# 33. MOCK RULE

Нуртас НЕ ждёт backend.

Пока endpoint не готов, frontend может использовать mock object.

НО:

Mock обязан на 100% соответствовать API CONTRACT.

Например:

```js
const mockTask = {
  id: 1,
  title: "Demo",
  score: 65,
  readiness: "working"
};
```

Когда Backend готов:

```text
mock
↓
fetch API
```

UI менять не должно потребоваться.

---

# 34. Git branches

Основные ветки:

```text
main
backend
frontend
```

## main

Только рабочая интегрированная версия.

## backend

Работает Фархат.

## frontend

Работает Нуртас.

---

# 35. Shared bootstrap

До активной разработки в `main` должны находиться:

```text
PROJECT_PLAN.md
.gitignore
.env.example
README.md или README stub
frontend/
backend/
```

После этого оба должны подтянуть main в свои ветки.

---

# 36. Git правила

## Фархат

Работает:

```text
backend branch
```

Пушит небольшими рабочими commit.

Примеры:

```text
feat: add task analysis endpoint
feat: add rating service
feat: add task publishing
fix: handle invalid AI response
```

## Нуртас

Работает:

```text
frontend branch
```

Примеры:

```text
feat: add task creation page
feat: add task editor
feat: add catalog
fix: show API errors
```

---

# 37. Что нельзя делать с Git

Нельзя:

```text
оба работают прямо в main
```

Нельзя:

```text
backend меняет frontend без согласования
```

Нельзя:

```text
frontend меняет backend без согласования
```

Нельзя:

```text
force push main
```

Нельзя:

```text
делать один commit через 5 часов
```

---

# 38. Синхронизация

Каждые примерно 45–60 минут:

```text
STOP
↓
оба push
↓
проверяем изменения
↓
merge рабочие части в main
↓
оба pull main
↓
проверяем интеграцию
↓
продолжаем
```

Не оставлять первую интеграцию на последние 30 минут.

---

# 39. Первая интеграция

Первая цель:

```text
Frontend button
      ↓
GET /api/health
      ↓
Backend
      ↓
{"status":"ok"}
      ↓
Frontend показывает Backend connected
```

После этого:

```text
POST /api/tasks/analyze
```

Это первый настоящий integration milestone.

---

# 40. Основные этапы разработки

## STAGE 1 — Skeleton

Фархат:

```text
FastAPI
CORS
/api/health
database
```

Нуртас:

```text
Vite React
routes/pages
api.js
base layout
```

Результат:

```text
Frontend ↔ Backend connected
```

---

# 41. STAGE 2 — AI Task Builder

Фархат:

```text
POST /tasks/analyze
OpenAI integration
3+ questions
POST /tasks
```

Нуртас:

```text
Create Task page
Question form
Task Editor base
```

Результат:

```text
draft
→ questions
→ answers
→ Task Card
```

---

# 42. STAGE 3 — Rating

Фархат:

```text
rating_service
PUT /tasks/{id}
score
breakdown
missing_fields
readiness
```

Нуртас:

```text
editable card
Rating component
missing information
Save & Recalculate
```

Результат:

```text
изменил поле
↓
Save
↓
65 → 85
```

Это критично для демонстрации.

---

# 43. STAGE 4 — Publishing + Catalog

Фархат:

```text
publish
GET /tasks
filters
sorting
GET /tasks/{id}
```

Нуртас:

```text
Publish
Catalog
filters
Task Details
```

Результат:

```text
published task
↓
appears in catalog
```

---

# 44. STAGE 5 — Proposals

Фархат:

```text
POST proposals
GET proposals
PATCH proposal status
```

Нуртас:

```text
ProposalForm
Business Proposals page
Accept
Reject
```

Результат:

```text
Student submits
↓
Business sees it
↓
Accept / Reject
```

---

# 45. STAGE 6 — Final integration

Проверяем только настоящий end-to-end:

```text
Create
↓
AI Questions
↓
Task Card
↓
Edit
↓
Rating
↓
Publish
↓
Catalog
↓
Proposal
↓
Business decision
```

Никаких optional features, пока этот flow не работает.

---

# 46. Error handling

Минимально обработать:

## Empty description

```text
400
Description is required
```

## OpenAI error

```text
503
AI service is temporarily unavailable
```

## Invalid AI output

```text
502
Invalid AI response
```

## Task not found

```text
404
Task not found
```

## Proposal not found

```text
404
Proposal not found
```

## Invalid proposal status

```text
400
Invalid proposal status
```

Frontend показывает понятное сообщение пользователю.

Не показывать stack trace.

---

# 47. CORS

Backend разрешает frontend dev server.

Например:

```text
http://localhost:5173
```

Это настраивает Фархат.

---

# 48. Правило безопасности

OpenAI API Key находится только:

```text
backend/.env
```

или root `.env`, если Backend настроен его читать.

Никогда:

```text
frontend JS
GitHub
README
commit
screenshot
```

---

# 49. Codex prompt — Фархат

При начале backend работы:

```text
Прочитай PROJECT_PLAN.md полностью.

Ты работаешь только как backend developer.

Твоя зона ответственности — backend/.

Не меняй frontend/.

Строго соблюдай API CONTRACT из PROJECT_PLAN.md.

Не меняй названия endpoints, JSON fields или типы данных без моего явного разрешения.

Используем Python + FastAPI + SQLite + OpenAI API.

Реализуй только текущую задачу, которую я дам после этого сообщения.

Не добавляй лишнюю архитектуру и зависимости.

После изменений:
1. перечисли изменённые файлы;
2. объясни кратко, что реализовано;
3. дай команду запуска;
4. дай способ проверить endpoint;
5. не делай commit/push без отдельной команды.
```

---

# 50. Codex prompt — Нуртас

```text
Прочитай PROJECT_PLAN.md полностью.

Ты работаешь только как frontend developer.

Твоя зона ответственности — frontend/.

Не меняй backend/.

Строго соблюдай API CONTRACT из PROJECT_PLAN.md.

Не меняй названия endpoints, JSON fields или типы данных без согласования.

Используем React + Vite + JavaScript.

Все backend requests размещай централизованно через frontend/src/services/api.js.

Пока backend endpoint недоступен, допускается mock data, но структура mock должна точно соответствовать PROJECT_PLAN.md.

После изменений:
1. перечисли изменённые файлы;
2. объясни кратко, что реализовано;
3. дай команду запуска;
4. объясни, как проверить UI;
5. не делай commit/push без отдельной команды.
```

---

# 51. План на 5 часов

## 0:00–0:20

Вместе:

```text
прочитать кейс
подтвердить PROJECT_PLAN
подтвердить stack
создать skeleton
```

---

## 0:20–1:00

Фархат:

```text
FastAPI
database
health
AI service skeleton
```

Нуртас:

```text
React
routing
Create Task
Task Editor skeleton
```

Цель:

```text
Frontend ↔ Backend
```

---

## 1:00–1:40

Фархат:

```text
AI analyze
questions
Task creation
```

Нуртас:

```text
questions
answers
generate card flow
```

Цель:

```text
draft → card
```

---

## 1:40–2:30

Фархат:

```text
rating
editing
missing fields
readiness
```

Нуртас:

```text
editor
rating UI
save/recalculate
```

Цель:

```text
score changes after editing
```

---

## 2:30–3:20

Фархат:

```text
publish
catalog API
filters
sorting
```

Нуртас:

```text
catalog
filters
task details
```

---

## 3:20–4:00

Фархат:

```text
proposals API
accept/reject
```

Нуртас:

```text
proposal form
business proposals
accept/reject
```

---

## 4:00–4:30

Оба:

```text
full integration
errors
bugs
seed data
```

---

## 4:30–5:00

Только:

```text
README
final GitHub push
demo example
final run
```

Не добавлять новую функциональность.

---

# 52. Demo scenario

Заранее подготовить одно слабое описание.

Например:

```text
Хотим использовать AI для улучшения обработки обращений клиентов.
```

На защите:

```text
1. Вводим этот draft.

2. Нажимаем Analyze.

3. Показываем минимум 3 AI question.

4. Отвечаем.

5. Получаем Task Card.

6. Показываем текущий рейтинг.

7. Добавляем отсутствующую информацию.

8. Save & Recalculate.

9. Показываем рост рейтинга.

10. Publish.

11. Переходим в Catalog.

12. Находим опубликованную задачу.

13. Открываем как Student.

14. Submit Proposal.

15. Возвращаемся в Business.

16. Открываем Proposals.

17. Accept или Reject.
```

Весь сценарий должен выполняться без ручного изменения базы или кода.

---

# 53. Финальный чек-лист

Перед сдачей:

```text
[ ] Backend запускается по README
[ ] Frontend запускается по README

[ ] /api/health работает

[ ] Draft можно отправить
[ ] AI задаёт >= 3 questions
[ ] AI не придумывает неизвестные данные

[ ] Task Card создаётся
[ ] Task Card редактируется

[ ] Score 0–100
[ ] Breakdown отображается
[ ] Missing fields отображаются
[ ] Score пересчитывается

[ ] Task публикуется
[ ] Task появляется в Catalog

[ ] Catalog сортируется по rating
[ ] Topic filter работает
[ ] Readiness filter работает

[ ] Proposal отправляется
[ ] Business видит Proposal

[ ] Accept работает
[ ] Reject работает

[ ] Seed data существует

[ ] OpenAI API key НЕ находится в Git

[ ] .env.example существует
[ ] .gitignore существует

[ ] README существует
[ ] README соответствует реальному проекту

[ ] Нет сломанных кнопок

[ ] Основной demo flow пройден полностью

[ ] backend branch pushed
[ ] frontend branch pushed
[ ] final main updated
```

---

# 54. Главное правило всего хакатона

```text
WORKING MVP
      ↓
FULL END-TO-END FLOW
      ↓
BUG FIXES
      ↓
README
      ↓
OPTIONAL FEATURES
```

Никогда не наоборот.

Если осталось мало времени:

```text
НЕ добавляем новое.
```

Доделываем:

```text
Draft
→ AI
→ Card
→ Rating
→ Publish
→ Catalog
→ Proposal
→ Manual Decision
```

Это главный продукт.
