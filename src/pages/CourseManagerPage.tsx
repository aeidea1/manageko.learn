import { useState, useEffect } from "react";
import { Search, Trash2, X } from "lucide-react";
import { Header } from "../components/Header";
import { CourseCard } from "../components/CourseCard";
import { Button } from "../components/ui/Button";
import { CreateCourseModal } from "../components/CreateCourseModal";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Модалка подтверждения удаления
const DeleteModal = ({
  course,
  onConfirm,
  onCancel,
}: {
  course: any;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] p-6 relative">
      <button
        onClick={onCancel}
        className="absolute right-4 top-4 text-gray-400 hover:text-black"
      >
        <X size={20} />
      </button>
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-center mb-2">Удалить курс?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        Курс <span className="font-bold text-black">«{course?.title}»</span> и
        все его уроки будут удалены безвозвратно.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCancel}
          className="py-3 border border-gray-300 rounded-sm text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          onClick={onConfirm}
          className="py-3 bg-red-500 text-white rounded-sm text-sm font-bold hover:bg-red-600"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
);

export const CourseManagerPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (error) {
      toast.error("Ошибка загрузки курсов");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/courses/${deleteTarget.id}`);
      toast.success("Курс удалён");
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch {
      toast.error("Не удалось удалить курс");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = (course: any) => {
    setEditCourse(course);
    setIsModalOpen(true);
  };

  const handleCardClick = (course: any) => {
    navigate("/editor", { state: { course } });
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 text-black">Менеджер курсов</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative w-full sm:w-[360px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск курса"
              className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#0056D2]"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0056D2] rounded-full flex items-center justify-center text-white">
              <Search size={16} />
            </button>
          </div>
          <Button
            onClick={() => {
              setEditCourse(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 h-11 py-0 flex items-center justify-center rounded-sm text-sm font-bold"
          >
            Создать новый курс
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin" />
            Загрузка курсов...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">
              {searchQuery
                ? "По запросу ничего не найдено."
                : "У вас пока нет созданных курсов."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                skills={course.skills ? course.skills.join(", ") : ""}
                rating={course.rating}
                students={`${course.students} учеников`}
                image={course.image}
                buttonText="Редактировать уроки"
                onButtonClick={() => handleCardClick(course)}
                onEdit={() => handleEdit(course)}
                onDelete={() => setDeleteTarget(course)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCourse(null);
        }}
        onCourseCreated={fetchCourses}
        editCourse={editCourse}
      />

      {deleteTarget && (
        <DeleteModal
          course={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
