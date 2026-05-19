import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProfileModal } from "../components/ProfileModal";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Github,
  ExternalLink,
  Send,
  Palette,
  Edit2,
} from "lucide-react";
import { api } from "../lib/api";

const downloadCertificate = (
  userName: string,
  courseName: string,
  date: string,
) => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Сертификат</title><style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.cert{width:900px;min-height:620px;border:2px solid #0056D2;border-radius:16px;padding:60px;position:relative;overflow:hidden}.cert::before{content:'';position:absolute;top:0;left:0;right:0;height:8px;background:#0056D2}.brand{font-size:28px;font-weight:900;color:#0056D2;margin-bottom:40px}.badge{display:inline-flex;background:#eff6ff;color:#0056D2;font-size:12px;font-weight:700;padding:6px 14px;border-radius:99px;border:1px solid #bfdbfe;margin-bottom:48px}.label{font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}.name{font-size:36px;font-weight:900;color:#0056D2;margin-bottom:32px}.subtitle{font-size:18px;color:#6b7280;margin-bottom:8px}.course{font-size:22px;font-weight:700;color:#111827;margin-bottom:48px}.footer{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #e5e7eb;padding-top:32px}.date{font-size:14px;color:#9ca3af}.sign{text-align:right}.sign-line{width:180px;border-top:2px solid #111827;margin-bottom:8px}.sign-name{font-size:14px;font-weight:700}.sign-role{font-size:12px;color:#9ca3af}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="cert"><div class="brand">Manageko</div><div class="badge">✓ Подтверждённый сертификат</div><div class="label">Настоящим удостоверяется, что</div><div class="name">${userName}</div><div class="subtitle">успешно прошёл(а) курс</div><div class="course">${courseName}</div><div class="footer"><div class="date">Дата выдачи: ${date}</div><div class="sign"><div class="sign-line"></div><div class="sign-name">Manageko Inc.</div><div class="sign-role">Образовательная платформа</div></div></div></div><script>setTimeout(()=>window.print(),500)</script></body></html>`,
  );
  win.document.close();
};

const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const COVER_COLORS = [
  "#0056D2",
  "#00205C",
  "#6d28d9",
  "#059669",
  "#dc2626",
  "#d97706",
  "#db2777",
  "#0891b2",
  "#374151",
  "#1d4ed8",
];

const roleLabel = (role: string) => {
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  return "Студент";
};
const roleBadgeClass = (role: string) => {
  if (role === "admin") return "bg-purple-50 text-purple-700 border-purple-200";
  if (role === "teacher") return "bg-green-50 text-green-700 border-green-200";
  return "bg-blue-50 text-[#0056D2] border-blue-200";
};

