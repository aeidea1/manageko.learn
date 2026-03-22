import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Shield,
  User,
  Search,
  BarChart2,
  Settings,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";

type AdminTab = "stats" | "users" | "courses";

export const AdminPage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const currentUser = userData ? JSON.parse(userData) : null;

  const [tab, setTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "users" && users.length === 0) loadUsers();
  }, [tab]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch {
      toast.error("Ошибка загрузки статистики");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("Нельзя изменить свою роль");
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success("Роль изменена");
    } catch {
      toast.error("Ошибка");
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.id === currentUser?.id) {
      toast.error("Нельзя удалить себя");
      return;
    }
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteModal(null);
      toast.success("Пользователь удалён");
    } catch {
      toast.error("Ошибка");
    }
  };

  const filteredUsers = users.filter((u) =>
    [u.name, u.surname, u.email]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchUser.toLowerCase()),
  );

  const TABS = [
    { id: "stats" as AdminTab, label: "Статистика", icon: BarChart2 },
    { id: "users" as AdminTab, label: "Пользователи", icon: Users },
    { id: "courses" as AdminTab, label: "Курсы", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Модалка удаления */}
      {deleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] p-6 relative">
            <button
              onClick={() => setDeleteModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-center mb-2">
              Удалить пользователя?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Аккаунт{" "}
              <strong className="text-black">{deleteModal.email}</strong> и все
              его данные будут удалены безвозвратно.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="py-3 border border-gray-300 rounded-sm text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteUser(deleteModal)}
                className="py-3 bg-red-500 text-white rounded-sm text-sm font-bold hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/dashboard" className="hover:text-[#0056D2]">
            Главная
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Администрирование</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* БОКОВАЯ НАВИГАЦИЯ */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0056D2] rounded-lg flex items-center justify-center">
                    <Settings size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Админ-панель</p>
                    <p className="text-xs text-gray-400">
                      Управление платформой
                    </p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors text-left ${
                      tab === t.id
                        ? "bg-[#0056D2] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <t.icon size={16} /> {t.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    to="/manager"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen size={16} /> Редактор курсов
                  </Link>
                </div>
              </nav>
            </div>
          </aside>

          {/* КОНТЕНТ */}
          <div className="flex-1 min-w-0">
            {/* СТАТИСТИКА */}
            {tab === "stats" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-black">
                  Обзор платформы
                </h1>

                {isLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  stats && (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            icon: Users,
                            label: "Пользователей",
                            value: stats.users,
                            color: "text-[#0056D2] bg-blue-50",
                          },
                          {
                            icon: BookOpen,
                            label: "Курсов",
                            value: stats.courses,
                            color: "text-purple-600 bg-purple-50",
                          },
                          {
                            icon: TrendingUp,
                            label: "Записей на курсы",
                            value: stats.enrollments,
                            color: "text-orange-500 bg-orange-50",
                          },
                          {
                            icon: CheckCircle2,
                            label: "Курсов пройдено",
                            value: stats.completedEnrollments,
                            color: "text-green-600 bg-green-50",
                          },
                        ].map((s, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
                            >
                              <s.icon size={20} />
                            </div>
                            <p className="text-3xl font-black text-black mb-1">
                              {s.value}
                            </p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <h3 className="font-bold text-sm mb-4">
                            Конверсия завершения
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Завершили курс</span>
                                <span className="font-bold text-black">
                                  {stats.enrollments > 0
                                    ? Math.round(
                                        (stats.completedEnrollments /
                                          stats.enrollments) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{
                                    width: `${stats.enrollments > 0 ? Math.round((stats.completedEnrollments / stats.enrollments) * 100) : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>В процессе</span>
                                <span className="font-bold text-black">
                                  {stats.enrollments > 0
                                    ? Math.round(
                                        ((stats.enrollments -
                                          stats.completedEnrollments) /
                                          stats.enrollments) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0056D2] rounded-full"
                                  style={{
                                    width: `${stats.enrollments > 0 ? Math.round(((stats.enrollments - stats.completedEnrollments) / stats.enrollments) * 100) : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <h3 className="font-bold text-sm mb-4">
                            Быстрые действия
                          </h3>
                          <div className="space-y-2">
                            <button
                              onClick={() => setTab("users")}
                              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-[#0056D2] py-2 border-b border-gray-50"
                            >
                              <span className="flex items-center gap-2">
                                <Users size={14} /> Управление пользователями
                              </span>
                              <ChevronRight size={14} />
                            </button>
                            <Link
                              to="/manager"
                              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-[#0056D2] py-2 border-b border-gray-50"
                            >
                              <span className="flex items-center gap-2">
                                <BookOpen size={14} /> Создать курс
                              </span>
                              <ChevronRight size={14} />
                            </Link>
                            <button
                              onClick={() => setTab("courses")}
                              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-[#0056D2] py-2"
                            >
                              <span className="flex items-center gap-2">
                                <BarChart2 size={14} /> Все курсы
                              </span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            )}

            {/* ПОЛЬЗОВАТЕЛИ */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-black text-black">
                    Пользователи
                  </h1>
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Поиск по имени или email..."
                      className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0056D2] w-64"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      Загрузка...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      Пользователи не найдены
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {/* Заголовок таблицы */}
                      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Пользователь</div>
                        <div className="col-span-2 text-center">Курсов</div>
                        <div className="col-span-3">Роль</div>
                        <div className="col-span-2 text-right">Действия</div>
                      </div>
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="col-span-5 flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#00205C] text-white flex items-center justify-center text-sm font-bold shrink-0">
                              {u.name?.[0]?.toUpperCase() ||
                                u.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">
                                {[u.name, u.surname]
                                  .filter(Boolean)
                                  .join(" ") || "—"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm font-bold text-gray-700">
                              {u._count?.enrollments || 0}
                            </span>
                          </div>
                          <div className="col-span-3">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value)
                              }
                              disabled={u.id === currentUser?.id}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-[#0056D2] border-blue-200"
                              } ${u.id === currentUser?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <option value="student">Студент</option>
                              <option value="admin">Администратор</option>
                            </select>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            {u.id !== currentUser?.id ? (
                              <button
                                onClick={() => setDeleteModal(u)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 italic">
                                Вы
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Всего: {filteredUsers.length} пользователей
                </p>
              </div>
            )}

            {/* КУРСЫ */}
            {tab === "courses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-black">
                    Управление курсами
                  </h1>
                  <Link
                    to="/manager"
                    className="flex items-center gap-2 bg-[#0056D2] text-white text-sm font-bold px-5 py-2.5 rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen size={15} /> Открыть редактор
                  </Link>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                  <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4 text-sm">
                    Для управления курсами используйте полноценный редактор
                  </p>
                  <Link
                    to="/manager"
                    className="inline-flex items-center gap-2 bg-[#0056D2] text-white text-sm font-bold px-6 py-3 rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    Перейти в менеджер курсов <ChevronRight size={15} />
                  </Link>
                </div>
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
