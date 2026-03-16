import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ExploreMenu } from "./ExploreMenu";
import { ProfileModal } from "./ProfileModal";
import { api } from "../lib/api";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  courseId?: number;
  createdAt: string;
}

const notifIcon = (type: string) => {
  if (type === "course_start")
    return <BookOpen size={16} className="text-[#0056D2] shrink-0" />;
  if (type === "course_complete")
    return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
  if (type === "document")
    return <FileText size={16} className="text-orange-500 shrink-0" />;
  return <Bell size={16} className="text-gray-400 shrink-0" />;
};

const timeAgo = (dateStr: string) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
};

export const Header = () => {
  const navigate = useNavigate();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const exploreRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user?.role === "admin";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Загружаем уведомления
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    // Опрос каждые 30 секунд
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Закрытие по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node))
        setIsExploreOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenNotifications = async () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsExploreOpen(false);
    if (!isNotificationsOpen && unreadCount > 0) {
      try {
        await api.put(`/notifications/${user.id}/read-all`);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {}
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchValue.trim()
        ? `/dashboard?search=${encodeURIComponent(searchValue)}`
        : "/dashboard",
    );
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-black p-1"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              to="/"
              className="hidden md:block text-xl font-black tracking-tighter text-[#0056D2]"
            >
              Manageko
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium h-16">
              <div
                ref={exploreRef}
                className="relative h-full flex items-center"
              >
                <button
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                  className={`flex items-center gap-1 transition-colors ${isExploreOpen ? "text-[#0056D2]" : "hover:text-[#0056D2]"}`}
                >
                  Изучить{" "}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isExploreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isExploreOpen && (
                  <ExploreMenu onClose={() => setIsExploreOpen(false)} />
                )}
              </div>
              <NavLink
                to="/my-learning"
                className={({ isActive }) =>
                  isActive ? "text-[#0056D2]" : "hover:text-[#0056D2]"
                }
              >
                Моё обучение
              </NavLink>
            </nav>
          </div>

          <div className="flex-1 max-w-[600px] hidden md:block">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Чему вы хотите научиться?"
                className="w-full h-10 pl-4 pr-12 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#0056D2] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-[2px] top-[2px] bottom-[2px] px-3 bg-[#0056D2] rounded-sm text-white hover:bg-blue-700"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {isAdmin && (
              <NavLink
                to="/manager"
                title="Менеджер курсов"
                className={({ isActive }) =>
                  `flex items-center justify-center w-9 h-9 transition-colors ${isActive ? "text-[#0056D2]" : "text-gray-600 hover:text-[#0056D2]"}`
                }
              >
                <LayoutDashboard size={20} />
              </NavLink>
            )}

            {/* УВЕДОМЛЕНИЯ */}
            <div ref={notifRef} className="relative flex items-center h-9">
              <button
                onClick={handleOpenNotifications}
                className={`relative flex items-center justify-center h-full w-9 transition-colors ${isNotificationsOpen ? "text-[#0056D2]" : "text-gray-600 hover:text-[#0056D2]"}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="fixed md:absolute top-[72px] md:top-full md:mt-2 right-4 md:-right-2 w-[calc(100vw-32px)] md:w-[340px] bg-white border border-gray-200 shadow-2xl rounded-lg z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-black">
                      Уведомления
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true })),
                          )
                        }
                        className="text-[11px] text-[#0056D2] hover:underline"
                      >
                        Прочитать все
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell
                          size={32}
                          className="text-gray-200 mx-auto mb-2"
                        />
                        <p className="text-sm font-bold text-gray-500">
                          Пока нет уведомлений
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Мы сообщим вам об обновлениях курсов
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-default transition-colors ${!n.isRead ? "bg-blue-50/40" : ""}`}
                        >
                          <div className="mt-0.5">{notifIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-black">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-[#0056D2] rounded-full mt-1 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-9 h-9 rounded-full bg-[#00205C] text-white flex items-center justify-center text-sm font-bold border-2 border-transparent hover:border-[#0056D2] ml-1 uppercase overflow-hidden shrink-0 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : user?.name ? (
                user.name[0]
              ) : (
                "A"
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Чему вы хотите научиться?"
                className="w-full h-10 pl-4 pr-12 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#0056D2]"
              />
              <button
                type="submit"
                className="absolute right-[2px] top-[2px] bottom-[2px] px-3 bg-[#0056D2] rounded-sm text-white"
              >
                <Search size={18} />
              </button>
            </form>
            <NavLink
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium py-2 border-b border-gray-100"
            >
              Главная
            </NavLink>
            <NavLink
              to="/my-learning"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium py-2 border-b border-gray-100"
            >
              Моё обучение
            </NavLink>

            {/* Изучить — каталог на мобиле */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Изучить
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Компьютерные науки", cat: "Компьютерные науки" },
                  { label: "Дизайн и Искусство", cat: "Дизайн и Искусство" },
                  { label: "Бизнес и Маркетинг", cat: "Бизнес и Маркетинг" },
                  { label: "Данные и ИИ", cat: "Данные и ИИ" },
                ].map((item) => (
                  <button
                    key={item.cat}
                    onClick={() => {
                      navigate(
                        `/dashboard?category=${encodeURIComponent(item.cat)}`,
                      );
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-sm text-gray-600 hover:text-[#0056D2] py-1.5 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
