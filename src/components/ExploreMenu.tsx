import { useNavigate } from "react-router-dom";

// ─── БАГ #1 (исправлен): ────────────────────────────────────────────────────
// Раньше при клике на подкатегорию (например "Дизайнер UI/UX") в URL уходило:
//   ?category=Дизайн и Искусство&search=UI/UX
// Сервер искал курсы, у которых category СОДЕРЖИТ "Дизайн" И title/skills содержит "UI/UX".
// Если курс создан с category="Дизайнер UI/UX" — он НЕ находился, т.к. "Дизайнер UI/UX"
// не содержит "Дизайн" (с заглавной "Д" — совпадало, но при insensitive ок).
// Реальная проблема: значение search не совпадало с реальным полем category в БД.
//
// ИСПРАВЛЕНИЕ: search теперь содержит точное значение category из БД (value),
// а не произвольное ключевое слово. Это гарантирует точное совпадение.
// ─────────────────────────────────────────────────────────────────────────────

interface CategorySection {
  title: string;
  category: string;
  // value — точное значение поля category в БД для подкатегории
  items: { label: string; value: string }[];
}

const categoryData: CategorySection[] = [
  {
    title: "Компьютерные науки",
    category: "Компьютерные науки",
    items: [
      { label: "Разработка на Python", value: "Разработка на Python" },
      {
        label: "Веб-разработка (Fullstack)",
        value: "Веб-разработка (Fullstack)",
      },
      { label: "Мобильная разработка", value: "Мобильная разработка" },
      { label: "Кибербезопасность", value: "Кибербезопасность" },
      { label: "Облачные вычисления", value: "Облачные вычисления" },
    ],
  },
  {
    title: "Дизайн и Искусство",
    category: "Дизайн и Искусство",
    items: [
      { label: "Дизайнер UI/UX", value: "Дизайнер UI/UX" },
      { label: "Графический дизайн", value: "Графический дизайн" },
      { label: "Иллюстрация и рисунок", value: "Иллюстрация и рисунок" },
      { label: "Анимация и 3D", value: "Анимация и 3D" },
      { label: "Брендинг", value: "Брендинг" },
    ],
  },
  {
    title: "Бизнес и Маркетинг",
    category: "Бизнес и Маркетинг",
    items: [
      { label: "Руководитель проекта", value: "Руководитель проекта" },
      { label: "Цифровой маркетинг", value: "Цифровой маркетинг" },
      { label: "Управление продуктом", value: "Управление продуктом" },
      { label: "Финансовая грамотность", value: "Финансовая грамотность" },
      { label: "SMM специалист", value: "SMM специалист" },
    ],
  },
  {
    title: "Данные и ИИ",
    category: "Данные и ИИ",
    items: [
      { label: "Аналитик данных", value: "Аналитик данных" },
      { label: "Машинное обучение", value: "Машинное обучение" },
      { label: "Data Science", value: "Data Science" },
      { label: "Работа с нейросетями", value: "Работа с нейросетями" },
      { label: "Бизнес-аналитика", value: "Бизнес-аналитика" },
    ],
  },
];

interface ExploreMenuProps {
  onClose?: () => void;
}

export const ExploreMenu = ({ onClose }: ExploreMenuProps) => {
  const navigate = useNavigate();

  // Клик по заголовку раздела — фильтр по родительской категории
  const handleCategoryClick = (category: string) => {
    navigate(`/dashboard?category=${encodeURIComponent(category)}`);
    onClose?.();
  };

  // Клик по подкатегории — фильтр по точному значению category из БД
  // БАГ ИСПРАВЛЕН: передаём value напрямую как category, без search
  const handleItemClick = (value: string) => {
    navigate(`/dashboard?category=${encodeURIComponent(value)}`);
    onClose?.();
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-lg p-6 w-[300px] md:w-[800px] z-[100] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in zoom-in-95 duration-200">
      {categoryData.map((section, idx) => (
        <div key={idx}>
          <h3
            onClick={() => handleCategoryClick(section.category)}
            className="text-[14px] font-bold text-black border-b border-gray-100 pb-2 mb-3 uppercase tracking-wider cursor-pointer hover:text-[#0056D2] transition-colors"
          >
            {section.title}
          </h3>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li
                key={i}
                onClick={() => handleItemClick(item.value)}
                className="text-[13px] text-gray-600 hover:text-[#0056D2] hover:translate-x-1 cursor-pointer transition-all duration-200 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-[#0056D2] transition-colors shrink-0" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="hidden md:block text-[12px] text-gray-400 italic">
          Более 500+ курсов по всем направлениям
        </p>
        <button
          onClick={() => {
            navigate("/dashboard");
            onClose?.();
          }}
          className="text-[13px] text-[#0056D2] hover:text-blue-800 font-bold underline transition-colors"
        >
          Посмотреть весь каталог
        </button>
      </div>
    </div>
  );
};
