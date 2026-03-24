import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "manageko-super-secret";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: any, res: any) => {
  res.send("Server is running!");
});

// ─── AUTH ──────────────────────────────────────────────────────────────────

app.post("/api/register", async (req: any, res: any) => {
  try {
    const { email, password, name, surname } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, name, surname },
    });
    res.status(201).json({ message: "Успешная регистрация!" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Неверный email или пароль" });
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "24h",
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/api/profile", async (req: any, res: any) => {
  try {
    const { userId, name, surname, password, avatar } = req.body;
    const updateData: any = { name, surname };
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password && password.trim() !== "")
      updateData.password = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    });
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      surname: updatedUser.surname,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ error: "Не удалось обновить профиль" });
  }
});

// ─── COURSES ───────────────────────────────────────────────────────────────

app.get("/api/courses", async (req: any, res: any) => {
  try {
    const { category, search } = req.query;
    let where: any = {};

    if (category && search) {
      // Ищем курсы у которых category совпадает с родительской категорией
      // ИЛИ category совпадает с подкатегорией (search)
      where.OR = [
        { category: { equals: String(search), mode: "insensitive" } },
        { category: { contains: String(search), mode: "insensitive" } },
        {
          AND: [
            {
              category: {
                contains: String(category).split(" ")[0],
                mode: "insensitive",
              },
            },
            {
              OR: [
                { title: { contains: String(search), mode: "insensitive" } },
                { skills: { has: String(search) } },
              ],
            },
          ],
        },
      ];
    } else if (category) {
      // Только фильтр по категории — ищем по точному совпадению и по вхождению
      where.OR = [
        { category: { equals: String(category), mode: "insensitive" } },
        {
          category: {
            contains: String(category).split(" ")[0],
            mode: "insensitive",
          },
        },
      ];
    } else if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { skills: { has: String(search) } },
        { category: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { questions: true, documents: true },
        },
      },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении курсов" });
  }
});

app.get("/api/courses/:id", async (req: any, res: any) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { questions: true, documents: true },
        },
      },
    });
    if (!course) return res.status(404).json({ error: "Курс не найден" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении курса" });
  }
});

app.post("/api/courses", async (req: any, res: any) => {
  try {
    const { title, description, skills, category, image } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        skills: skills || [],
        category: category || null,
        rating: 0,
        students: 0,
        image: image || null,
      },
      include: { lessons: true },
    });
    res.status(201).json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не удалось создать курс" });
  }
});

app.put("/api/courses/:id", async (req: any, res: any) => {
  try {
    const { title, description, skills, category, image } = req.body;
    const updated = await prisma.course.update({
      where: { id: Number(req.params.id) },
      data: { title, description, skills, category, image },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { questions: true, documents: true },
        },
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Не удалось обновить курс" });
  }
});

app.delete("/api/courses/:id", async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    // Сначала удаляем enrollment'ы (нет каскада в схеме)
    await prisma.enrollment.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не удалось удалить курс" });
  }
});

// ─── LESSONS ───────────────────────────────────────────────────────────────

app.post("/api/courses/:courseId/lessons", async (req: any, res: any) => {
  try {
    const courseId = Number(req.params.courseId);
    const { lessons } = req.body;

    await prisma.lesson.deleteMany({ where: { courseId } });

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const lessonData: any = {
        courseId,
        title: l.title,
        order: i + 1,
        lectureText: l.lectureText || "",
        practiceTask: l.practiceTask || "",
        mediaUrl: l.mediaUrl || null,
        practiceMediaUrl: l.practiceMediaUrl || null,
      };
      const lesson = await prisma.lesson.create({ data: lessonData });

      // Документы
      if (l.documents && l.documents.length > 0) {
        for (const doc of l.documents) {
          await prisma.document.create({
            data: {
              lessonId: lesson.id,
              name: doc.name,
              url: doc.url,
              size: doc.size || null,
            },
          });
        }
      }

      // Вопросы
      if (l.questions && l.questions.length > 0) {
        for (const q of l.questions) {
          await prisma.question.create({
            data: {
              lessonId: lesson.id,
              text: q.text,
              isSingleChoice: q.isSingleChoice,
              options: q.options,
              correctAnswers: q.correctAnswers || [],
              explanation: q.explanation || "",
            },
          });
        }
      }
    }

    const updatedCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { questions: true, documents: true },
        },
      },
    });
    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не удалось сохранить уроки" });
  }
});

// ─── ENROLLMENT ────────────────────────────────────────────────────────────

app.post("/api/enroll", async (req: any, res: any) => {
  try {
    const { userId, courseId } = req.body;
    const uId = Number(userId);
    const cId = Number(courseId);

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: uId, courseId: cId } },
    });
    if (existing) return res.json(existing);

    const enrollment = await prisma.enrollment.create({
      data: { userId: uId, courseId: cId },
    });

    await prisma.course.update({
      where: { id: cId },
      data: { students: { increment: 1 } },
    });

    // Уведомление пользователю о старте курса
    const course = await prisma.course.findUnique({ where: { id: cId } });
    if (course) {
      await prisma.notification.create({
        data: {
          userId: uId,
          type: "course_start",
          title: "Вы записались на курс",
          message: `Вы начали изучение курса «${course.title}». Удачи!`,
          courseId: cId,
        },
      });
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: "Не удалось записаться на курс" });
  }
});

