import { useNavigate } from "react-router-dom";

interface CategorySection {
  title: string;
  category: string; // Значение поля category в БД
  items: { label: string; search: string }[];
}

const categoryData: CategorySection[] = [
  {
    title: "Компьютерные науки",
    category: "Компьютерные науки",
    items: [
      { label: "Разработка на Python", search: "Python" },
      { label: "Веб-разработка (Fullstack)", search: "Fullstack" },
      { label: "Мобильная разработка", search: "Мобильная" },
      { label: "Кибербезопасность", search: "Кибербезопасность" },
      { label: "Облачные вычисления", search: "Облачные" },
    ],
  },
  {
    title: "Дизайн и Искусство",
    category: "Дизайн и Искусство",
    items: [
      { label: "Дизайнер UI/UX", search: "UI/UX" },
      { label: "Графический дизайн", search: "Графический" },
      { label: "Иллюстрация и рисунок", search: "Иллюстрация" },
      { label: "Анимация и 3D", search: "Анимация" },
      { label: "Брендинг", search: "Брендинг" },
    ],
  },
  {
    title: "Бизнес и Маркетинг",
    category: "Бизнес и Маркетинг",
    items: [
      { label: "Руководитель проекта", search: "Менеджмент" },
      { label: "Цифровой маркетинг", search: "Маркетинг" },
      { label: "Управление продуктом", search: "Продукт" },
      { label: "Финансовая грамотность", search: "Финансы" },
      { label: "SMM специалист", search: "SMM" },
    ],
  },
  {
    title: "Данные и ИИ",
    category: "Данные и ИИ",
    items: [
      { label: "Аналитик данных", search: "Аналитика" },
      { label: "Машинное обучение", search: "ML" },
      { label: "Data Science", search: "Data Science" },
      { label: "Работа с нейросетями", search: "ИИ" },
      { label: "Бизнес-аналитика", search: "Бизнес-аналитика" },
    ],
  },
];

interface ExploreMenuProps {
  onClose?: () => void;
}

export const ExploreMenu = ({ onClose }: ExploreMenuProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/dashboard?category=${encodeURIComponent(category)}`);
    onClose?.();
  };

  // Пункт подкатегории — ищем по category родителя + search слово
  const handleItemClick = (parentCategory: string, search: string) => {
    navigate(
      `/dashboard?category=${encodeURIComponent(parentCategory)}&search=${encodeURIComponent(search)}`,
    );
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
                onClick={() => handleItemClick(section.category, item.search)}
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
