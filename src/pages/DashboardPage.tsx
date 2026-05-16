import { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { CourseCard } from "../components/CourseCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const COURSES_PER_PAGE = 12;

// Иконки для категорий
const CATEGORY_ICONS: Record<string, string> = {
  "Компьютерные науки": "💻",
  "Дизайн и Искусство": "🎨",
  "Бизнес и Маркетинг": "📈",
  "Данные и ИИ": "🤖",
  "Разработка на Python": "🐍",
  "Веб-разработка (Fullstack)": "🌐",
  "Мобильная разработка": "📱",
  Кибербезопасность: "🔒",
  "Облачные вычисления": "☁️",
  "Дизайнер UI/UX": "✏️",
  "Графический дизайн": "🖼️",
  "Машинное обучение": "🧠",
  "Data Science": "📊",
  "Аналитик данных": "📉",
  "Цифровой маркетинг": "📣",
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // Активность — теперь с сервера
  const [activityDays, setActivityDays] = useState<boolean[]>(
    Array(7).fill(false),
  );
  const [activityLoading, setActivityLoading] = useState(true);

  // Популярные категории — с сервера
  const [popularCategories, setPopularCategories] = useState<
    { category: string; count: number; students: number }[]
  >([]);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // ── Синхронизация активности ──────────────────────────────────────────────
  useEffect(() => {
    const syncActivity = async () => {
      setActivityLoading(true);
      try {
        // Записываем сегодняшний визит
        await api.post("/activity");
        // Получаем данные за неделю
        const res = await api.get("/activity");
        setActivityDays(res.data.activeDays);
      } catch {
        // fallback: localStorage если сервер недоступен
        try {
          const key = `activity_u${user?.id || 0}_fallback`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length === 7) {
              setActivityDays(parsed);
            }
          }
        } catch {}
      } finally {
        setActivityLoading(false);
      }
    };
    syncActivity();
  }, []);

  // ── Популярные категории с сервера ────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/popular-categories");
        setPopularCategories(res.data);
      } catch {
        // fallback: статичный список
        setPopularCategories([
          { category: "Компьютерные науки", count: 0, students: 0 },
          { category: "Дизайн и Искусство", count: 0, students: 0 },
          { category: "Данные и ИИ", count: 0, students: 0 },
          { category: "Бизнес и Маркетинг", count: 0, students: 0 },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // ── Курсы с пагинацией ────────────────────────────────────────────────────
  const fetchCourses = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const params: any = { page, limit: COURSES_PER_PAGE };
        if (categoryParam) params.category = categoryParam;
        if (searchQuery) params.search = searchQuery;
        if (activeSkill) params.search = activeSkill;

        const response = await api.get("/courses", { params });

        // Поддержка старого API (массив) и нового (объект с пагинацией)
        if (Array.isArray(response.data)) {
          setCourses(response.data);
          setTotalPages(1);
          setTotalCourses(response.data.length);
        } else {
          setCourses(response.data.courses);
          setTotalPages(response.data.totalPages);
          setTotalCourses(response.data.total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, categoryParam, activeSkill],
  );

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryParam, activeSkill]);

  useEffect(() => {
    fetchCourses(currentPage);
  }, [fetchCourses, currentPage]);

  const activeDaysCount = activityDays.filter(Boolean).length;

  const getPageTitle = () => {
    if (activeSkill) return `Навык: ${activeSkill}`;
    if (categoryParam) return `Категория: ${categoryParam}`;
    if (searchQuery) return `Результаты поиска: «${searchQuery}»`;
    return "Наиболее популярные курсы";
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* ── САЙДБАР ───────────────────────────────────────────────────── */}
          <aside className="md:col-span-4 lg:col-span-3 flex flex-col gap-6 md:gap-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Добро пожаловать, {user?.name || "студент"}!
              </h1>
              <p className="text-sm text-black">
                Ваша цель — начать карьеру в сфере IT
              </p>
            </div>
            <hr className="border-gray-200 hidden md:block" />

            {/* Активность за неделю */}
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

            {/* Популярные категории — реальные данные */}
            <div>
              <h2 className="font-bold text-xl mb-4 text-black">
                Популярные категории
              </h2>
              <div className="flex flex-col gap-2">
                {popularCategories.length > 0
                  ? popularCategories.map((item) => (
                      <button
                        key={item.category}
                        onClick={() =>
                          navigate(
                            `/dashboard?category=${encodeURIComponent(item.category)}`,
                          )
                        }
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all border
                        ${
                          categoryParam === item.category
                            ? "bg-[#0056D2] text-white border-[#0056D2]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0056D2]"
                        }`}
                      >
                        <span className="text-base shrink-0">
                          {CATEGORY_ICONS[item.category] || "📚"}
                        </span>
                        <span className="flex-1 truncate">{item.category}</span>
                        {item.count > 0 && (
                          <span
                            className={`text-xs shrink-0 ${categoryParam === item.category ? "text-blue-200" : "text-gray-400"}`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    ))
                  : // skeleton loading
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-10 bg-gray-100 rounded-lg animate-pulse"
                        />
                      ))}
              </div>
              {(activeSkill || categoryParam || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveSkill(null);
                    navigate("/dashboard");
                  }}
                  className="mt-3 text-xs text-gray-500 hover:text-[#0056D2] underline"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </aside>

          {/* ── КУРСЫ ─────────────────────────────────────────────────────── */}
          <section className="md:col-span-8 lg:col-span-9">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
              {!isLoading && totalCourses > 0 && (
                <span className="text-sm text-gray-400">
                  {totalCourses}{" "}
                  {totalCourses === 1
                    ? "курс"
                    : totalCourses < 5
                      ? "курса"
                      : "курсов"}
                </span>
              )}
            </div>

            {categoryParam && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-[#0056D2] text-xs font-bold rounded-full border border-blue-200">
                  {categoryParam}
                </span>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  × сбросить
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
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
            ) : courses.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-3">
                  По вашему запросу курсов не найдено.
                </p>
                <button
                  onClick={() => {
                    setActiveSkill(null);
                    navigate("/dashboard");
                  }}
                  className="text-sm text-[#0056D2] font-bold hover:underline"
                >
                  Показать все курсы
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      image={course.image}
                      skills={course.skills ? course.skills.join(", ") : ""}
                      rating={course.rating || 0}
                      students={`${course.students || 0} учеников`}
                      category={course.category}
                      onButtonClick={() =>
                        navigate("/course", { state: { course } })
                      }
                    />
                  ))}
                </div>

                {/* ── Пагинация ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#0056D2] hover:text-[#0056D2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - currentPage) <= 1,
                      )
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                          acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span
                            key={`dots-${idx}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item as number)}
                            className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors
                              ${
                                currentPage === item
                                  ? "bg-[#0056D2] text-white border-[#0056D2]"
                                  : "border-gray-200 text-gray-700 hover:border-[#0056D2] hover:text-[#0056D2]"
                              }`}
                          >
                            {item}
                          </button>
                        ),
                      )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#0056D2] hover:text-[#0056D2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
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
