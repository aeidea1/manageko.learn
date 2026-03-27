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
  FileText,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { LessonComments } from "../components/LessonComments";

export const CoursePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [courseData, setCourseData] = useState<any>(course);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!course?.id) {
      setIsLoading(false);
      return;
    }
    // Загружаем актуальный курс с уроками
    api
      .get(`/courses/${course.id}`)
      .then((res) => setCourseData(res.data))
      .catch(() => {});
    // Загружаем enrollment
    if (!user?.id) {
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
      toast.success("Вы записались на курс!\nУдачи в обучении.", {
        style: { whiteSpace: "pre-line" },
      });
    } catch {
      toast.error("Ошибка при записи на курс");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    navigate("/learn", {
      state: {
        course: courseData,
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

  const lessons = courseData?.lessons || [];
  const isCompleted = enrollment?.status === "completed";
  const isInProgress = enrollment?.status === "in_progress";
  const progress = enrollment?.progress || 0;
  const completedCount = Math.floor((progress / 100) * lessons.length);

  const ActionButton = () => {
    if (isLoading)
      return (
        <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse" />
      );
    if (isCompleted)
      return (
        <Button
          onClick={handleContinue}
          className="w-full py-3 text-sm font-bold rounded-lg"
        >
          Открыть курс снова
        </Button>
      );
    if (isInProgress)
      return (
        <Button
          onClick={handleContinue}
          className="w-full py-3 text-sm font-bold rounded-lg flex items-center gap-2 justify-center"
        >
          <Play size={15} /> Продолжить изучение
        </Button>
      );
    return (
      <div className="space-y-2">
        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full py-3 text-sm font-bold rounded-lg"
        >
          {isEnrolling ? "Запись..." : "Начать изучение бесплатно"}
        </Button>
        <p className="text-xs text-center text-gray-400">
          Бесплатно · Доступ навсегда
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full">
            <X size={24} />
          </button>
          <img
            src={lightboxImg}
            alt="Полный размер"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* HERO */}
      <div
        className="relative w-full bg-[#00205C] overflow-hidden"
        style={{ minHeight: 300 }}
      >
        {courseData.image && courseData.image.startsWith("data:image") && (
          <img
            src={courseData.image}
            alt={courseData.title}
            className="w-full h-full object-cover absolute inset-0 opacity-30"
            style={{ minHeight: 300 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00205C] via-[#00205C]/70 to-transparent" />
        <div
          className="relative max-w-[1440px] mx-auto px-4 sm:px-8 py-10 flex flex-col justify-end"
          style={{ minHeight: 300 }}
        >
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4 flex-wrap">
            <Link to="/dashboard" className="hover:text-white">
              Главная
            </Link>
            <ChevronRight size={12} />
            {courseData.category && (
              <>
                <Link
                  to={`/dashboard?category=${encodeURIComponent(courseData.category)}`}
                  className="hover:text-white"
                >
                  {courseData.category}
                </Link>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-white/80">{courseData.title}</span>
          </div>
          {courseData.category && (
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 mb-3 w-fit">
              {courseData.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            {courseData.title}
          </h1>
          {courseData.description && (
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl mb-4 line-clamp-2">
              {courseData.description}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-white">
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold">
                {courseData.rating > 0 ? courseData.rating.toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <Users size={14} />
              <span>{courseData.students || 0} учеников</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <BookOpen size={14} />
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
              <span className="flex items-center gap-1 text-xs font-bold text-green-300 bg-green-900/40 px-3 py-1 rounded-full border border-green-500/40">
                <CheckCircle2 size={12} /> Пройден
              </span>
            )}
            {isInProgress && (
              <span className="flex items-center gap-1 text-xs font-bold text-blue-200 bg-blue-900/40 px-3 py-1 rounded-full border border-blue-400/40">
                <Clock size={12} /> {progress}% завершено
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="lg:col-span-2 space-y-6">
            {enrollment && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-black">Ваш прогресс</span>
                  <span className="font-bold text-[#0056D2]">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#0056D2] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isCompleted && (
                  <p className="text-xs text-green-600 font-bold flex items-center gap-1 mb-4">
                    <CheckCircle2 size={13} /> Курс успешно завершён!
                  </p>
                )}
                <ActionButton />
              </div>
            )}

            {courseData.description && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-3">О курсе</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {courseData.description}
                </p>
              </div>
            )}

            {courseData.skills && courseData.skills.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Получаемые навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {courseData.skills.map((skill: string, i: number) => (
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

            {lessons.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-5">Программа курса</h2>
                <div className="space-y-3">
                  {lessons.map((lesson: any, idx: number) => {
                    const lessonStatus =
                      idx < completedCount
                        ? "done"
                        : idx === completedCount && isInProgress
                          ? "current"
                          : "pending";
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                          lessonStatus === "done"
                            ? "border-green-100 bg-green-50/50"
                            : lessonStatus === "current"
                              ? "border-blue-200 bg-blue-50/50"
                              : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
                            lessonStatus === "done"
                              ? "bg-green-500 text-white"
                              : lessonStatus === "current"
                                ? "bg-[#0056D2] text-white"
                                : "bg-white border-2 border-gray-200 text-gray-400"
                          }`}
                        >
                          {lessonStatus === "done" ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold mb-1 ${
                              lessonStatus === "done"
                                ? "text-gray-400 line-through"
                                : lessonStatus === "current"
                                  ? "text-[#0056D2]"
                                  : "text-black"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <BookOpen size={11} /> Лекция
                            </span>
                            {lesson.questions?.length > 0 && (
                              <span className="text-xs text-gray-400">
                                ✓ Тест ({lesson.questions.length})
                              </span>
                            )}
                            {lesson.practiceTask && (
                              <span className="text-xs text-gray-400">
                                ⚙ Практика
                              </span>
                            )}
                            {lesson.documents?.length > 0 && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FileText size={11} /> {lesson.documents.length}{" "}
                                файл(а)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {lessonStatus === "done" && (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Пройден
                            </span>
                          )}
                          {lessonStatus === "current" && (
                            <span className="text-xs text-[#0056D2] font-bold flex items-center gap-1">
                              <Play size={10} /> Текущий
                            </span>
                          )}
                          {lessonStatus === "pending" && enrollment && (
                            <span className="text-xs text-gray-400">
                              Не пройден
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Комментарии — показываем всегда когда есть courseData */}
            {courseData?.id &&
              (lessons.length > 0 ? (
                <LessonComments
                  lessonId={lessons[0]?.id}
                  courseTitle={courseData.title}
                />
              ) : (
                <LessonComments lessonId={0} courseTitle={courseData.title} />
              ))}
          </div>

          {/* ПРАВАЯ КОЛОНКА sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className={`w-full aspect-video bg-gradient-to-br from-[#0056D2] to-[#00205C] flex items-center justify-center overflow-hidden relative ${courseData.image ? "cursor-zoom-in" : ""}`}
                  onClick={() =>
                    courseData.image &&
                    courseData.image.startsWith("data:image") &&
                    setLightboxImg(courseData.image)
                  }
                >
                  {courseData.image &&
                  courseData.image.startsWith("data:image") ? (
                    <img
                      src={courseData.image}
                      alt={courseData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/10 text-6xl font-black select-none">
                      M
                    </span>
                  )}
                  {courseData.image &&
                    courseData.image.startsWith("data:image") && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <ZoomIn size={24} className="text-white" />
                      </div>
                    )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1">
                    {courseData.title}
                  </h3>
                  {courseData.category && (
                    <p className="text-xs text-gray-500 mb-4">
                      {courseData.category}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mb-5 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{lessons.length} уроков</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span>
                        {courseData.rating > 0
                          ? courseData.rating.toFixed(1)
                          : "—"}
                      </span>
                    </div>
                  </div>
                  {isInProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Прогресс</span>
                        <span className="font-bold text-[#0056D2]">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0056D2] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-3">
                      <CheckCircle2 size={16} /> Курс пройден!
                    </div>
                  )}
                  <ActionButton />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-bold mb-3">Курс включает</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#0056D2] shrink-0" />
                    <span>{lessons.length} уроков с лекциями</span>
                  </div>
                  {lessons.some((l: any) => l.questions?.length > 0) && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-[#0056D2] shrink-0"
                      />
                      <span>Тесты для проверки знаний</span>
                    </div>
                  )}
                  {lessons.some((l: any) => l.practiceTask) && (
                    <div className="flex items-center gap-2">
                      <Play size={14} className="text-[#0056D2] shrink-0" />
                      <span>Практические задания</span>
                    </div>
                  )}
                  {lessons.some((l: any) => l.documents?.length > 0) && (
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[#0056D2] shrink-0" />
                      <span>Материалы для скачивания</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-[#0056D2] shrink-0"
                    />
                    <span>Сертификат о прохождении</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 text-center text-gray-600 text-sm">
          © Manageko Inc., 2026 Все права защищены.
        </div>
      </footer>
    </div>
  );
};
