import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, CornerDownRight } from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface CommentUser {
  id: number;
  name?: string;
  surname?: string;
  avatar?: string;
  role: string;
}
interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: CommentUser;
  replies: Comment[];
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин. назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч. назад`;
  return `${Math.floor(h / 24)} дн. назад`;
};

const Avatar = ({ user }: { user: CommentUser }) => {
  const initials = (user.name?.[0] || user.surname?.[0] || "?").toUpperCase();
  return user.avatar ? (
    <img
      src={user.avatar}
      alt="avatar"
      className="w-8 h-8 rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-[#00205C] text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
};

interface LessonCommentsProps {
  lessonId: number;
}

export const LessonComments = ({ lessonId }: LessonCommentsProps) => {
  const userData = localStorage.getItem("user");
  const currentUser = userData ? JSON.parse(userData) : null;
  const isAdmin = currentUser?.role === "admin";

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}/comments`);
      setComments(res.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [lessonId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!currentUser) {
      toast.error("Войдите чтобы оставить комментарий");
      return;
    }
    setIsSending(true);
    try {
      const res = await api.post(`/lessons/${lessonId}/comments`, {
        userId: currentUser.id,
        text,
        parentId: replyTo?.id || null,
      });
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...c.replies, res.data] }
              : c,
          ),
        );
      } else {
        setComments((prev) => [res.data, ...prev]);
      }
      setText("");
      setReplyTo(null);
    } catch {
      toast.error("Ошибка при отправке");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId: number, parentId?: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      toast.error("Ошибка");
    }
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-bold text-base mb-5 flex items-center gap-2">
        <MessageCircle size={18} className="text-[#0056D2]" />
        Вопросы и обсуждение
        {totalCount > 0 && (
          <span className="text-xs text-gray-400 font-normal">
            ({totalCount})
          </span>
        )}
      </h2>

      {/* Форма отправки */}
      {currentUser ? (
        <div className="mb-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <CornerDownRight size={13} />
              Ответ для <strong>{replyTo.name}</strong>
              <button
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <Avatar user={currentUser} />
            <div className="flex-1 flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  replyTo
                    ? `Ответить ${replyTo.name}...`
                    : "Задайте вопрос или поделитесь мыслями..."
                }
                rows={2}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0056D2] resize-none transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !text.trim()}
                className="self-end bg-[#0056D2] text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 ml-11">
            Enter — отправить, Shift+Enter — новая строка
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-6 italic">
          Войдите чтобы оставить комментарий.
        </p>
      )}

      {/* Список комментариев */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Пока нет вопросов. Будьте первым!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* Основной комментарий */}
              <div className="flex gap-3 group">
                <Avatar user={comment.user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-black">
                      {[comment.user.name, comment.user.surname]
                        .filter(Boolean)
                        .join(" ") || "Пользователь"}
                    </span>
                    {comment.user.role === "admin" && (
                      <span className="text-[10px] font-bold bg-[#0056D2] text-white px-1.5 py-0.5 rounded">
                        Преподаватель
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() =>
                        setReplyTo({
                          id: comment.id,
                          name:
                            [comment.user.name, comment.user.surname]
                              .filter(Boolean)
                              .join(" ") || "Пользователь",
                        })
                      }
                      className="text-xs text-gray-400 hover:text-[#0056D2] transition-colors font-medium"
                    >
                      Ответить
                    </button>
                    {(currentUser?.id === comment.user.id || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ответы */}
              {comment.replies.length > 0 && (
                <div className="ml-11 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 group">
                      <Avatar user={reply.user} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-black">
                            {[reply.user.name, reply.user.surname]
                              .filter(Boolean)
                              .join(" ") || "Пользователь"}
                          </span>
                          {reply.user.role === "admin" && (
                            <span className="text-[10px] font-bold bg-[#0056D2] text-white px-1.5 py-0.5 rounded">
                              Преподаватель
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                          {reply.text}
                        </p>
                        {(currentUser?.id === reply.user.id || isAdmin) && (
                          <button
                            onClick={() => handleDelete(reply.id, comment.id)}
                            className="mt-1 text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
