import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProfileModal } from "../components/ProfileModal";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  Download,
} from "lucide-react";
import { api } from "../lib/api";

// Простой генератор сертификата через print
const downloadCertificate = (
  userName: string,
  courseName: string,
  date: string,
) => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Сертификат — ${courseName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .cert { width: 900px; min-height: 620px; border: 2px solid #0056D2; border-radius: 16px; padding: 60px; position: relative; overflow: hidden; }
        .cert::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: #0056D2; }
        .cert::after { content: 'M'; position: absolute; right: -20px; bottom: -40px; font-size: 300px; font-weight: 900; color: rgba(0,86,210,0.04); line-height: 1; }
        .brand { font-size: 28px; font-weight: 900; color: #0056D2; letter-spacing: -1px; margin-bottom: 40px; }
        .label { font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .title { font-size: 48px; font-weight: 900; color: #111827; line-height: 1.1; margin-bottom: 32px; }
        .subtitle { font-size: 18px; color: #6b7280; margin-bottom: 8px; }
        .name { font-size: 36px; font-weight: 900; color: #0056D2; margin-bottom: 32px; }
        .course-label { font-size: 13px; color: #9ca3af; margin-bottom: 8px; }
        .course { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 48px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 32px; }
        .date { font-size: 14px; color: #9ca3af; }
        .sign { text-align: right; }
        .sign-line { width: 180px; border-top: 2px solid #111827; margin-bottom: 8px; }
        .sign-name { font-size: 14px; font-weight: 700; }
        .sign-role { font-size: 12px; color: #9ca3af; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #0056D2; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 99px; border: 1px solid #bfdbfe; margin-bottom: 48px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="cert">
        <div class="brand">Manageko</div>
        <div class="badge">✓ Подтверждённый сертификат</div>
        <div class="label">Настоящим удостоверяется, что</div>
        <div class="name">${userName}</div>
        <div class="subtitle">успешно прошёл(а) курс</div>
        <div class="course">${courseName}</div>
        <div class="footer">
          <div class="date">Дата выдачи: ${date}</div>
          <div class="sign">
            <div class="sign-line"></div>
            <div class="sign-name">Manageko Inc.</div>
            <div class="sign-role">Образовательная платформа</div>
          </div>
        </div>
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `);
  win.document.close();
};

const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const getActivityKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
  );
  return `activity_${d.getFullYear()}_W${week}`;
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const activityDays: boolean[] = (() => {
    try {
      const saved = localStorage.getItem(getActivityKey());
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length === 7) return p;
      }
    } catch {}
    const arr = Array(7).fill(false);
    arr[currentDayIndex] = true;
    return arr;
  })();

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    api
      .get(`/my-courses/${user.id}`)
      .then((res) => setEnrollments(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const completed = enrollments.filter((e) => e.status === "completed");
  const inProgress = enrollments.filter((e) => e.status === "in_progress");
  const totalProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length,
        )
      : 0;
  const avgRating =
    completed.filter((e) => e.rating).length > 0
      ? (
          completed.filter((e) => e.rating).reduce((s, e) => s + e.rating, 0) /
          completed.filter((e) => e.rating).length
        ).toFixed(1)
      : "—";
  const activeDays = activityDays.filter(Boolean).length;
  const fullName =
    [user.name, user.surname].filter(Boolean).join(" ") || "Пользователь";
  const initials =
    (user.name?.[0] || "") + (user.surname?.[0] || "") ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <ProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/dashboard" className="hover:text-[#0056D2]">
            Главная
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Профиль</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ЛЕВАЯ КОЛОНКА — профиль */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center sticky top-24">
              {/* Аватар */}
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gray-100 flex items-center justify-center bg-[#00205C] text-white text-2xl font-black">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <h1 className="text-xl font-black text-black mb-1">{fullName}</h1>
              <p className="text-sm text-gray-500 mb-1">{user.email}</p>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-5 ${user.role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-blue-50 text-[#0056D2] border border-blue-200"}`}
              >
                {user.role === "admin" ? "Администратор" : "Студент"}
              </span>

              {/* Быстрая статистика */}
              <div className="space-y-3 text-left border-t border-gray-100 pt-5">
                {[
                  {
                    icon: BookOpen,
                    label: "Всего курсов",
                    value: enrollments.length,
                  },
                  {
                    icon: CheckCircle2,
                    label: "Завершено",
                    value: completed.length,
                  },
                  {
                    icon: Clock,
                    label: "В процессе",
                    value: inProgress.length,
                  },
                  { icon: Star, label: "Средняя оценка", value: avgRating },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 text-gray-500">
                      <item.icon size={14} className="text-[#0056D2]" />
                      {item.label}
                    </div>
                    <span className="font-bold text-black">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="mt-5 w-full text-sm font-bold text-[#0056D2] border border-[#0056D2] py-2.5 rounded-sm hover:bg-blue-50 transition-colors"
              >
                Редактировать профиль
              </button>
            </div>
          </aside>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-9 space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  icon: BookOpen,
                  value: enrollments.length,
                  label: "Курсов записано",
                  color: "text-[#0056D2] bg-blue-50",
                },
                {
                  icon: CheckCircle2,
                  value: completed.length,
                  label: "Курсов пройдено",
                  color: "text-green-600 bg-green-50",
                },
                {
                  icon: TrendingUp,
                  value: `${totalProgress}%`,
                  label: "Средний прогресс",
                  color: "text-purple-600 bg-purple-50",
                },
                {
                  icon: Calendar,
                  value: activeDays,
                  label: "Активных дней",
                  color: "text-orange-500 bg-orange-50",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5"
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${s.color}`}
                  >
                    <s.icon size={16} />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-black mb-0.5">
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Активность за неделю */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-base mb-4">Активность за неделю</h2>
              <div className="flex gap-2">
                {DAYS.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activityDays[idx]
                          ? idx === currentDayIndex
                            ? "bg-[#0056D2] text-white"
                            : "bg-blue-100 text-[#0056D2]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {activityDays[idx] && <CheckCircle2 size={14} />}
                    </div>
                    <span className="text-xs text-gray-500 uppercase">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Активных дней на этой неделе:{" "}
                <strong className="text-black">{activeDays}</strong>
              </p>
            </div>

            {/* Сертификаты */}
            {completed.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Award size={18} className="text-[#0056D2]" /> Мои сертификаты
                </h2>
                <div className="space-y-3">
                  {completed.map((e) => {
                    const date = new Date(e.createdAt).toLocaleDateString(
                      "ru-RU",
                      { day: "numeric", month: "long", year: "numeric" },
                    );
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#0056D2]/30 hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0056D2] to-[#00205C] rounded-lg flex items-center justify-center shrink-0">
                          <Award size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">
                            {e.course.title}
                          </p>
                          <p className="text-xs text-gray-400">{date}</p>
                          {e.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  className={
                                    s <= e.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            downloadCertificate(fullName, e.course.title, date)
                          }
                          className="flex items-center gap-1.5 text-xs font-bold text-[#0056D2] bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Download size={13} />{" "}
                          <span className="hidden sm:inline">Скачать</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Текущие курсы */}
            {inProgress.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-[#0056D2]" /> Продолжить
                  обучение
                </h2>
                <div className="space-y-3">
                  {inProgress.map((e) => (
                    <div
                      key={e.id}
                      onClick={() =>
                        navigate("/course", { state: { course: e.course } })
                      }
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#0056D2]/30 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#0056D2] to-[#00205C] flex items-center justify-center shrink-0">
                        {e.course.image ? (
                          <img
                            src={e.course.image}
                            alt={e.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white/20 text-xl font-black">
                            M
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate mb-1">
                          {e.course.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0056D2] rounded-full"
                              style={{ width: `${e.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#0056D2] shrink-0">
                            {e.progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-400 group-hover:text-[#0056D2] shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Пусто */}
            {!isLoading && enrollments.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Вы ещё не записались ни на один курс
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#0056D2] text-white text-sm font-bold px-6 py-3 rounded-sm hover:bg-blue-700 transition-colors"
                >
                  Найти курс <ChevronRight size={15} />
                </Link>
              </div>
            )}
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
