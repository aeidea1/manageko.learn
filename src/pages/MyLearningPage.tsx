import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { CourseCard } from "../components/CourseCard";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import toast from "react-hot-toast";

const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

// Популярные теги (как в DashboardPage)
const SKILL_TAGS = [
  "Python",
  "Kotlin",
  "React",
  "Vue",
  "Lua",
  "Figma",
  "UI/UX",
];

export const MyLearningPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"progress" | "completed">(
    "progress",
  );
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityDays, setActivityDays] = useState<boolean[]>(
    Array(7).fill(false),
  );
  const [activityLoading, setActivityLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Активность с сервера
  useEffect(() => {
    const syncActivity = async () => {
      try {
        await api.post("/activity");
        const res = await api.get("/activity");
        setActivityDays(res.data.activeDays);
      } catch {
        setActivityDays(Array(7).fill(false));
      } finally {
        setActivityLoading(false);
      }
    };
    syncActivity();
  }, []);

  // Курсы пользователя
  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/my-courses/${user.id}`)
      .then((res) => setEnrollments(res.data))
      .catch(() => toast.error("Ошибка загрузки курсов"))
      .finally(() => setIsLoading(false));
  }, []);

  const inProgress = enrollments.filter((e) => e.status === "in_progress");
  const completed = enrollments.filter((e) => e.status === "completed");
  const displayList = activeTab === "progress" ? inProgress : completed;
  const activeDaysCount = activityDays.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-10">
          {/* ── САЙДБАР ── */}
          <aside className="lg:col-span-3 flex flex-col gap-6 md:gap-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Добро пожаловать, {user?.name || "студент"}!
              </h1>
              <p className="text-sm text-black">
                Ваша цель — начать карьеру в сфере IT
              </p>
            </div>

            <hr className="border-gray-200 hidden md:block" />

            {/* Активность */}
            <div>
              <h2 className="font-bold text-base mb-3">Активность за неделю</h2>
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-3 max-w-[280px]">
                {DAYS.map((day, idx) => {
                  const isToday = idx === currentDayIndex;
                  const isActive = activityDays[idx];
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded text-xs uppercase font-medium border transition-colors
                        ${
                          activityLoading
                            ? "border-gray-100 bg-gray-50 text-gray-300 animate-pulse"
                            : isToday
                              ? "bg-[#0056D2] text-white border-[#0056D2] shadow"
                              : isActive
                                ? "bg-blue-100 text-[#0056D2] border-blue-200 font-bold"
                                : "border-gray-300 text-gray-400"
                        }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                Активных дней на этой неделе:{" "}
                <span className="font-bold text-black">{activeDaysCount}</span>
              </p>
            </div>

            {/* Популярные теги (как в DashboardPage) */}
            <div>
              <h2 className="font-bold text-xl mb-4 text-black">
                Популярные теги
              </h2>
              <div className="flex flex-wrap gap-2">
                {SKILL_TAGS.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => {
                      setActiveSkill(activeSkill === tag ? null : tag);
                      if (activeSkill !== tag) {
                        navigate(
                          `/dashboard?search=${encodeURIComponent(tag)}`,
                        );
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors ${
                      activeSkill === tag
                        ? "bg-[#0056D2] text-white"
                        : "bg-[#555d6b] text-white hover:bg-gray-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* ── ОСНОВНОЙ КОНТЕНТ ── */}
          <section className="lg:col-span-9">
            <h2 className="text-2xl font-bold mb-4">
              {activeTab === "progress"
                ? "Курсы, которые вы проходите сейчас"
                : "Пройденные курсы"}
            </h2>

            <div className="flex gap-2 mb-6">
              {(["progress", "completed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === t
                      ? "bg-[#0056D2] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t === "progress" ? "В процессе" : "Пройденные"}
                  {t === "progress" && inProgress.length > 0 && (
                    <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {inProgress.length}
                    </span>
                  )}
                  {t === "completed" && completed.length > 0 && (
                    <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {completed.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 overflow-hidden"
                    >
                      <div className="aspect-[16/9] bg-gray-100 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-3">
                  {activeTab === "progress"
                    ? "У вас пока нет активных курсов."
                    : "Вы ещё не завершили ни одного курса."}
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm text-[#0056D2] font-bold hover:underline"
                >
                  Найти курсы →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayList.map((enrollment) => (
                  <div key={enrollment.id} className="h-full">
                    <CourseCard
                      title={enrollment.course.title}
                      image={enrollment.course.image}
                      skills={
                        enrollment.course.skills
                          ? enrollment.course.skills.join(", ")
                          : ""
                      }
                      rating={enrollment.course.rating || 0}
                      students={`${enrollment.course.students || 0} учеников`}
                      buttonText={
                        activeTab === "progress"
                          ? "Продолжить изучение"
                          : "Открыть курс"
                      }
                      progress={enrollment.progress}
                      onButtonClick={() =>
                        navigate("/course", {
                          state: { course: enrollment.course },
                        })
                      }
                    />
                  </div>
                ))}
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
