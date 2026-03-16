import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Star,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Play,
  X,
  ZoomIn,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";

export const CoursePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [enrollment, setEnrollment] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !course?.id) {
      setIsLoading(false);
      return;
    }
    api
      .get(`/my-courses/${user.id}`)
      .then((res) => {
        const found = res.data.find((e: any) => e.courseId === course.id);
        setEnrollment(found || null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [course?.id, user?.id]);

  const handleEnroll = async () => {
    if (!user?.id || !course?.id) return;
    setIsEnrolling(true);
    try {
      const res = await api.post("/enroll", {
        userId: user.id,
        courseId: course.id,
      });
      setEnrollment(res.data);
      toast.success("Вы записались на курс! Удачи в обучении 🎉");
    } catch {
      toast.error("Ошибка при записи на курс");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    navigate("/learn", {
      state: {
        course,
        enrollmentId: enrollment?.id,
        progress: enrollment?.progress || 0,
      },
    });
  };

  if (!course)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-gray-500">Курс не найден.</p>
          <Link
            to="/dashboard"
            className="text-[#0056D2] hover:underline text-sm"
          >
            ← На главную
          </Link>
        </div>
      </div>
    );

  const lessons = course.lessons || [];
  const isCompleted = enrollment?.status === "completed";
  const isInProgress = enrollment?.status === "in_progress";
  const progress = enrollment?.progress || 0;

  const ActionButton = () => {
    if (isLoading)
      return (
        <div className="w-full h-12 bg-gray-100 rounded-sm animate-pulse" />
      );
    if (isCompleted)
      return (
        <Button
          onClick={handleContinue}
          className="w-full py-3 text-sm font-bold"
        >
          Открыть курс снова
        </Button>
      );
    if (isInProgress)
      return (
        <Button
          onClick={handleContinue}
          className="w-full py-3 text-sm font-bold flex items-center gap-2 justify-center"
        >
          <Play size={15} /> Продолжить изучение
        </Button>
      );
    return (
      <Button
        onClick={handleEnroll}
        disabled={isEnrolling}
        className="w-full py-3 text-sm font-bold"
      >
        {isEnrolling ? "Запись..." : "Начать изучение"}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X size={32} />
          </button>
          <img
            src={lightboxImg}
            alt="Полный размер"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
          <Link to="/dashboard" className="hover:text-[#0056D2]">
            Главная
          </Link>
          <ChevronRight size={12} />
          {course.category && (
            <>
              <Link
                to={`/dashboard?category=${encodeURIComponent(course.category)}`}
                className="hover:text-[#0056D2]"
              >
                {course.category}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-gray-600">{course.title}</span>
        </div>

        <div className="max-w-3xl">
          {/* ОСНОВНОЙ КОНТЕНТ — на всю ширину без сайдбара */}
          {/* Обложка — кликабельна */}
          <div
            className={`w-full rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-[#0056D2] to-[#00205C] aspect-[16/6] flex items-center justify-center relative ${course.image ? "cursor-zoom-in" : ""}`}
            onClick={() =>
              course.image &&
              course.image.startsWith("data:image") &&
              setLightboxImg(course.image)
            }
          >
            {course.image && course.image.startsWith("data:image") ? (
              <>
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn
                    size={32}
                    className="text-white opacity-0 hover:opacity-70 transition-opacity"
                  />
                </div>
              </>
            ) : (
              <span className="text-white/10 text-[120px] font-black select-none">
                M
              </span>
            )}
            {course.category && (
              <div className="absolute top-4 left-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                  {course.category}
                </span>
              </div>
            )}
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl font-bold text-black mb-3">{course.title}</h1>

          {/* Мета */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold">
                {course.rating > 0 ? course.rating.toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={15} />
              <span>{course.students || 0} учеников</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <BookOpen size={15} />
              <span>
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "урок"
                  : lessons.length < 5
                    ? "урока"
                    : "уроков"}
              </span>
            </div>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle2 size={13} /> Пройден
              </span>
            )}
            {isInProgress && (
              <span className="flex items-center gap-1 text-xs font-bold text-[#0056D2] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <Clock size={13} /> В процессе — {progress}%
              </span>
            )}
          </div>

          {/* Прогресс + кнопка действия */}
          {enrollment ? (
            <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-black">Ваш прогресс</span>
                <span className="font-bold text-[#0056D2]">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#0056D2] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isCompleted && (
                <p className="text-xs text-green-600 font-bold mb-4 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Курс успешно завершён!
                </p>
              )}
              <ActionButton />
            </div>
          ) : (
            <div className="mb-8">
              <ActionButton />
              {!isLoading && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Бесплатно · Доступ навсегда
                </p>
              )}
            </div>
          )}

          {/* Описание */}
          {course.description && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">О курсе</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          )}

          {/* Навыки */}
          {course.skills && course.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Получаемые навыки</h2>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-[#555d6b] text-white text-xs font-bold rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Программа курса */}
          {lessons.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Программа курса</h2>
              <div className="space-y-2">
                {lessons.map((lesson: any, idx: number) => {
                  const completedCount = Math.floor(
                    (progress / 100) * lessons.length,
                  );
                  const lessonStatus =
                    idx < completedCount
                      ? "done"
                      : idx === completedCount && isInProgress
                        ? "current"
                        : "pending";
                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        lessonStatus === "done"
                          ? "border-green-100 bg-green-50/50"
                          : lessonStatus === "current"
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-gray-100 bg-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          lessonStatus === "done"
                            ? "bg-green-500 text-white"
                            : lessonStatus === "current"
                              ? "bg-[#0056D2] text-white"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {lessonStatus === "done" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            lessonStatus === "done"
                              ? "text-gray-400 line-through"
                              : lessonStatus === "current"
                                ? "text-[#0056D2]"
                                : "text-black"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Лекция
                          {lesson.questions?.length > 0 ? ", тестирование" : ""}
                          {lesson.practiceTask ? ", практика" : ""}
                        </p>
                      </div>
                      {lessonStatus === "done" && (
                        <span className="text-xs text-green-600 font-bold shrink-0 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Пройден
                        </span>
                      )}
                      {lessonStatus === "current" && (
                        <span className="text-xs text-[#0056D2] font-bold shrink-0 flex items-center gap-1">
                          <Play size={10} /> Текущий
                        </span>
                      )}
                      {lessonStatus === "pending" && enrollment && (
                        <span className="text-xs text-gray-400 shrink-0">
                          Не пройден
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 bg-gray-50 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 text-center text-gray-600 text-sm">
          © Manageko Inc., 2026 Все права защищены.
        </div>
      </footer>
    </div>
  );
};
