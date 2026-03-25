import { useState, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Trash2,
  CornerDownRight,
  Pencil,
  Check,
  X,
} from "lucide-react";
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
  edited?: boolean;
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

const UserAvatar = ({ user }: { user: CommentUser }) => {
  const initial = (user.name?.[0] || user.surname?.[0] || "?").toUpperCase();
  return user.avatar ? (
    <img
      src={user.avatar}
      alt="avatar"
      className="w-8 h-8 rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-[#00205C] text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initial}
    </div>
  );
};

const userName = (user: CommentUser) =>
  [user.name, user.surname].filter(Boolean).join(" ") || "Пользователь";

interface CommentItemProps {
  comment: Comment;
  currentUser: any;
  isAdmin: boolean;
  onReply: (id: number, name: string, rootId?: number) => void;
  onDelete: (id: number, parentId?: number) => void;
  onEdit: (id: number, text: string, parentId?: number) => void;
  parentId?: number;
}

const CommentItem = ({
  comment,
  currentUser,
  isAdmin,
  onReply,
  onDelete,
  onEdit,
  parentId,
}: CommentItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const canModify = currentUser?.id === comment.user.id || isAdmin;

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onEdit(comment.id, editText.trim(), parentId);
    setEditing(false);
  };

  return (
    <div className="flex gap-3 group">
      <UserAvatar user={comment.user} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-black">
            {userName(comment.user)}
          </span>
          {comment.user.role === "admin" && (
            <span className="text-[10px] font-bold bg-[#0056D2] text-white px-1.5 py-0.5 rounded">
              Преподаватель
            </span>
          )}
          <span className="text-xs text-gray-400">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.edited && (
            <span className="text-[10px] text-gray-400 italic">изменено</span>
          )}
        </div>

        {editing ? (
          <div className="flex gap-2 mb-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
              }}
              rows={2}
              className="flex-1 border border-[#0056D2] rounded-lg px-3 py-2 text-sm outline-none resize-none"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleSaveEdit}
                className="p-1.5 bg-[#0056D2] text-white rounded-lg hover:bg-blue-700"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.text);
                }}
                className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap mb-1">
            {comment.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          {/* Ответить можно только на комментарии первого уровня */}
          <button
            onClick={() =>
              onReply(comment.id, userName(comment.user), parentId)
            }
            className="text-xs text-gray-400 hover:text-[#0056D2] transition-colors font-medium"
          >
            Ответить
          </button>
          {canModify && !editing && (
            <>
              {currentUser?.id === comment.user.id && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-400 hover:text-[#0056D2] transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                >
                  <Pencil size={11} /> Изменить
                </button>
              )}
              <button
                onClick={() => onDelete(comment.id, parentId)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Trash2 size={11} /> Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface LessonCommentsProps {
  lessonId: number;
  courseTitle?: string;
}

export const LessonComments = ({ lessonId }: LessonCommentsProps) => {
  const userData = localStorage.getItem("user");
  const currentUser = userData ? JSON.parse(userData) : null;
  const isAdmin = currentUser?.role === "admin";

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: number;
    name: string;
    rootId?: number;
  } | null>(null);
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
    if (!lessonId) {
      setIsLoading(false);
      return;
    }
    load();
  }, [lessonId]);

  if (!lessonId)
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-base mb-3 flex items-center gap-2">
          <MessageCircle size={18} className="text-[#0056D2]" /> Вопросы и
          обсуждение
        </h2>
        <p className="text-sm text-gray-400 italic">
          Комментарии будут доступны после добавления уроков в курс.
        </p>
      </div>
    );

  const handleSend = async () => {
    if (!text.trim() || !currentUser) return;
    setIsSending(true);
    try {
      const rootId = replyTo?.rootId ?? replyTo?.id ?? null;
      const res = await api.post(`/lessons/${lessonId}/comments`, {
        userId: currentUser.id,
        text,
        parentId: rootId,
      });
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === rootId ? { ...c, replies: [...c.replies, res.data] } : c,
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

  const handleEdit = async (
    commentId: number,
    newText: string,
    parentId?: number,
  ) => {
    try {
      const res = await api.put(`/comments/${commentId}`, { text: newText });
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === commentId
                      ? { ...r, text: res.data.text, edited: true }
                      : r,
                  ),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, text: res.data.text, edited: true }
              : c,
          ),
        );
      }
      toast.success("Комментарий изменён");
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

      {/* Форма */}
      {currentUser ? (
        <div className="mb-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
              <CornerDownRight size={12} />
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
            <UserAvatar user={currentUser} />
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
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0056D2] resize-none transition-colors min-w-0"
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

      {/* Список */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-28" />
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
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onReply={(id, name, rootId) => setReplyTo({ id, name, rootId })}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
              {comment.replies.length > 0 && (
                <div className="ml-11 mt-3 space-y-4 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUser={currentUser}
                      isAdmin={isAdmin}
                      onReply={(id, name, rootId) =>
                        setReplyTo({ id, name, rootId })
                      }
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      parentId={comment.id}
                    />
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
