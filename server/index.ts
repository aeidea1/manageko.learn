import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "manageko-super-secret-change-me";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Требуется авторизация" });
  try {
    req.user = jwt.verify(token, SECRET_KEY) as any;
    next();
  } catch {
    return res.status(401).json({ error: "Токен недействителен или истёк" });
  }
};

const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Доступ запрещён" });
  next();
};

const teacherMiddleware = (req: any, res: any, next: any) => {
  if (!["admin", "teacher"].includes(req.user?.role))
    return res.status(403).json({
      error: "Доступ запрещён: требуется роль преподавателя или администратора",
    });
  next();
};

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
    if (user.isActive === false)
      return res
        .status(403)
        .json({ error: "Аккаунт заблокирован. Обратитесь к администратору." });
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
        bio: (user as any).bio,
        github: (user as any).github,
        vk: (user as any).vk,
        telegram: (user as any).telegram,
        coverColor: (user as any).coverColor,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Публичный профиль пользователя
app.get("/api/profile/:id", async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        name: true,
        surname: true,
        avatar: true,
        role: true,
        bio: true,
        github: true,
        vk: true,
        telegram: true,
        coverColor: true,
        createdAt: true,
        enrollments: {
          where: { status: "completed" },
          select: { course: { select: { title: true } } },
        },
      },
    });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/api/profile", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.userId; // берём из токена, а не из тела
    const {
      name,
      surname,
      password,
      avatar,
      bio,
      github,
      vk,
      telegram,
      coverColor,
    } = req.body;
    const updateData: any = { name, surname };
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (github !== undefined) updateData.github = github;
    if (vk !== undefined) updateData.vk = vk;
    if (telegram !== undefined) updateData.telegram = telegram;
    if (coverColor !== undefined) updateData.coverColor = coverColor;
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
      bio: (updatedUser as any).bio,
      github: (updatedUser as any).github,
      vk: (updatedUser as any).vk,
      telegram: (updatedUser as any).telegram,
      coverColor: (updatedUser as any).coverColor,
    });
  } catch (error) {
    res.status(500).json({ error: "Не удалось обновить профиль" });
  }
});

// ─── COURSES ───────────────────────────────────────────────────────────────

app.get("/api/courses", async (req: any, res: any) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(999, Math.max(1, parseInt(String(limit))));
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (category && search) {
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

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy: [{ students: "desc" }, { createdAt: "desc" }],
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          description: true,
          skills: true,
          category: true,
          image: true,
          rating: true,
          students: true,
          createdAt: true,
          _count: { select: { lessons: true } },
        },
      }),
    ]);

    res.json({
      courses,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
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
          include: {
            questions: true,
            documents: true,
            practiceDocuments: true,
          },
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
          include: {
            questions: true,
            documents: true,
            practiceDocuments: true,
          },
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

      // Документы практики
      if (l.practiceDocuments && l.practiceDocuments.length > 0) {
        for (const doc of l.practiceDocuments) {
          await (prisma as any).practiceDocument.create({
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
          include: {
            questions: true,
            documents: true,
            practiceDocuments: true,
          },
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
              include: {
                questions: true,
                documents: true,
                practiceDocuments: true,
              },
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
        where: {
          userId: updated.userId,
          courseId: updated.courseId,
          type: "course_complete",
        },
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
app.get(
  "/api/admin/stats",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const [users, courses, enrollments, completedEnrollments] =
        await Promise.all([
          prisma.user.count(),
          prisma.course.count(),
          prisma.enrollment.count(),
          prisma.enrollment.count({ where: { status: "completed" } }),
        ]);
      res.json({ users, courses, enrollments, completedEnrollments });
    } catch {
      res.status(500).json({ error: "Ошибка" });
    }
  },
);

// Все пользователи
app.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
      });
      res.json(users);
    } catch {
      res.status(500).json({ error: "Ошибка" });
    }
  },
);

// Изменить роль пользователя
app.put(
  "/api/admin/users/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const { role } = req.body;
      if (!["student", "teacher", "admin"].includes(role))
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
  },
);

// Удалить пользователя
app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const uid = Number(req.params.id);
      await prisma.enrollment.deleteMany({ where: { userId: uid } });
      await (prisma as any).notification.deleteMany({ where: { userId: uid } });
      await (prisma as any).comment.updateMany({
        where: { userId: uid },
        data: { userId: uid }, // сначала обнуляем ответы
      });
      await (prisma as any).comment.deleteMany({ where: { userId: uid } });
      await prisma.user.delete({ where: { id: uid } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Ошибка" });
    }
  },
);

// Деактивировать / активировать пользователя
app.put(
  "/api/admin/users/:id/toggle-active",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const uid = Number(req.params.id);
      const current = await prisma.user.findUnique({
        where: { id: uid },
        select: { isActive: true },
      });
      if (!current)
        return res.status(404).json({ error: "Пользователь не найден" });
      const updated = await prisma.user.update({
        where: { id: uid },
        data: { isActive: !current.isActive },
        select: { id: true, email: true, isActive: true },
      });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Ошибка" });
    }
  },
);

// Рассылка уведомлений всем пользователям
app.post(
  "/api/admin/notify-all",
  authMiddleware,
  adminMiddleware,
  async (req: any, res: any) => {
    try {
      const { title, message } = req.body;
      if (!title || !message)
        return res.status(400).json({ error: "Заполните все поля" });
      const users = await prisma.user.findMany({ select: { id: true } });
      await Promise.all(
        users.map((u) =>
          (prisma as any).notification.create({
            data: { userId: u.id, type: "announcement", title, message },
          }),
        ),
      );
      res.json({ sent: users.length });
    } catch {
      res.status(500).json({ error: "Ошибка при рассылке" });
    }
  },
);

