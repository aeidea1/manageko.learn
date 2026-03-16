import { useState, useRef, useEffect } from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GROUPS = [
  "Компьютерные науки",
  "Дизайн и Искусство",
  "Бизнес и Маркетинг",
  "Данные и ИИ",
];

const CATEGORIES: { group: string; value: string }[] = [
  { group: "Компьютерные науки", value: "Компьютерные науки" },
  { group: "Компьютерные науки", value: "Разработка на Python" },
  { group: "Компьютерные науки", value: "Веб-разработка (Fullstack)" },
  { group: "Компьютерные науки", value: "Мобильная разработка" },
  { group: "Компьютерные науки", value: "Кибербезопасность" },
  { group: "Компьютерные науки", value: "Облачные вычисления" },
  { group: "Дизайн и Искусство", value: "Дизайн и Искусство" },
  { group: "Дизайн и Искусство", value: "Дизайнер UI/UX" },
  { group: "Дизайн и Искусство", value: "Графический дизайн" },
  { group: "Дизайн и Искусство", value: "Иллюстрация и рисунок" },
  { group: "Дизайн и Искусство", value: "Анимация и 3D" },
  { group: "Дизайн и Искусство", value: "Брендинг" },
  { group: "Бизнес и Маркетинг", value: "Бизнес и Маркетинг" },
  { group: "Бизнес и Маркетинг", value: "Руководитель проекта" },
  { group: "Бизнес и Маркетинг", value: "Цифровой маркетинг" },
  { group: "Бизнес и Маркетинг", value: "Управление продуктом" },
  { group: "Бизнес и Маркетинг", value: "Финансовая грамотность" },
  { group: "Бизнес и Маркетинг", value: "SMM специалист" },
  { group: "Данные и ИИ", value: "Данные и ИИ" },
  { group: "Данные и ИИ", value: "Аналитик данных" },
  { group: "Данные и ИИ", value: "Машинное обучение" },
  { group: "Данные и ИИ", value: "Data Science" },
  { group: "Данные и ИИ", value: "Работа с нейросетями" },
  { group: "Данные и ИИ", value: "Бизнес-аналитика" },
];

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
  editCourse?: any;
}

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCourseCreated,
  editCourse,
}: CreateCourseModalProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editCourse;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [category, setCategory] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Заполняем данные когда открывается модалка редактирования
  useEffect(() => {
    if (isOpen) {
      setTitle(editCourse?.title || "");
      setDescription(editCourse?.description || "");
      setSkills(editCourse?.skills || []);
      setCategory(editCourse?.category || "");
      setImageBase64(editCourse?.image || null);
      setCurrentSkill("");
    }
  }, [isOpen, editCourse]);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageBase64(event.target?.result as string);
        toast.success("Обложка загружена!");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title) return toast.error("Введите название курса!");
    setIsLoading(true);
    try {
      if (isEdit) {
        await api.put(`/courses/${editCourse.id}`, {
          title,
          description,
          skills,
          category,
          image: imageBase64,
        });
        toast.success("Курс обновлён!");
        if (onCourseCreated) onCourseCreated();
        onClose();
      } else {
        const response = await api.post("/courses", {
          title,
          description,
          skills,
          category,
          image: imageBase64,
        });
        toast.success("Курс создан!");
        if (onCourseCreated) onCourseCreated();
        onClose();
        navigate("/editor", { state: { course: response.data } });
      }
    } catch {
      toast.error(
        isEdit ? "Ошибка при обновлении курса" : "Ошибка при создании курса",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white w-full max-w-[800px] rounded-lg shadow-2xl relative p-6 sm:p-8 max-h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-1">
          {isEdit ? "Редактировать курс" : "Создать новый курс"}
        </h2>
        <p className="text-xs text-gray-500 mb-8 max-w-md">
          {isEdit
            ? "Обновите данные курса."
            : "Создайте основу курса, после чего вы сможете добавить лекции и тесты."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold mb-2 text-black">
                Фон карточки курса
              </p>
              <div
                className="w-full aspect-[2/1] bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 overflow-hidden transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageBase64 ? (
                  <img
                    src={imageBase64}
                    className="w-full h-full object-cover"
                    alt="Cover"
                  />
                ) : (
                  <>
                    <ImageIcon size={32} className="mb-2 text-gray-400" />
                    <span className="text-xs font-medium px-4 text-center text-gray-500">
                      Нажмите, чтобы загрузить обложку
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imageBase64 && (
                <button
                  onClick={() => setImageBase64(null)}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Удалить обложку
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-bold mb-2 text-black">
                Категория курса
              </p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-sm px-3 py-3 text-sm outline-none focus:border-[#0056D2] bg-white text-gray-700"
              >
                <option value="">— Выберите категорию —</option>
                {GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {CATEGORIES.filter((c) => c.group === group).map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.value}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold mb-2 text-black">
                Название курса
              </p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: UX/UI Дизайнер"
              />
            </div>
            <div>
              <p className="text-xs font-bold mb-2 text-black">
                Получаемые навыки
              </p>
              <div className="relative">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill(e)}
                  className="pr-10"
                  placeholder="Введите навык и нажмите +"
                />
                <button
                  onClick={handleAddSkill}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0056D2] hover:bg-blue-50 p-1 rounded"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="px-3 py-1.5 bg-[#555d6b] text-white text-[11px] font-bold rounded-full cursor-pointer hover:bg-red-500 transition-colors"
                  >
                    {skill} ×
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold mb-2 text-black">Описание курса</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Расскажите о чём этот курс и чему научится студент..."
            className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm outline-none focus:border-[#0056D2] min-h-[100px] resize-y"
          />
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-sm text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-auto px-8 py-2.5 text-sm"
            >
              {isLoading
                ? "Сохранение..."
                : isEdit
                  ? "Сохранить изменения"
                  : "Сохранить и перейти к урокам"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
