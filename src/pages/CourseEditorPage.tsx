import { useState, useRef, useEffect } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";
import {
  Plus,
  CheckCircle2,
  Circle,
  Square,
  Trash2,
  Image as ImageIcon,
  Save,
  Loader2,
  FileText,
  Upload,
  X,
  Heading1,
  Heading2,
  Code,
  Bold,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import toast from "react-hot-toast";
// Переиспользуемый компонент форматированного текста
export { RichTextFull } from "../lib/richText";

type EditorTab = "lecture" | "testing" | "practice";

interface QuestionOption {
  id: number;
  text: string;
}
interface Question {
  id: number;
  text: string;
  isSingleChoice: boolean;
  options: QuestionOption[];
  correctAnswers: number[];
  explanation: string;
}
interface Document {
  id: number;
  name: string;
  url: string;
  size?: string;
}
interface Lesson {
  id: number;
  title: string;
  lectureText: string;
  practiceTask: string;
  mediaUrl?: string | null;
  practiceMediaUrl?: string | null;
  documents: Document[];
  questions: Question[];
}

// Кнопки форматирования для textarea
const FormatToolbar = ({ onInsert }: { onInsert: (text: string) => void }) => (
  <div className="flex gap-1 mb-1 flex-wrap">
    <button
      type="button"
      onClick={() => onInsert("# Заголовок\n")}
      title="Заголовок H1"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
    >
      <Heading1 size={14} /> H1
    </button>
    <button
      type="button"
      onClick={() => onInsert("## Подзаголовок\n")}
      title="Заголовок H2"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
    >
      <Heading2 size={14} /> H2
    </button>
    <button
      type="button"
      onClick={() => onInsert("**жирный текст**")}
      title="Жирный"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
    >
      <Bold size={14} /> Bold
    </button>
    <button
      type="button"
      onClick={() => onInsert("- Пункт 1\n- Пункт 2\n- Пункт 3\n")}
      title="Маркированный список"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
    >
      • Список
    </button>
    <button
      type="button"
      onClick={() => onInsert("1. Пункт 1\n2. Пункт 2\n3. Пункт 3\n")}
      title="Нумерованный список"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600"
    >
      1. Список
    </button>
    <button
      type="button"
      onClick={() => onInsert("```\nкод здесь\n```\n")}
      title="Блок кода"
      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-600 font-mono"
    >
      <Code size={14} /> код
    </button>
    <span className="text-[10px] text-gray-400 self-center ml-1">
      — нажми чтобы вставить
    </span>
  </div>
);

export const CourseEditorPage = () => {
  const location = useLocation();
  const course = location.state?.course;
  const courseId = course?.id;
  const courseTitle = course?.title || "Новый курс";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const practiceFileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const lectureTextRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState<EditorTab>("lecture");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentLesson = lessons.find((l) => l.id === activeLessonId) || null;

  useEffect(() => {
    if (course?.lessons && course.lessons.length > 0) {
      const mapped: Lesson[] = course.lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        lectureText: l.lectureText || "",
        practiceTask: l.practiceTask || "",
        mediaUrl: l.mediaUrl || null,
        practiceMediaUrl: l.practiceMediaUrl || null,
        documents: l.documents || [],
        questions: (l.questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          isSingleChoice: q.isSingleChoice,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswers: Array.isArray(q.correctAnswers)
            ? q.correctAnswers
            : [],
          explanation: q.explanation || "",
        })),
      }));
      setLessons(mapped);
      setActiveLessonId(mapped[0]?.id || null);
    }
  }, []);

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: Date.now(),
      title: `Новый урок ${lessons.length + 1}`,
      lectureText: "",
      practiceTask: "",
      mediaUrl: null,
      practiceMediaUrl: null,
      documents: [],
      questions: [],
    };
    setLessons([...lessons, newLesson]);
    setActiveLessonId(newLesson.id);
    setActiveTab("lecture");
    toast.success("Новый урок создан!");
  };

  const updateLessonField = (field: keyof Lesson, value: any) => {
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId ? { ...l, [field]: value } : l,
      ),
    );
  };

  // Вставка форматирования в textarea лекции
  const handleInsertFormat = (text: string) => {
    const ta = lectureTextRef.current;
    if (!ta) {
      updateLessonField(
        "lectureText",
        (currentLesson?.lectureText || "") + text,
      );
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = currentLesson?.lectureText || "";
    const newVal = current.slice(0, start) + text + current.slice(end);
    updateLessonField("lectureText", newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "mediaUrl" | "practiceMediaUrl",
  ) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateLessonField(field, event.target?.result);
        toast.success("Медиа загружено!");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !currentLesson) return;
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const doc: Document = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: event.target?.result as string,
          size:
            file.size > 1024 * 1024
              ? `${(file.size / 1024 / 1024).toFixed(1)} МБ`
              : `${Math.round(file.size / 1024)} КБ`,
        };
        setLessons(
          lessons.map((l) =>
            l.id === activeLessonId
              ? { ...l, documents: [...l.documents, doc] }
              : l,
          ),
        );
      };
      reader.readAsDataURL(file);
    });
    toast.success("Документ добавлен!");
  };

  const removeDoc = (docId: number) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? { ...l, documents: l.documents.filter((d) => d.id !== docId) }
          : l,
      ),
    );
  };

  const updateQuestion = (qId: number, field: keyof Question, value: any) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? {
              ...l,
              questions: l.questions.map((q) =>
                q.id === qId ? { ...q, [field]: value } : q,
              ),
            }
          : l,
      ),
    );
  };

  const addQuestion = () => {
    if (!currentLesson) return;
    const nq: Question = {
      id: Date.now(),
      text: "",
      isSingleChoice: true,
      options: [
        { id: Date.now() + 1, text: "Вариант 1" },
        { id: Date.now() + 2, text: "Вариант 2" },
      ],
      correctAnswers: [],
      explanation: "",
    };
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId ? { ...l, questions: [...l.questions, nq] } : l,
      ),
    );
  };

  const removeQuestion = (qId: number) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? { ...l, questions: l.questions.filter((q) => q.id !== qId) }
          : l,
      ),
    );
  };

  const addOption = (qId: number) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? {
              ...l,
              questions: l.questions.map((q) =>
                q.id === qId
                  ? {
                      ...q,
                      options: [
                        ...q.options,
                        {
                          id: Date.now(),
                          text: `Вариант ${q.options.length + 1}`,
                        },
                      ],
                    }
                  : q,
              ),
            }
          : l,
      ),
    );
  };

  const removeOption = (qId: number, optId: number) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? {
              ...l,
              questions: l.questions.map((q) =>
                q.id === qId
                  ? {
                      ...q,
                      options: q.options.filter((o) => o.id !== optId),
                      correctAnswers: q.correctAnswers.filter(
                        (id) => id !== optId,
                      ),
                    }
                  : q,
              ),
            }
          : l,
      ),
    );
  };

  const updateOptionText = (qId: number, optId: number, text: string) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? {
              ...l,
              questions: l.questions.map((q) =>
                q.id === qId
                  ? {
                      ...q,
                      options: q.options.map((o) =>
                        o.id === optId ? { ...o, text } : o,
                      ),
                    }
                  : q,
              ),
            }
          : l,
      ),
    );
  };

  const toggleCorrectAnswer = (
    qId: number,
    optId: number,
    isSingle: boolean,
  ) => {
    if (!currentLesson) return;
    setLessons(
      lessons.map((l) =>
        l.id === activeLessonId
          ? {
              ...l,
              questions: l.questions.map((q) => {
                if (q.id !== qId) return q;
                if (isSingle) return { ...q, correctAnswers: [optId] };
                const has = q.correctAnswers.includes(optId);
                return {
                  ...q,
                  correctAnswers: has
                    ? q.correctAnswers.filter((id) => id !== optId)
                    : [...q.correctAnswers, optId],
                };
              }),
            }
          : l,
      ),
    );
  };

  const handleSave = async () => {
    if (!courseId) {
      toast.error("Нет ID курса");
      return;
    }
    setIsSaving(true);
    try {
      await api.post(`/courses/${courseId}/lessons`, { lessons });
      toast.success("Курс сохранён!");
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* САЙДБАР */}
          <aside className="lg:col-span-3 flex flex-col gap-4">
            <div>
              <Link
                to="/manager"
                className="text-sm text-gray-600 hover:text-[#0056D2] underline mb-4 inline-block"
              >
                ← Назад
              </Link>
              <h2 className="text-lg font-bold mb-1">{courseTitle}</h2>
              <p className="text-xs text-gray-500 mb-4">
                Редактирование содержания
              </p>
            </div>

            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                onClick={() => {
                  setActiveLessonId(lesson.id);
                  setActiveTab("lecture");
                }}
                className={`border rounded-md p-3 cursor-pointer transition-all hover:shadow-sm ${activeLessonId === lesson.id ? "bg-[#f4f7f9] border-blue-200 ring-1 ring-blue-100" : "bg-white border-gray-100 hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className={`text-sm font-bold mb-0.5 ${activeLessonId === lesson.id ? "text-[#0056D2]" : "text-black"}`}
                    >
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Урок {index + 1}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLessons(lessons.filter((l) => l.id !== lesson.id));
                      if (activeLessonId === lesson.id) setActiveLessonId(null);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddLesson}
              className="w-full border border-dashed border-gray-400 rounded-sm py-3 flex items-center justify-center gap-2 text-sm text-[#0056D2] hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} /> Добавить урок
            </button>

            {lessons.length > 0 && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-[#0056D2] text-white rounded-sm py-3 flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Сохраняется..." : "Сохранить курс"}
              </button>
            )}
          </aside>

          {/* КОНТЕНТ */}
          <section className="lg:col-span-9 max-w-4xl">
            {!currentLesson ? (
              <div className="flex items-center justify-center h-full min-h-[400px] flex-col gap-3">
                <p className="text-gray-400 text-sm">
                  Создайте урок слева, чтобы начать редактирование.
                </p>
                <button
                  onClick={handleAddLesson}
                  className="flex items-center gap-2 text-[#0056D2] text-sm font-bold hover:underline"
                >
                  <Plus size={16} /> Создать первый урок
                </button>
              </div>
            ) : (
              <>
                <input
                  value={currentLesson.title}
                  onChange={(e) => updateLessonField("title", e.target.value)}
                  className="text-2xl font-bold mb-2 text-black w-full border-none outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2"
                  placeholder="Название урока..."
                />

                {/* Табы */}
                <div className="flex gap-2 mb-6">
                  {(["lecture", "testing", "practice"] as EditorTab[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === tab ? "bg-[#0056D2] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {tab === "lecture"
                          ? "Лекция"
                          : tab === "testing"
                            ? "Тестирование"
                            : "Практика"}
                      </button>
                    ),
                  )}
                </div>

                {/* ЛЕКЦИЯ */}
                {activeTab === "lecture" && (
                  <div className="animate-in fade-in duration-300 space-y-4">
                    <div>
                      <FormatToolbar onInsert={handleInsertFormat} />
                      <textarea
                        ref={lectureTextRef}
                        value={currentLesson.lectureText}
                        onChange={(e) =>
                          updateLessonField("lectureText", e.target.value)
                        }
                        className="w-full min-h-[220px] p-3 border border-gray-200 rounded-md text-sm focus:border-[#0056D2] outline-none resize-none font-mono"
                        placeholder={
                          "# Заголовок\n## Подзаголовок\n**жирный текст**\n\nОбычный абзац\n\n```\nкод здесь\n```"
                        }
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Поддерживается: # заголовок, ## подзаголовок,
                        **жирный**, ``` блок кода ```
                      </p>
                    </div>

                    {/* Медиа лекции */}
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2">
                        Медиа к лекции
                      </p>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col items-center justify-center min-h-[140px] cursor-pointer hover:bg-gray-100 overflow-hidden"
                      >
                        {currentLesson.mediaUrl ? (
                          <img
                            src={currentLesson.mediaUrl}
                            className="w-full h-full object-cover max-h-[260px]"
                            alt="Media"
                          />
                        ) : (
                          <>
                            <ImageIcon
                              size={28}
                              className="text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-500">
                              Загрузить изображение / видео
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => handleMediaUpload(e, "mediaUrl")}
                      />
                      {currentLesson.mediaUrl && (
                        <button
                          onClick={() => updateLessonField("mediaUrl", null)}
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          Удалить медиа
                        </button>
                      )}
                    </div>

                    {/* Документы */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-black flex items-center gap-2">
                          <FileText size={15} className="text-[#0056D2]" />{" "}
                          Материалы урока
                        </h3>
                        <button
                          onClick={() => docInputRef.current?.click()}
                          className="flex items-center gap-1 text-xs text-[#0056D2] font-bold hover:underline"
                        >
                          <Upload size={13} /> Добавить файл
                        </button>
                        <input
                          type="file"
                          ref={docInputRef}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                          multiple
                          onChange={handleDocUpload}
                        />
                      </div>
                      {currentLesson.documents.length === 0 ? (
                        <div
                          onClick={() => docInputRef.current?.click()}
                          className="border border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:bg-gray-50"
                        >
                          <p className="text-xs text-gray-400">
                            PDF, документы, таблицы...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentLesson.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center shrink-0">
                                <FileText
                                  size={15}
                                  className="text-[#0056D2]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {doc.name}
                                </p>
                                {doc.size && (
                                  <p className="text-xs text-gray-400">
                                    {doc.size}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeDoc(doc.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => docInputRef.current?.click()}
                            className="w-full text-xs text-[#0056D2] hover:underline py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50"
                          >
                            + Добавить ещё
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ПРАКТИКА */}
                {activeTab === "practice" && (
                  <div className="animate-in fade-in duration-300 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-1">
                        Задание для студента
                      </p>
                      <FormatToolbar
                        onInsert={(text) => {
                          const current = currentLesson.practiceTask || "";
                          updateLessonField("practiceTask", current + text);
                        }}
                      />
                      <textarea
                        value={currentLesson.practiceTask}
                        onChange={(e) =>
                          updateLessonField("practiceTask", e.target.value)
                        }
                        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md text-sm focus:border-[#0056D2] outline-none resize-none font-mono"
                        placeholder={
                          "Опишите задание...\n\n- Шаг 1\n- Шаг 2\n\n```\nпример кода\n```"
                        }
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Поддерживается: # ## **жирный** - список 1. список ```
                        код ```
                      </p>
                    </div>

                    {/* Медиа практики */}
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2">
                        Медиа к практическому заданию (пример, референс)
                      </p>
                      <div
                        onClick={() => practiceFileInputRef.current?.click()}
                        className="w-full border border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col items-center justify-center min-h-[140px] cursor-pointer hover:bg-gray-100 overflow-hidden"
                      >
                        {currentLesson.practiceMediaUrl ? (
                          <img
                            src={currentLesson.practiceMediaUrl}
                            className="w-full h-full object-cover max-h-[260px]"
                            alt="Practice media"
                          />
                        ) : (
                          <>
                            <ImageIcon
                              size={28}
                              className="text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-500">
                              Загрузить референс / пример
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={practiceFileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) =>
                          handleMediaUpload(e, "practiceMediaUrl")
                        }
                      />
                      {currentLesson.practiceMediaUrl && (
                        <button
                          onClick={() =>
                            updateLessonField("practiceMediaUrl", null)
                          }
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          Удалить медиа
                        </button>
                      )}
                    </div>

                    {/* Документы практики — те же что в лекции */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-black flex items-center gap-2">
                          <FileText size={15} className="text-[#0056D2]" />{" "}
                          Материалы к практике
                        </h3>
                        <button
                          onClick={() => docInputRef.current?.click()}
                          className="flex items-center gap-1 text-xs text-[#0056D2] font-bold hover:underline"
                        >
                          <Upload size={13} /> Добавить файл
                        </button>
                      </div>
                      {currentLesson.documents.length === 0 ? (
                        <div
                          onClick={() => docInputRef.current?.click()}
                          className="border border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:bg-gray-50"
                        >
                          <p className="text-xs text-gray-400">
                            PDF, документы, таблицы...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentLesson.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center shrink-0">
                                <FileText
                                  size={15}
                                  className="text-[#0056D2]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {doc.name}
                                </p>
                                {doc.size && (
                                  <p className="text-xs text-gray-400">
                                    {doc.size}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeDoc(doc.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => docInputRef.current?.click()}
                            className="w-full text-xs text-[#0056D2] hover:underline py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50"
                          >
                            + Добавить ещё
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ТЕСТИРОВАНИЕ */}
                {activeTab === "testing" && (
                  <div className="animate-in fade-in duration-300">
                    {currentLesson.questions.length === 0 && (
                      <p className="text-sm text-gray-400 mb-6">
                        Вопросов пока нет.
                      </p>
                    )}

                    {currentLesson.questions.map((q, qi) => (
                      <div
                        key={q.id}
                        className="mb-10 border-b border-gray-100 pb-8 last:border-0"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <span className="font-bold text-lg text-gray-400 shrink-0">
                            {qi + 1}.
                          </span>
                          <textarea
                            value={q.text}
                            onChange={(e) =>
                              updateQuestion(q.id, "text", e.target.value)
                            }
                            className="w-full text-sm font-bold border-none outline-none focus:ring-1 focus:ring-blue-200 rounded p-1 resize-none"
                            rows={2}
                            placeholder="Введите вопрос..."
                          />
                        </div>

                        <div className="flex items-center gap-3 mb-4 ml-8">
                          <div
                            onClick={() =>
                              updateQuestion(
                                q.id,
                                "isSingleChoice",
                                !q.isSingleChoice,
                              )
                            }
                            className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${q.isSingleChoice ? "bg-[#0056D2]" : "bg-gray-300"}`}
                          >
                            <div
                              className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] transition-all ${q.isSingleChoice ? "right-[2px]" : "left-[2px]"}`}
                            />
                          </div>
                          <span
                            className="text-xs font-bold cursor-pointer select-none"
                            onClick={() =>
                              updateQuestion(
                                q.id,
                                "isSingleChoice",
                                !q.isSingleChoice,
                              )
                            }
                          >
                            {q.isSingleChoice
                              ? "Один верный ответ"
                              : "Несколько верных"}
                          </span>
                        </div>

                        <div className="space-y-2 ml-8 mb-4">
                          {q.options.map((opt) => {
                            const isCorrect = q.correctAnswers.includes(opt.id);
                            return (
                              <div
                                key={opt.id}
                                className="flex items-center gap-3 group"
                              >
                                <button
                                  onClick={() =>
                                    toggleCorrectAnswer(
                                      q.id,
                                      opt.id,
                                      q.isSingleChoice,
                                    )
                                  }
                                  className={`shrink-0 transition-colors ${isCorrect ? "text-green-500" : "text-gray-300 hover:text-gray-400"}`}
                                  title={
                                    isCorrect
                                      ? "Правильный ответ"
                                      : "Отметить как правильный"
                                  }
                                >
                                  {q.isSingleChoice ? (
                                    <Circle
                                      size={18}
                                      className={
                                        isCorrect ? "fill-green-500" : ""
                                      }
                                    />
                                  ) : (
                                    <Square
                                      size={18}
                                      className={
                                        isCorrect ? "fill-green-500" : ""
                                      }
                                    />
                                  )}
                                </button>
                                <input
                                  value={opt.text}
                                  onChange={(e) =>
                                    updateOptionText(
                                      q.id,
                                      opt.id,
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 text-sm border-b border-transparent hover:border-gray-200 focus:border-[#0056D2] outline-none px-1 py-1"
                                />
                                <button
                                  onClick={() => removeOption(q.id, opt.id)}
                                  className="text-red-400 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-6 ml-8 mb-5">
                          <button
                            onClick={() => addOption(q.id)}
                            className="flex items-center gap-1 text-[11px] text-[#0056D2] font-medium hover:underline"
                          >
                            <Plus size={12} /> Добавить вариант
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="text-[11px] text-red-500 font-medium hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Удалить
                          </button>
                        </div>

                        <div className="ml-8 border border-dashed border-green-400 bg-[#eefaf3] rounded-md p-4">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <CheckCircle2 size={15} />
                            <span className="text-xs font-bold">Пояснение</span>
                          </div>
                          <textarea
                            value={q.explanation}
                            onChange={(e) =>
                              updateQuestion(
                                q.id,
                                "explanation",
                                e.target.value,
                              )
                            }
                            className="w-full text-xs text-gray-700 bg-transparent border-none outline-none resize-none"
                            placeholder="Пояснение для студента после правильного ответа..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addQuestion}
                      className="w-full sm:w-auto px-10 border border-dashed border-gray-400 rounded-sm py-2.5 flex items-center justify-center gap-2 text-xs text-[#0056D2] hover:bg-blue-50"
                    >
                      <Plus size={14} /> Добавить вопрос
                    </button>
                  </div>
                )}

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-14 py-3 text-sm rounded-sm font-bold flex items-center gap-2 justify-center"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {isSaving ? "Сохраняется..." : "Сохранить изменения"}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