// Публичный профиль
const PublicProfile = ({ userId }: { userId: number }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/profile/${userId}`)
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  if (!profile) return null;

  const fullName =
    [profile.name, profile.surname].filter(Boolean).join(" ") || "Пользователь";
  const initials =
    (profile.name?.[0] || "") + (profile.surname?.[0] || "") || "?";
  const coverColor = profile.coverColor || "#0056D2";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-8">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6 bg-white">
          <div
            className="h-32 relative"
            style={{ backgroundColor: coverColor }}
          />
          <div className="px-6 pb-6 -mt-10">
            <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-[#00205C] text-white text-2xl font-black flex items-center justify-center shadow mb-3">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-black text-black">{fullName}</h1>
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mt-1 ${roleBadgeClass(profile.role)}`}
                >
                  {roleLabel(profile.role)}
                </span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    <Github size={16} /> {profile.github}
                  </a>
                )}
                {profile.vk && (
                  <a
                    href={`https://vk.com/${profile.vk.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0056D2] transition-colors"
                  >
                    <ExternalLink size={14} /> VK
                  </a>
                )}
                {profile.telegram && (
                  <a
                    href={`https://t.me/${profile.telegram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0056D2] transition-colors"
                  >
                    <Send size={14} /> Telegram
                  </a>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
        {profile.enrollments?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Award size={18} className="text-[#0056D2]" /> Пройденные курсы
            </h2>
            <div className="space-y-2">
              {profile.enrollments.map((e: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    {e.course.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-gray-200 py-6 bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 text-center text-gray-600 text-sm">
          © Manageko Inc., 2026 Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  if (id && Number(id) !== user?.id)
    return <PublicProfile userId={Number(id)} />;
  return <OwnProfile />;
};

const OwnProfile = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [coverColor, setCoverColor] = useState(user?.coverColor || "#0056D2");
  const [activityDays, setActivityDays] = useState<boolean[]>(
    Array(7).fill(false),
  );
  const [activityLoading, setActivityLoading] = useState(true);

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  useEffect(() => {
    api.post("/activity").catch(() => {});
    api
      .get("/activity")
      .then((res) => setActivityDays(res.data.activeDays))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, []);

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
  const ratedCourses = completed.filter((e) => e.rating);
  const avgRating =
    ratedCourses.length > 0
      ? (
          ratedCourses.reduce((s, e) => s + e.rating, 0) / ratedCourses.length
        ).toFixed(1)
      : "—";
  const activeDays = activityDays.filter(Boolean).length;
  const fullName =
    [user.name, user.surname].filter(Boolean).join(" ") || "Пользователь";
  const initials =
    (user.name?.[0] || "") + (user.surname?.[0] || "") ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  const handleColorChange = async (color: string) => {
    setCoverColor(color);
    setShowColorPicker(false);
    try {
      await api.put("/profile", { coverColor: color });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, coverColor: color }),
      );
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <ProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/dashboard" className="hover:text-[#0056D2]">
            Главная
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Профиль</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              {/* Баннер + аватар — правильная структура без перекрытия */}
              <div className="relative pb-0">
                <div
                  className="h-20 w-full"
                  style={{ backgroundColor: coverColor }}
                />
                {/* Кнопка выбора цвета */}
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all z-50"
                >
                  <Palette size={14} className="text-white" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-10 right-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 grid grid-cols-5 gap-1.5">
                    {COVER_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                          coverColor === c
                            ? "border-gray-800"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
                {/* Аватар выступает из баннера вниз — z-10 чтобы быть поверх */}
                <div className="absolute -bottom-8 left-6 z-10">
                  <div className="w-16 h-16 rounded-xl border-4 border-white overflow-hidden bg-[#00205C] text-white text-xl font-black flex items-center justify-center shadow">
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
                </div>
              </div>

              {/* Отступ сверху = высота половины аватара чтобы не перекрывать */}
              <div className="px-6 pb-6 pt-10">
                <div className="mb-3" />
                <h1 className="text-lg font-black text-black mb-0.5">
                  {fullName}
                </h1>
                <p className="text-xs text-gray-500 mb-1">{user.email}</p>
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-3 ${roleBadgeClass(user.role)}`}
                >
                  {roleLabel(user.role)}
                </span>
                {user.bio && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 border-t border-gray-100 pt-3">
                    {user.bio}
                  </p>
                )}
                {(user.github || user.vk || user.telegram) && (
                  <div className="flex flex-col gap-1.5 mb-3 border-t border-gray-100 pt-3">
                    {user.github && (
                      <a
                        href={`https://github.com/${user.github.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-black transition-colors"
                      >
                        <Github size={13} /> {user.github}
                      </a>
                    )}
                    {user.vk && (
                      <a
                        href={`https://vk.com/${user.vk.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#0056D2] transition-colors"
                      >
                        <ExternalLink size={12} /> VK: {user.vk}
                      </a>
                    )}
                    {user.telegram && (
                      <a
                        href={`https://t.me/${user.telegram.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#0056D2] transition-colors"
                      >
                        <Send size={12} /> {user.telegram}
                      </a>
                    )}
                  </div>
                )}
                <div className="space-y-2.5 text-left border-t border-gray-100 pt-3">
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
                    {
                      icon: Star,
                      label: "Средняя оценка курсов",
                      value: avgRating,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 text-gray-500">
                        <item.icon size={13} className="text-[#0056D2]" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <span className="font-bold text-black text-sm">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="mt-4 w-full text-sm font-bold text-[#0056D2] border border-[#0056D2] py-2.5 rounded-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Редактировать профиль
                </button>
              </div>
            </div>
          </aside>
          <div className="lg:col-span-9 space-y-6">
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
                        activityLoading
                          ? "bg-gray-100 animate-pulse"
                          : activityDays[idx]
                            ? idx === currentDayIndex
                              ? "bg-[#0056D2] text-white"
                              : "bg-blue-100 text-[#0056D2]"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {!activityLoading && activityDays[idx] && (
                        <CheckCircle2 size={14} />
                      )}
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
