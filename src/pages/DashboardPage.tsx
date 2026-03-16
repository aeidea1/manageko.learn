import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { CourseCard } from "../components/CourseCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const SKILL_TAGS = [
  "Python",
  "Kotlin",
  "React",
  "Vue",
  "Lua",
  "Figma",
  "UI/UX",
];

// Надёжный ключ: год + номер недели ISO
const getActivityKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
  );
  return `activity_${d.getFullYear()}_W${week}`;
};

// Инициализируем активность с сегодняшним днём
const initActivity = (currentDayIndex: number): boolean[] => {
  try {
    const saved = localStorage.getItem(getActivityKey());
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    }
  } catch {}
  const arr = Array(7).fill(false);
  arr[currentDayIndex] = true;
  return arr;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const [activityDays, setActivityDays] = useState<boolean[]>(() =>
    initActivity(currentDayIndex),
  );

  useEffect(() => {
    const current = initActivity(currentDayIndex);
    if (!current[currentDayIndex]) {
      const updated = [...current];
      updated[currentDayIndex] = true;
      setActivityDays(updated);
      localStorage.setItem(getActivityKey(), JSON.stringify(updated));
    } else {
      setActivityDays(current);
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (categoryParam) params.category = categoryParam;
        if (searchQuery) params.search = searchQuery;
        const response = await api.get("/courses", { params });
        setCourses(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [searchQuery, categoryParam]);

  // Локальный фильтр по тегу навыка
  const filteredCourses = activeSkill
    ? courses.filter((c) => c.skills && c.skills.includes(activeSkill))
    : courses;

  const activeDaysCount = activityDays.filter(Boolean).length;

  const getPageTitle = () => {
    if (categoryParam) return `Категория: ${categoryParam}`;
    if (searchQuery) return `Результаты поиска: «${searchQuery}»`;
    return "Наиболее популярные курсы";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* САЙДБАР */}
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
                      ${isToday ? "bg-[#0056D2] text-white border-[#0056D2] shadow" : isActive ? "bg-blue-100 text-[#0056D2] border-blue-200 font-bold" : "border-gray-300 text-gray-400"}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                Активных дней:{" "}
                <span className="font-bold text-black">{activeDaysCount}</span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-4 text-black">
                Популярные теги
              </h2>
              <div className="flex flex-wrap gap-2">
                {SKILL_TAGS.map((tag) => (
                  <span
                    key={tag}
                    onClick={() =>
                      setActiveSkill(activeSkill === tag ? null : tag)
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors ${activeSkill === tag ? "bg-[#0056D2] text-white" : "bg-[#555d6b] text-white hover:bg-gray-700"}`}
                  >
                    {tag}
                  </span>
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

          {/* КУРСЫ */}
          <section className="md:col-span-8 lg:col-span-9">
            <h2 className="text-2xl font-bold mb-4">{getPageTitle()}</h2>

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
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin" />
                Загрузка курсов...
              </div>
            ) : filteredCourses.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
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
