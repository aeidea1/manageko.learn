import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ClipboardList,
  Wrench,
  FileText,
  Download,
  XCircle,
  X,
  ZoomIn,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { RichTextFull } from "../lib/richText";

type Step = "video" | "test" | "practice" | "finish";

export const CoursePlayerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;
  const enrollmentIdFromState = location.state?.enrollmentId;
  const initialProgress = location.state?.progress ?? 0;

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const courseTitle = course?.title || "Курс не найден";
  const lessons = course?.lessons || [];

  const getInitialLessonIndex = () => {
    if (initialProgress >= 100) return 0;
    const idx = Math.floor((initialProgress / 100) * lessons.length);
    return Math.min(idx, Math.max(0, lessons.length - 1));
  };

  const [activeLessonIndex, setActiveLessonIndex] = useState(
    getInitialLessonIndex,
  );
  const [currentStep, setCurrentStep] = useState<Step>("video");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [rating, setRating] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(
    enrollmentIdFromState || null,
  );
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState(initialProgress);

  const currentLesson = lessons[activeLessonIndex] || null;
  const questions = currentLesson?.questions || [];
  const activeQuestion = questions[activeQuestionIndex] || null;
  const documents = currentLesson?.documents || [];

  useEffect(() => {
    if (!course?.id || !user?.id || enrollmentId) return;
    api
      .post("/enroll", { userId: user.id, courseId: course.id })
      .then((res) => setEnrollmentId(res.data.id))
      .catch(() => {});
  }, [course?.id]);

  const updateProgress = async (progress: number, status = "in_progress") => {
    if (!enrollmentId) return;
    try {
      await api.put(`/enrollment/${enrollmentId}/progress`, {
        progress,
        status,
      });
    } catch {}
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsAnswerCorrect(false);
    setAttempts(0);
  };

  const goToLesson = (idx: number) => {
    setActiveLessonIndex(idx);
    setCurrentStep("video");
    setActiveQuestionIndex(0);
    resetQuestion();
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !activeQuestion) return;
    const correct =
      Array.isArray(activeQuestion.correctAnswers) &&
      activeQuestion.correctAnswers.includes(selectedOption);
    setIsAnswerCorrect(correct);
    setIsAnswerChecked(true);
    setAttempts((p) => p + 1);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((p) => p + 1);
      resetQuestion();
    } else {
      setCurrentStep("practice");
      resetQuestion();
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < lessons.length - 1) {
      const newProgress = Math.round(
        ((activeLessonIndex + 1) / lessons.length) * 100,
      );
      setLocalProgress(newProgress);
      updateProgress(newProgress);
      goToLesson(activeLessonIndex + 1);
    } else {
      setLocalProgress(100);
      updateProgress(100, "completed");
      setCurrentStep("finish");
    }
  };

  const handleFinishRating = async () => {
    if (rating === 0) {
      toast.error("Поставьте оценку курсу");
      return;
    }
    setIsSavingRating(true);
    try {
      if (enrollmentId)
        await api.put(`/enrollment/${enrollmentId}/rating`, { rating });
      toast.success("Спасибо за оценку!");
      navigate("/my-learning");
    } catch {
      navigate("/my-learning");
    } finally {
      setIsSavingRating(false);
    }
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Lightbox для медиа */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-white/10 p-2 rounded-full">
            <X size={24} />
          </button>
          {lightboxSrc.startsWith("data:video") ? (
            <video
              src={lightboxSrc}
              controls
              className="max-w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightboxSrc}
              alt="Медиа"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* САЙДБАР */}
          <aside className="lg:col-span-3 hidden lg:flex flex-col gap-5">
            <div>
              <Link
                to="/dashboard"
                className="text-xs text-gray-500 hover:text-[#0056D2] flex items-center gap-1 mb-3"
              >
                <ChevronLeft size={14} /> На главную
              </Link>
              <h1 className="text-base font-bold mb-0.5">{courseTitle}</h1>
              <p className="text-xs text-gray-500">
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "урок"
                  : lessons.length < 5
                    ? "урока"
                    : "уроков"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {lessons.map((lesson: any, idx: number) => (
                <button
                  key={lesson.id}
                  onClick={() => goToLesson(idx)}
                  className={`text-left p-3 rounded-md border text-sm transition-all ${
                    idx === activeLessonIndex
                      ? "bg-blue-50 border-blue-200 text-[#0056D2] font-bold"
                      : idx < activeLessonIndex
                        ? "border-green-100 bg-green-50/50 text-gray-600"
                        : "border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {idx < activeLessonIndex && (
                      <CheckCircle2
                        size={13}
                        className="text-green-500 shrink-0"
                      />
                    )}
                    <div>
                      <span className="text-[10px] text-gray-400 block">
                        Урок {idx + 1}
                      </span>
                      {lesson.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {lessons.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Прогресс</span>
                  <span className="font-bold text-[#0056D2]">
                    {localProgress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0056D2] rounded-full transition-all"
                    style={{ width: `${localProgress}%` }}
                  />
                </div>
              </div>
            )}
          </aside>

          {/* ПЛЕЕР */}
          <section className="lg:col-span-9">
            {currentStep === "finish" ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
                <CheckCircle2 size={64} className="text-green-500 mb-6" />
                <h1 className="text-2xl font-bold mb-2 text-center">
                  {courseTitle}
                </h1>
                <p className="text-gray-600 mb-8 text-center">
                  Поздравляем! Вы прошли курс.
                  <br />
                  Оцените его по пятибалльной шкале.
                </p>
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={48}
                        className={
                          rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleFinishRating}
                  disabled={isSavingRating}
                  className="px-10 py-3 text-sm font-bold"
                >
                  {isSavingRating ? "Сохранение..." : "Завершить курс"}
                </Button>
              </div>
            ) : !currentLesson ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  В этом курсе пока нет уроков.
                </p>
                <Link
                  to="/dashboard"
                  className="text-[#0056D2] hover:underline text-sm"
                >
                  ← На главную
                </Link>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 flex-wrap">
                  <Link to="/dashboard" className="hover:text-[#0056D2]">
                    {courseTitle}
                  </Link>
                  <span>/</span>
                  <span>
                    Урок {activeLessonIndex + 1} из {lessons.length}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-3">
                  {currentLesson.title}
                </h1>

                {/* Табы */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {[
                    { step: "video" as Step, label: "Лекция", icon: BookOpen },
                    {
                      step: "test" as Step,
                      label: "Тест",
                      icon: ClipboardList,
                    },
                    {
                      step: "practice" as Step,
                      label: "Практика",
                      icon: Wrench,
                    },
                  ].map(({ step, label, icon: Icon }) => (
                    <button
                      key={step}
                      onClick={() => {
                        setCurrentStep(step);
                        resetQuestion();
                        setActiveQuestionIndex(0);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                        currentStep === step
                          ? "bg-[#0056D2] text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>

                {/* ЛЕКЦИЯ */}
                {currentStep === "video" && (
                  <div>
                    {currentLesson.lectureText ? (
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-6">
                        <RichTextFull text={currentLesson.lectureText} />
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm mb-6 italic">
                        Текст лекции не добавлен.
                      </p>
                    )}
                    {currentLesson.mediaUrl && (
                      <div
                        className="w-full rounded-lg overflow-hidden mb-6 border border-gray-200 cursor-zoom-in relative group"
                        onClick={() => setLightboxSrc(currentLesson.mediaUrl)}
                      >
                        {currentLesson.mediaUrl.startsWith("data:video") ? (
                          <video
                            src={currentLesson.mediaUrl}
                            controls
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <img
                            src={currentLesson.mediaUrl}
                            alt="Медиа"
                            className="w-full object-cover max-h-[400px]"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                          <ZoomIn
                            size={28}
                            className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow"
                          />
                        </div>
                      </div>
                    )}
                    {documents.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <FileText size={15} className="text-[#0056D2]" />{" "}
                          Материалы урока
                        </h3>
                        <div className="space-y-2">
                          {documents.map((doc: any) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              download={doc.name}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0056D2] hover:bg-blue-50 transition-all group"
                            >
                              <div className="w-9 h-9 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                                <FileText
                                  size={17}
                                  className="text-[#0056D2]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">
                                  {doc.name}
                                </p>
                                {doc.size && (
                                  <p className="text-xs text-gray-400">
                                    {doc.size}
                                  </p>
                                )}
                              </div>
                              <Download
                                size={15}
                                className="text-gray-400 group-hover:text-[#0056D2] shrink-0"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() =>
                        questions.length > 0
                          ? setCurrentStep("test")
                          : setCurrentStep("practice")
                      }
                      className="px-8 py-3 rounded-sm font-bold text-sm"
                    >
                      {questions.length > 0
                        ? "Перейти к тестированию →"
                        : "Перейти к практике →"}
                    </Button>
                  </div>
                )}

                {/* ТЕСТ */}
                {currentStep === "test" && (
                  <div>
                    {questions.length === 0 ? (
                      <div className="text-center py-10">
                        <ClipboardList
                          size={40}
                          className="text-gray-200 mx-auto mb-3"
                        />
                        <p className="text-gray-400 mb-4">
                          Тестов для этого урока нет.
                        </p>
                        <Button
                          onClick={() => setCurrentStep("practice")}
                          className="px-8 py-3 text-sm"
                        >
                          К практике
                        </Button>
                      </div>
                    ) : activeQuestion ? (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-base font-bold">
                            Вопрос {activeQuestionIndex + 1} из{" "}
                            {questions.length}
                          </h2>
                          <div className="flex gap-1.5">
                            {questions.map((_: any, i: number) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setActiveQuestionIndex(i);
                                  resetQuestion();
                                }}
                                className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                                  i === activeQuestionIndex
                                    ? "bg-[#0056D2] text-white"
                                    : i < activeQuestionIndex
                                      ? "bg-green-400 text-white"
                                      : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-black mb-5 leading-relaxed">
                          {activeQuestion.text || "Вопрос без текста"}
                        </p>
                        <div className="space-y-3 mb-6">
                          {Array.isArray(activeQuestion.options) &&
                            activeQuestion.options.map((opt: any) => {
                              const isSelected = selectedOption === opt.id;
                              let cls =
                                "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                              if (isAnswerChecked) {
                                if (isAnswerCorrect && isSelected)
                                  cls = "border-green-300 bg-green-50";
                                else if (!isAnswerCorrect && isSelected)
                                  cls = "border-red-300 bg-red-50";
                              } else if (isSelected)
                                cls = "border-[#0056D2] bg-blue-50";
                              return (
                                <label
                                  key={opt.id}
                                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-all ${cls} ${isAnswerChecked && isAnswerCorrect ? "pointer-events-none" : ""}`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${activeQuestion.id}`}
                                    className="w-4 h-4 accent-[#0056D2]"
                                    onChange={() => {
                                      setSelectedOption(opt.id);
                                      setIsAnswerChecked(false);
                                      setIsAnswerCorrect(false);
                                      setAttempts(0);
                                    }}
                                    checked={isSelected}
                                    disabled={
                                      isAnswerChecked && isAnswerCorrect
                                    }
                                  />
                                  <span className="text-sm text-black">
                                    {opt.text}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                        {isAnswerChecked && isAnswerCorrect && (
                          <div className="mb-5 p-4 bg-[#eefaf3] border border-green-200 rounded-md animate-in fade-in">
                            <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-1">
                              <CheckCircle2 size={17} /> Верно!
                            </div>
                            {activeQuestion.explanation && (
                              <p className="text-xs text-gray-600 pl-6">
                                {activeQuestion.explanation}
                              </p>
                            )}
                          </div>
                        )}
                        {isAnswerChecked && !isAnswerCorrect && (
                          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-md animate-in fade-in">
                            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                              <XCircle size={17} /> Неверно. Попробуйте ещё раз.
                            </div>
                            {attempts >= 3 && (
                              <p className="text-xs text-gray-500 mt-1 pl-6">
                                Подсказка: выберите другой вариант.
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {activeQuestionIndex > 0 && (
                            <button
                              onClick={() => {
                                setActiveQuestionIndex((p) => p - 1);
                                resetQuestion();
                              }}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0056D2] border border-gray-200 px-4 py-2.5 rounded-sm hover:border-[#0056D2] transition-colors"
                            >
                              <ChevronLeft size={15} /> Назад
                            </button>
                          )}
                          {!isAnswerChecked ? (
                            <Button
                              onClick={handleCheckAnswer}
                              disabled={selectedOption === null}
                              className="px-8 py-2.5 text-sm flex-1 sm:flex-none"
                            >
                              Проверить ответ
                            </Button>
                          ) : isAnswerCorrect ? (
                            <Button
                              onClick={handleNextQuestion}
                              className="px-8 py-2.5 text-sm flex-1 sm:flex-none"
                            >
                              {activeQuestionIndex < questions.length - 1
                                ? "Следующий вопрос →"
                                : "К практике →"}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setSelectedOption(null);
                                setIsAnswerChecked(false);
                                setIsAnswerCorrect(false);
                              }}
                              className="px-8 py-2.5 text-sm bg-orange-500 hover:bg-orange-600 flex-1 sm:flex-none"
                            >
                              Попробовать снова
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ПРАКТИКА */}
                {currentStep === "practice" && (
                  <div>
                    <h2 className="text-lg font-bold mb-3">
                      Практическая работа
                    </h2>
                    {currentLesson.practiceTask ? (
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <RichTextFull text={currentLesson.practiceTask} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-6">
                        Задание не добавлено.
                      </p>
                    )}
                    {currentLesson.practiceMediaUrl && (
                      <div
                        className="w-full rounded-lg overflow-hidden mb-6 border border-gray-200 cursor-zoom-in relative group"
                        onClick={() =>
                          setLightboxSrc(currentLesson.practiceMediaUrl)
                        }
                      >
                        {currentLesson.practiceMediaUrl.startsWith(
                          "data:video",
                        ) ? (
                          <video
                            src={currentLesson.practiceMediaUrl}
                            controls
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <img
                            src={currentLesson.practiceMediaUrl}
                            alt="Референс"
                            className="w-full object-cover max-h-[360px]"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                          <ZoomIn
                            size={28}
                            className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow"
                          />
                        </div>
                      </div>
                    )}
                    {/* Кнопка перехода — без блока загрузки работы */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <Button
                        onClick={handleNextLesson}
                        className="px-8 py-3 text-sm font-bold flex items-center gap-2"
                      >
                        {activeLessonIndex < lessons.length - 1 ? (
                          <>
                            <ChevronRight size={15} /> Следующий урок
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} /> Завершить курс
                          </>
                        )}
                      </Button>
                      {activeLessonIndex > 0 && (
                        <button
                          onClick={() => goToLesson(activeLessonIndex - 1)}
                          className="text-sm text-gray-500 hover:text-[#0056D2] flex items-center gap-1 border border-gray-200 px-4 py-3 rounded-sm hover:border-[#0056D2] transition-colors"
                        >
                          <ChevronLeft size={15} /> Предыдущий урок
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
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
