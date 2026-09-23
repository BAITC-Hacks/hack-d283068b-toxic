import { useState } from 'react'
import TaskCard from '../components/TaskCard'

// DEV MOCK: replace with getTasks({ topic, readiness, sort }) when backend network is available
const DEV_MOCK_CATALOG_TASKS = [
  {
    id: 2,
    title: 'AI-анализ документов',
    topic: 'AI',
    context: 'Компания вручную проверяет входящие документы.',
    need: 'Нужно ускорить проверку и снизить количество ошибок.',
    users: 'Сотрудники отдела проверки',
    data_materials: 'Обезличенные примеры документов',
    constraints: 'Поддержка русского языка',
    expected_result: 'Прототип сервиса анализа документов',
    success_criteria: 'Сокращение времени проверки на 30%',
    contact: 'ai@example.com',
    interaction_format: 'Одна встреча в неделю',
    score: 95,
    readiness: 'priority',
    missing_fields: [],
    status: 'published',
  },
  {
    id: 3,
    title: 'Помощник контакт-центра',
    topic: 'Customer Service',
    context: 'Операторы долго ищут ответы на повторяющиеся вопросы.',
    need: 'Нужен быстрый поиск подходящих ответов.',
    users: 'Операторы контакт-центра',
    data_materials: 'История обращений и база знаний',
    constraints: 'Ответы должен подтверждать оператор',
    expected_result: 'Прототип AI-помощника',
    success_criteria: 'Среднее время ответа снижено на 20%',
    contact: 'support@example.com',
    interaction_format: 'Две консультации в неделю',
    score: 88,
    readiness: 'ready',
    missing_fields: [],
    status: 'published',
  },
  {
    id: 4,
    title: 'Аналитика продаж',
    topic: 'Analytics',
    context: 'Отчёты по продажам собираются вручную.',
    need: 'Автоматизировать подготовку основных показателей.',
    users: 'Менеджеры по продажам',
    data_materials: 'Выгрузки продаж в CSV',
    constraints: '',
    expected_result: 'Интерактивный прототип отчёта',
    success_criteria: '',
    contact: 'sales@example.com',
    interaction_format: '',
    score: 68,
    readiness: 'working',
    missing_fields: ['constraints', 'success_criteria', 'interaction_format'],
    status: 'published',
  },
  {
    id: 5,
    title: 'Проверка практических заданий',
    topic: 'Education',
    context: 'Преподаватели тратят много времени на первичную проверку.',
    need: 'Автоматизировать базовую обратную связь студентам.',
    users: 'Студенты и преподаватели',
    data_materials: 'Примеры заданий и критерии оценки',
    constraints: 'Финальную оценку выставляет преподаватель',
    expected_result: 'Работающий прототип проверки',
    success_criteria: 'Время первичной проверки снижено вдвое',
    contact: 'education@example.com',
    interaction_format: 'Еженедельная демонстрация',
    score: 92,
    readiness: 'priority',
    missing_fields: [],
    status: 'published',
  },
  {
    id: 6,
    title: 'Автоматизация заявок',
    topic: 'Automation',
    context: 'Внутренние заявки распределяются вручную.',
    need: 'Автоматически определять категорию и исполнителя.',
    users: 'Сотрудники сервисного отдела',
    data_materials: 'Архив заявок',
    constraints: 'Интеграция не требуется для MVP',
    expected_result: 'Прототип классификатора заявок',
    success_criteria: '',
    contact: 'automation@example.com',
    interaction_format: 'Одна консультация в неделю',
    score: 78,
    readiness: 'ready',
    missing_fields: ['success_criteria'],
    status: 'published',
  },
]

function CatalogPage({ publishedTasks = [], onTaskOpen }) {
  const [topic, setTopic] = useState('')
  const [readiness, setReadiness] = useState('')
  const [sort, setSort] = useState('rating_desc')

  const tasks = [...publishedTasks, ...DEV_MOCK_CATALOG_TASKS]
    .filter((task) => task.status === 'published')
    .filter((task) => !topic || task.topic === topic)
    .filter((task) => !readiness || task.readiness === readiness)
    .sort((firstTask, secondTask) => {
      if (sort === 'rating_desc') return secondTask.score - firstTask.score
      return 0
    })

  const topics = [...new Set(
    [...publishedTasks, ...DEV_MOCK_CATALOG_TASKS]
      .filter((task) => task.status === 'published')
      .map((task) => task.topic),
  )].sort()

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Student</p>
      <h1>Catalog</h1>

      <div className="catalog-filters">
        <label>
          Topic
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="">All topics</option>
            {topics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Readiness
          <select value={readiness} onChange={(event) => setReadiness(event.target.value)}>
            <option value="">All readiness levels</option>
            <option value="draft">Draft</option>
            <option value="working">Working</option>
            <option value="ready">Ready</option>
            <option value="priority">Priority</option>
          </select>
        </label>

        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="rating_desc">Rating: high to low</option>
          </select>
        </label>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onTaskOpen} />
        ))}
      </div>

      {tasks.length === 0 && <p>No published tasks match the selected filters.</p>}
    </section>
  )
}

export default CatalogPage
