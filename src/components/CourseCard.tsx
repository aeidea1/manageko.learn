import { Star, Trash2, Pencil } from "lucide-react";
import { Button } from "./ui/Button";

interface CourseCardProps {
  title: string;
  skills: string;
  rating: number;
  students: string;
  image?: string;
  buttonText?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onButtonClick?: () => void;
  courseId?: number;
  progress?: number;
  category?: string;
}

export const CourseCard = ({
  title,
  skills,
  rating,
  students,
  image,
  buttonText,
  onDelete,
  onEdit,
  onButtonClick,
  progress,
  category,
}: CourseCardProps) => {
  const hasActions = !!(onDelete || onEdit);

  return (
    <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow relative group">
      {/* Кнопки управления — всегда видны когда есть пропы (не только по hover на мобиле) */}
      {hasActions && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="bg-white/95 p-2 rounded-full text-[#0056D2] hover:bg-blue-50 shadow-sm border border-blue-100"
              title="Редактировать курс"
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="bg-white/95 p-2 rounded-full text-red-500 hover:bg-red-50 shadow-sm border border-red-100"
              title="Удалить курс"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      {/* Обложка */}
      {image && image.startsWith("data:image") ? (
        <img
          src={image}
          alt={title}
          className="w-full h-[180px] object-cover"
        />
      ) : (
        <div className="h-[180px] bg-gradient-to-br from-[#0056D2] to-[#00205C] flex items-center justify-center relative overflow-hidden">
          <span className="text-white/10 text-8xl font-black select-none absolute">
            M
          </span>
          {category && (
            <span className="relative z-10 text-white/80 text-xs font-bold px-3 py-1 border border-white/20 rounded-full">
              {category}
            </span>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1 line-clamp-2">{title}</h3>
        {skills && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            Навыки: {skills}
          </p>
        )}

        <div className="flex items-center gap-1 text-sm text-black mb-3 font-medium mt-auto">
          <Star size={14} className="fill-black shrink-0" />
          <span>{rating > 0 ? rating.toFixed(1) : "—"}</span>
          <span className="text-gray-500 font-normal ml-1 text-xs">
            {students}
          </span>
        </div>

        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Прогресс</span>
              <span className="font-bold text-[#0056D2]">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0056D2] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick?.();
          }}
          className="py-2 text-sm font-semibold rounded-md"
        >
          {buttonText || "Начать изучение"}
        </Button>
      </div>
    </div>
  );
};