// ─── COMMENTS ─────────────────────────────────────────────────────────────

// Получить комментарии урока
app.get("/api/lessons/:lessonId/comments", async (req: any, res: any) => {
  try {
    const comments = await (prisma as any).comment.findMany({
      where: { lessonId: Number(req.params.lessonId), parentId: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            avatar: true,
            role: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                avatar: true,
                role: true,
              },
            },
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
    if (!userId || !text?.trim())
      return res.status(400).json({ error: "Заполните все поля" });
    const comment = await (prisma as any).comment.create({
      data: {
        lessonId: Number(req.params.lessonId),
        userId: Number(userId),
        text: text.trim(),
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            avatar: true,
            role: true,
          },
        },
        replies: [],
      },
    });

    // Уведомление автору родительского комментария
    if (parentId) {
      const parentComment = await (prisma as any).comment.findUnique({
        where: { id: Number(parentId) },
        include: { user: true },
      });
      if (parentComment && parentComment.userId !== Number(userId)) {
        const replier = await prisma.user.findUnique({
          where: { id: Number(userId) },
          select: { name: true, surname: true },
        });
        const replierName =
          [replier?.name, replier?.surname].filter(Boolean).join(" ") ||
          "Кто-то";
        await (prisma as any).notification.create({
          data: {
            userId: parentComment.userId,
            type: "comment_reply",
            title: "Новый ответ на ваш комментарий",
            message: `${replierName} ответил(а) на ваш комментарий: «${text.trim().slice(0, 80)}»`,
          },
        });
      }
    }

    res.status(201).json(comment);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Удалить комментарий
app.delete("/api/comments/:id", async (req: any, res: any) => {
  try {
    await (prisma as any).comment.deleteMany({
      where: { parentId: Number(req.params.id) },
    });
    await (prisma as any).comment.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// Редактировать комментарий
app.put("/api/comments/:id", async (req: any, res: any) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ error: "Текст не может быть пустым" });
    const comment = await (prisma as any).comment.update({
      where: { id: Number(req.params.id) },
      data: { text: text.trim(), edited: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
    res.json(comment);
  } catch {
    res.status(500).json({ error: "Ошибка" });
  }
});

// ─── PASSWORD RECOVERY ─────────────────────────────────────────────────────

// Верификация токена восстановления пароля
app.get("/api/recovery/verify/:token", async (req: any, res: any) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: req.params.token,
        resetTokenExpiry: { gt: new Date() },
      },
      select: { email: true },
    });
    if (!user)
      return res.status(400).json({ error: "Токен недействителен или истёк" });
    res.json({ email: user.email });
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Запрос на сброс пароля (алиас для RecoveryPage)
app.post("/api/recovery/request", async (req: any, res: any) => {
  return req.app._router.handle(
    Object.assign(req, {
      url: "/api/forgot-password",
      path: "/api/forgot-password",
    }),
    res,
    () => {},
  );
});

// Сброс пароля (алиас для RecoveryPage)
app.post("/api/recovery/reset", async (req: any, res: any) => {
  return req.app._router.handle(
    Object.assign(req, {
      url: "/api/reset-password",
      path: "/api/reset-password",
    }),
    res,
    () => {},
  );
});

app.post("/api/forgot-password", async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Всегда отвечаем одинаково — чтобы не раскрывать существование email
    if (!user)
      return res.json({
        message: "Если email зарегистрирован, ссылка отправлена",
      });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 час

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Manageko Learn <noreply@yourdomain.com>",
      to: email,
      subject: "Восстановление пароля",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Восстановление пароля</h2>
          <p>Вы запросили сброс пароля для аккаунта <b>${email}</b>.</p>
          <p>Нажмите кнопку ниже, чтобы задать новый пароль. Ссылка действительна <b>1 час</b>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;">
            Сбросить пароль
          </a>
          <p style="margin-top:24px;color:#888;font-size:13px;">Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
        </div>
      `,
    });

    res.json({ message: "Если email зарегистрирован, ссылка отправлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/reset-password", async (req: any, res: any) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Заполните все поля" });

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ error: "Ссылка недействительна или устарела" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Пароль успешно изменён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ─── ACTIVITY ────────────────────────────────────────────────────────────────

app.post("/api/activity", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await (prisma as any).userActivity.upsert({
      where: { userId_date: { userId, date: today } },
      update: {},
      create: { userId, date: today },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при сохранении активности" });
  }
});

app.get("/api/activity", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    monday.setUTCHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);
    const records = await (prisma as any).userActivity.findMany({
      where: { userId, date: { gte: monday, lte: sunday } },
      select: { date: true },
    });
    const activeDays: boolean[] = Array(7).fill(false);
    records.forEach(({ date }: { date: Date }) => {
      const d = new Date(date);
      const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      activeDays[idx] = true;
    });
    res.json({ activeDays });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении активности" });
  }
});

// ─── POPULAR CATEGORIES ───────────────────────────────────────────────────────

app.get("/api/popular-categories", async (req: any, res: any) => {
  try {
    const result = await prisma.$queryRaw<
      { category: string; count: bigint; students: bigint }[]
    >`
      SELECT category, COUNT(*) as count, COALESCE(SUM(students), 0) as students
      FROM "Course"
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY students DESC, count DESC
      LIMIT 8
    `;
    res.json(
      result.map((r) => ({
        category: r.category,
        count: Number(r.count),
        students: Number(r.students),
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении категорий" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