app.get("/api/my-courses/:userId", async (req: any, res: any) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: Number(req.params.userId) },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { questions: true, documents: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении курсов" });
  }
});

app.put("/api/enrollment/:id/progress", async (req: any, res: any) => {
  try {
    const { progress, status } = req.body;
    const updated = await prisma.enrollment.update({
      where: { id: Number(req.params.id) },
      data: { progress, status },
      include: { course: true },
    });

    // Уведомление о завершении — только один раз
    if (status === "completed") {
      const existingNotif = await (prisma as any).notification.findFirst({
        where: { userId: updated.userId, courseId: updated.courseId, type: "course_complete" },
      });
      if (!existingNotif) {
        await (prisma as any).notification.create({
          data: {
            userId: updated.userId,
            type: "course_complete",
            title: "Курс пройден!",
            message: `Поздравляем! Вы завершили курс «${updated.course.title}».`,
            courseId: updated.courseId,
          },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Не удалось обновить прогресс" });
  }
});

// Оценка курса студентом
app.put("/api/enrollment/:id/rating", async (req: any, res: any) => {
  try {
    const { rating } = req.body;
    const enrollmentId = Number(req.params.id);

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { rating },
    });

    // Пересчитываем средний рейтинг курса
    const allRatings = await prisma.enrollment.findMany({
      where: { courseId: updated.courseId, rating: { not: null } },
      select: { rating: true },
    });
    const avg =
      allRatings.reduce((sum: number, e: any) => sum + (e.rating || 0), 0) /
      allRatings.length;
    await prisma.course.update({
      where: { id: updated.courseId },
      data: { rating: Math.round(avg * 10) / 10 },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Не удалось сохранить оценку" });
  }
});

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

app.get("/api/notifications/:userId", async (req: any, res: any) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(req.params.userId) },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения уведомлений" });
  }
});

app.put("/api/notifications/:userId/read-all", async (req: any, res: any) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: Number(req.params.userId), isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Ошибка" });
  }
});

app.put("/api/notifications/:id/read", async (req: any, res: any) => {
  try {
    await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Ошибка" });
  }
});

app.delete("/api/notifications/:id", async (req: any, res: any) => {
  try {
    await prisma.notification.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});


// ─── ADMIN ─────────────────────────────────────────────────────────────────

// Статистика платформы
app.get("/api/admin/stats", async (req: any, res: any) => {
  try {
    const [users, courses, enrollments, completedEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "completed" } }),
    ]);
    res.json({ users, courses, enrollments, completedEnrollments });
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Все пользователи
app.get("/api/admin/users", async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, surname: true,
        role: true, createdAt: true,
        _count: { select: { enrollments: true } },
      },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Изменить роль пользователя
app.put("/api/admin/users/:id/role", async (req: any, res: any) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role))
      return res.status(400).json({ error: "Недопустимая роль" });
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Удалить пользователя
app.delete("/api/admin/users/:id", async (req: any, res: any) => {
  try {
    await prisma.enrollment.deleteMany({ where: { userId: Number(req.params.id) } });
    await (prisma as any).notification.deleteMany({ where: { userId: Number(req.params.id) } });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});


// Рассылка уведомлений всем пользователям
app.post("/api/admin/notify-all", async (req: any, res: any) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: "Заполните все поля" });
    const users = await prisma.user.findMany({ select: { id: true } });
    await Promise.all(
      users.map(u =>
        (prisma as any).notification.create({
          data: { userId: u.id, type: "announcement", title, message },
        })
      )
    );
    res.json({ sent: users.length });
  } catch {
    res.status(500).json({ error: "Ошибка при рассылке" });
  }
});


// ─── COMMENTS ─────────────────────────────────────────────────────────────

// Получить комментарии урока
app.get("/api/lessons/:lessonId/comments", async (req: any, res: any) => {
  try {
    const comments = await (prisma as any).comment.findMany({
      where: { lessonId: Number(req.params.lessonId), parentId: null },
      include: {
        user: { select: { id: true, name: true, surname: true, avatar: true, role: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, surname: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Добавить комментарий
app.post("/api/lessons/:lessonId/comments", async (req: any, res: any) => {
  try {
    const { userId, text, parentId } = req.body;
    if (!userId || !text?.trim()) return res.status(400).json({ error: "Заполните все поля" });
    const comment = await (prisma as any).comment.create({
      data: {
        lessonId: Number(req.params.lessonId),
        userId: Number(userId),
        text: text.trim(),
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: { select: { id: true, name: true, surname: true, avatar: true, role: true } },
        replies: [],
      },
    });
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Удалить комментарий
app.delete("/api/comments/:id", async (req: any, res: any) => {
  try {
    await (prisma as any).comment.deleteMany({ where: { parentId: Number(req.params.id) } });
    await (prisma as any).comment.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Редактировать комментарий
app.put("/api/comments/:id", async (req: any, res: any) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Текст не может быть пустым" });
    const comment = await (prisma as any).comment.update({
      where: { id: Number(req.params.id) },
      data: { text: text.trim(), edited: true },
      include: {
        user: { select: { id: true, name: true, surname: true, avatar: true, role: true } },
      },
    });
    res.json(comment);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});


  console.log(`Сервер запущен на порту ${PORT}`);
});
