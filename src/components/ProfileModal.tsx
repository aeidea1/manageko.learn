import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [password, setPassword] = useState("");
  const [avatarBase64, setAvatarBase64] = useState<string | null>(
    user?.avatar || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const firstLetter = user?.name ? user.name[0].toUpperCase() : "A";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Проверяем размер (макс 2MB для аватара)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимум 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarBase64(result);
        toast.success("Фото загружено!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.put("/profile", {
        userId: user.id,
        name,
        surname,
        password: password.trim() || undefined,
        avatar: avatarBase64, // null = удалить, строка = сохранить
      });

      const updatedUser = response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Профиль обновлён!");
      onClose();
      // Обновляем страницу чтобы хедер подхватил новые данные
      window.location.reload();
    } catch (error) {
      toast.error("Ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white w-full max-w-[500px] rounded-lg shadow-2xl relative p-5 sm:p-8 max-h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-1">Личные данные</h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mb-8">
          Добавьте информацию о себе в той форме, в которой она должна
          отображаться в профиле.
        </p>

        <div className="mb-8">
          <p className="text-xs font-bold mb-4 uppercase tracking-wider text-gray-400">
            Фото профиля
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Превью аватара */}
            <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
              {avatarBase64 ? (
                <img
                  src={avatarBase64}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#00205C] text-white flex items-center justify-center text-3xl font-bold uppercase">
                  {firstLetter}
                </div>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none bg-[#0056D2] text-white text-[12px] font-bold px-5 py-2.5 rounded-sm hover:bg-blue-700"
              >
                Изменить фото
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <button
                onClick={() => setAvatarBase64(null)}
                className="flex-1 sm:flex-none border border-[#0056D2] text-[#0056D2] text-[12px] font-bold px-5 py-2.5 rounded-sm hover:bg-blue-50"
              >
                Удалить фото
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2">Ваше имя</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2">Ваша фамилия</p>
              <Input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Ваш email</p>
            <Input
              value={user?.email || ""}
              readOnly
              className="bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Новый пароль</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Оставьте пустым, если не хотите менять"
            />
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="py-3 text-[13px] font-bold"
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
            <button
              onClick={handleLogout}
              className="w-full border border-[#0056D2] text-[#0056D2] text-[13px] font-bold py-3 rounded-sm hover:bg-blue-50"
            >
              Выйти из аккаунта
            </button>
          </div>
          <p className="text-[11px] text-center text-gray-400 mt-6 leading-relaxed">
            Чтобы удалить аккаунт, напишите администратору на{" "}
            <a
              href="mailto:manageko.learn@support.com"
              className="font-bold underline hover:text-red-500 transition-colors"
            >
              manageko.learn@support.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
