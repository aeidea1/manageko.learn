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
import { Link } from "react-router-dom";
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

const RoleBadge = ({ role }: { role: string }) => {
  if (role === "admin")
    return (
      <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded">
        Администратор
      </span>
    );
  if (role === "teacher")
    return (
      <span className="text-[10px] font-bold bg-[#0056D2] text-white px-1.5 py-0.5 rounded">
        Наставник
      </span>
    );
  return null;
};

const UserAvatar = ({ user }: { user: CommentUser }) => {
  const initial = (user.name?.[0] || user.surname?.[0] || "?").toUpperCase();
  return (
    <Link
      to={`/profile/${user.id}`}
      className="shrink-0 hover:opacity-80 transition-opacity"
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#00205C] text-white flex items-center justify-center text-xs font-bold">
          {initial}
        </div>
      )}
    </Link>
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
          <Link
            to={`/profile/${comment.user.id}`}
            className="text-sm font-bold text-black hover:text-[#0056D2] transition-colors"
          >
            {userName(comment.user)}
          </Link>
          <RoleBadge role={comment.user.role} />
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
                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mb-1">
            {comment.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          {!editing && (
            <button
              onClick={() =>
                onReply(
                  parentId || comment.id,
                  userName(comment.user),
                  parentId,
                )
              }
              className="text-xs text-gray-400 hover:text-[#0056D2] transition-colors flex items-center gap-1"
            >
              <CornerDownRight size={12} />
              Ответить
            </button>
          )}
          {canModify && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-[#0056D2] transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Pencil size={11} />
                Изменить
              </button>
              <button
                onClick={() => onDelete(comment.id, parentId)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Trash2 size={11} />
                Удалить
              </button>
            </>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const LessonComments = ({ lessonId }: { lessonId: number }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: number;
    name: string;
    rootId?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const userData = localStorage.getItem("user");
  const currentUser = userData ? JSON.parse(userData) : null;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}/comments`);
      setComments(res.data);
    } catch {
      toast.error("Не удалось загрузить комментарии");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setIsSending(true);
    try {
      const res = await api.post(`/lessons/${lessonId}/comments`, {
        userId: currentUser?.id,
        text: newComment.trim(),
        parentId: replyTo?.rootId || replyTo?.id || undefined,
      });
      if (replyTo?.rootId || replyTo?.id) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === (replyTo.rootId || replyTo.id)
              ? { ...c, replies: [...(c.replies || []), res.data] }
              : c,
          ),
        );
      } else {
        setComments((prev) => [...prev, { ...res.data, replies: [] }]);
      }
      setNewComment("");
      setReplyTo(null);
    } catch {
      toast.error("Не удалось отправить комментарий");
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
      toast.error("Не удалось удалить комментарий");
    }
  };

  const handleEdit = async (
    commentId: number,
    text: string,
    parentId?: number,
  ) => {
    try {
      const res = await api.put(`/comments/${commentId}`, {
        userId: currentUser?.id,
        text,
      });
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === commentId ? { ...r, ...res.data } : r,
                  ),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, ...res.data } : c)),
        );
      }
    } catch {
      toast.error("Не удалось изменить комментарий");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold text-base mb-5 flex items-center gap-2">
        <MessageCircle size={18} className="text-[#0056D2]" />
        Комментарии
        {comments.length > 0 && (
          <span className="text-xs text-gray-400 font-normal">
            ({comments.length})
          </span>
        )}
      </h3>

      <div className="mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
            <CornerDownRight size={12} className="text-[#0056D2]" />
            <span>
              Ответ для <strong>{replyTo.name}</strong>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-auto text-gray-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          {currentUser && (
            <Link
              to={`/profile/${currentUser.id}`}
              className="shrink-0 hover:opacity-80 transition-opacity"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#00205C] text-white flex items-center justify-center text-xs font-bold">
                  {(
                    currentUser.name?.[0] ||
                    currentUser.email?.[0] ||
                    "?"
                  ).toUpperCase()}
                </div>
              )}
            </Link>
          )}
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Напишите комментарий..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#0056D2] resize-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !newComment.trim()}
              className="absolute right-3 bottom-3 text-[#0056D2] hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Пока нет комментариев. Будьте первым!
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onReply={(id, name, rootId) => setReplyTo({ id, name, rootId })}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
