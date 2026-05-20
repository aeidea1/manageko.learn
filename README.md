# Manageko Learn

**Manageko Learn** — образовательная платформа (LMS) для создания и прохождения онлайн-курсов. Проект разработан в качестве дипломной работы по специальности 09.02.07 «Информационные системы и программирование».

🌐 **Деплой:** [manageko-learn.vercel.app](https://manageko-learn.vercel.app)

---

## Возможности

- 📚 Каталог курсов с поиском и фильтрацией по категориям
- 🎓 Запись на курсы, отслеживание прогресса по урокам
- 🧪 Тестирование: одиночный и множественный выбор ответов
- 💬 Система комментариев с ответами и уведомлениями
- 🔔 Push-уведомления на платформе
- 👤 Профили пользователей с настраиваемой обложкой и соцсетями
- 📊 Дашборд студента: статистика, активность за неделю
- 🛠 Административная панель: управление курсами, уроками, пользователями
- 🔐 Ролевая система: `user`, `teacher`, `admin`

---

## Стек технологий

### Клиент
| Технология | Версия | Назначение |
|---|---|---|
| React | 19 | UI-фреймворк |
| TypeScript | 5.9 | Статическая типизация |
| Vite | 7 | Сборщик |
| React Router | 7 | Маршрутизация |
| Tailwind CSS | 4 | Стилизация |
| Axios | 1.13 | HTTP-запросы |
| Lucide React | 0.575 | Иконки |
| React Hot Toast | 2.6 | Уведомления |

### Сервер
| Технология | Версия | Назначение |
|---|---|---|
| Node.js | 20+ | Среда выполнения |
| Express | 5 | HTTP-сервер |
| TypeScript | 5.9 | Статическая типизация |
| Prisma ORM | 7 | Работа с БД |
| PostgreSQL | 15+ | База данных |
| JWT | — | Аутентификация |
| bcryptjs | — | Хэширование паролей |
| nodemon + ts-node | — | Разработка |

### Инфраструктура
| Сервис | Назначение |
|---|---|
| Vercel | Хостинг клиента |
| Railway | Хостинг сервера + PostgreSQL |

---

## Локальный запуск

### Требования
- Node.js 20+
- PostgreSQL 15+ (локально или в облаке)
- npm

---

### 1. Клонирование репозитория

```bash
git clone https://github.com/<your-username>/manageko-learn.git
cd manageko-learn
```

---

### 2. Настройка сервера

```bash
cd server
npm install
```

Создай файл `.env` в папке `server/`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/manageko_db?schema=public"
JWT_SECRET=your-very-long-secret-key
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_xxxxxxxx   # не обязательно, функция восстановления пароля в разработке
```

Применить миграции и сгенерировать Prisma Client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Запустить сервер:

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`.

---

### 3. Настройка клиента

Открой новый терминал:

```bash
cd ..          # вернуться в корень проекта
npm install
```

Создай файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:3000
```

Запустить клиент:

```bash
npm run dev
```

Клиент запустится на `http://localhost:5173`.

---

### 4. Первый вход

После запуска зарегистрируй аккаунт через интерфейс. Чтобы выдать себе роль администратора — зайди в БД и вручную измени поле `role` на `admin`:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Описание API

Базовый URL: `http://localhost:3000` (локально) или Railway URL (прод).

Защищённые эндпоинты требуют заголовок:
```
Authorization: Bearer <JWT_TOKEN>
```

### Аутентификация
| Метод | Эндпоинт | Описание |
|---|---|---|
| POST | `/api/register` | Регистрация |
| POST | `/api/login` | Вход, возвращает JWT |

### Курсы
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/courses` | Каталог (query: `search`, `category`) |
| POST | `/api/courses` | Создать курс (admin) |
| PUT | `/api/courses/:id` | Редактировать курс (admin) |
| DELETE | `/api/courses/:id` | Удалить курс (admin) |

### Уроки
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/courses/:id/lessons` | Список уроков курса |
| POST | `/api/courses/:id/lessons` | Создать урок (admin) |
| PUT | `/api/lessons/:id` | Редактировать урок (admin) |
| DELETE | `/api/lessons/:id` | Удалить урок (admin) |

### Обучение
| Метод | Эндпоинт | Описание |
|---|---|---|
| POST | `/api/enroll` | Записаться на курс |
| GET | `/api/my-courses/:userId` | Курсы пользователя |
| PUT | `/api/enrollment/:id/progress` | Обновить прогресс урока |
| PUT | `/api/enrollment/:id/complete` | Завершить курс |
| PUT | `/api/enrollment/:id/rating` | Поставить оценку курсу |

### Комментарии
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/lessons/:id/comments` | Комментарии урока |
| POST | `/api/lessons/:id/comments` | Добавить комментарий |
| PUT | `/api/comments/:id` | Редактировать комментарий |
| DELETE | `/api/comments/:id` | Удалить комментарий |

### Профиль и активность
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/profile/:id` | Публичный профиль |
| PUT | `/api/profile` | Редактировать профиль |
| GET | `/api/activity` | Активность за неделю |
| POST | `/api/activity` | Зафиксировать активность |

### Уведомления
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/notifications/:userId` | Уведомления пользователя |
| PUT | `/api/notifications/:id/read` | Отметить как прочитанное |

### Администрирование
| Метод | Эндпоинт | Описание |
|---|---|---|
| GET | `/api/admin/stats` | Статистика платформы |
| GET | `/api/admin/users` | Список пользователей |
| PUT | `/api/admin/users/:id/role` | Изменить роль |
| DELETE | `/api/admin/users/:id` | Удалить пользователя |
| POST | `/api/admin/notify` | Массовое уведомление |

---

## Структура проекта

```
manageko-learn/
├── src/                    # Клиент (React)
│   ├── components/         # Переиспользуемые компоненты
│   ├── pages/              # Страницы (роуты)
│   ├── context/            # AuthContext
│   └── App.tsx             # Роутер
├── server/                 # Сервер (Express)
│   ├── index.ts            # Точка входа, все роуты
│   ├── prisma/
│   │   └── schema.prisma   # Схема БД
│   └── .env                # Переменные окружения
└── README.md
```

---

## Автор

**Амангельды Сембаев** — студент БПОУ «Омский АТК», специальность 09.02.07  
Дипломный проект, 2026 г.
