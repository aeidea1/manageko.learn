import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  ChevronRight,
  CheckCircle2,
  Star,
  Globe,
  BarChart2,
  Shield,
} from "lucide-react";

const STATS = [
  { value: "500+", label: "Курсов по всем направлениям" },
  { value: "10 000+", label: "Студентов по всему миру" },
  { value: "95%", label: "Студентов довольны обучением" },
  { value: "4.8", label: "Средняя оценка курсов" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Структурированные курсы",
    desc: "Лекции, тесты и практические задания в одном месте. Учись в своём темпе.",
  },
  {
    icon: Award,
    title: "Сертификаты о прохождении",
    desc: "Получай сертификаты после завершения курса и добавляй их в резюме.",
  },
  {
    icon: BarChart2,
    title: "Отслеживание прогресса",
    desc: "Видь свой прогресс по каждому курсу и следи за активностью обучения.",
  },
  {
    icon: Globe,
    title: "Любое устройство",
    desc: "Полная адаптация под мобильные, планшеты и компьютеры.",
  },
  {
    icon: Users,
    title: "Сообщество",
    desc: "Задавай вопросы преподавателям и обсуждай материал с другими студентами.",
  },
  {
    icon: Shield,
    title: "Бесплатный доступ",
    desc: "Все курсы платформы доступны бесплатно. Никаких скрытых платежей.",
  },
];

const CATEGORIES = [
  {
    label: "Компьютерные науки",
    count: "120+ курсов",
    color: "bg-blue-50 text-[#0056D2] border-blue-100",
  },
  {
    label: "Данные и ИИ",
    count: "80+ курсов",
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    label: "Дизайн и Искусство",
    count: "60+ курсов",
    color: "bg-pink-50 text-pink-700 border-pink-100",
  },
  {
    label: "Бизнес и Маркетинг",
    count: "70+ курсов",
    color: "bg-green-50 text-green-700 border-green-100",
  },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter text-[#0056D2]">
            Manageko
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#features"
              className="hover:text-[#0056D2] transition-colors"
            >
              Возможности
            </a>
            <a
              href="#categories"
              className="hover:text-[#0056D2] transition-colors"
            >
              Каталог
            </a>
            <a href="#stats" className="hover:text-[#0056D2] transition-colors">
              О платформе
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-gray-700 hover:text-[#0056D2] transition-colors px-4 py-2"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold bg-[#0056D2] text-white px-5 py-2.5 rounded-sm hover:bg-blue-700 transition-colors"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-white">
          {/* Тонкий градиентный акцент сверху — как у Coursera */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,86,210,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-28 text-center relative">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0056D2] text-xs font-bold px-4 py-1.5 rounded-full border border-blue-100 mb-6">
              <Star size={12} className="fill-[#0056D2]" /> Бесплатная
              образовательная платформа
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
              Учись новому.
              <br />
              <span className="text-[#0056D2]">Расти профессионально.</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Тысячи курсов по программированию, дизайну, бизнесу и
              искусственному интеллекту. Начни обучение прямо сейчас —
              бесплатно.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0056D2] text-white text-sm font-bold px-8 py-4 rounded-sm hover:bg-blue-700 transition-colors"
              >
                Начать бесплатно <ChevronRight size={16} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-bold px-8 py-4 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Уже есть аккаунт? Войти
              </Link>
            </div>

            {/* Социальное доказательство */}
            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
              <div className="flex -space-x-2">
                {["#0056D2", "#1a7340", "#9333ea", "#dc2626"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: c }}
                  >
                    {["А", "И", "М", "Д"][i]}
                  </div>
                ))}
              </div>
              <span>
                Уже <strong className="text-gray-600">10 000+</strong> студентов
                обучаются на платформе
              </span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section id="stats" className="border-y border-gray-100 bg-gray-50/50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-[#0056D2] mb-1">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-black mb-3">
                Популярные направления
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Выбери направление и начни обучение по структурированным курсам
                от экспертов
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={i}
                  to="/register"
                  className={`flex flex-col gap-3 p-6 rounded-xl border ${cat.color} hover:shadow-md transition-all group`}
                >
                  <p className="font-bold text-base">{cat.label}</p>
                  <p className="text-xs opacity-70">{cat.count}</p>
                  <div className="flex items-center gap-1 text-xs font-bold mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    Смотреть курсы <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-[#0056D2] text-sm font-bold hover:underline"
              >
                Все направления <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="py-20 bg-gray-50/50 border-t border-gray-100"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-black mb-3">
                Всё что нужно для обучения
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Платформа создана чтобы обучение было удобным, структурированным
                и результативным
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#0056D2]/30 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <f.icon size={20} className="text-[#0056D2]" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 border-t border-gray-100">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-black mb-3">
                Как это работает
              </h2>
              <p className="text-gray-500 text-sm">
                Три простых шага до новых знаний
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                {
                  n: "01",
                  title: "Зарегистрируйся",
                  desc: "Создай бесплатный аккаунт за 30 секунд",
                },
                {
                  n: "02",
                  title: "Выбери курс",
                  desc: "Найди курс по интересующему направлению",
                },
                {
                  n: "03",
                  title: "Учись и получай сертификат",
                  desc: "Проходи уроки, сдавай тесты и получай сертификат",
                },
              ].map((step, i) => (
                <div key={i} className="text-center relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gray-200" />
                  )}
                  <div className="w-12 h-12 bg-[#0056D2] text-white font-black text-sm rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    {step.n}
                  </div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#00205C]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Готов начать обучение?
            </h2>
            <p className="text-blue-200 text-sm mb-8 max-w-md mx-auto">
              Присоединяйся к тысячам студентов которые уже развивают свои
              навыки на Manageko
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#0056D2] text-sm font-bold px-8 py-4 rounded-sm hover:bg-blue-50 transition-colors"
              >
                Начать бесплатно <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {[
                "Бесплатно навсегда",
                "Без кредитной карты",
                "Доступ ко всем курсам",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-blue-200 text-xs"
                >
                  <CheckCircle2 size={14} className="text-blue-300" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xl font-black tracking-tighter text-[#0056D2]">
              Manageko
            </span>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/login" className="hover:text-[#0056D2]">
                Войти
              </Link>
              <Link to="/register" className="hover:text-[#0056D2]">
                Регистрация
              </Link>
              <a href="#features" className="hover:text-[#0056D2]">
                Возможности
              </a>
            </div>
            <p className="text-xs text-gray-400">
              © Manageko Inc., 2026. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
