import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api"; // Наш настроенный axios
import { AuthLayout } from "../../layouts/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/register", formData);
      navigate("/login"); // Перекидываем на логин при успехе
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Регистрация на Manageko"
      subtitle="Прокачайте свои навыки и станьте крутым специалистом."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            required
            type="text"
            placeholder="Введите своё имя"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            required
            type="text"
            placeholder="Введите свою фамилию"
            value={formData.surname}
            onChange={(e) =>
              setFormData({ ...formData, surname: e.target.value })
            }
          />
        </div>
        <Input
          required
          type="email"
          placeholder="Введите свой email адрес"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          required
          type="password"
          placeholder="Придумайте пароль"
          minLength={6}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? "Загрузка..." : "Зарегистрироваться"}
        </Button>

        <div className="text-xs text-black mt-4 text-center">
          У вас уже есть аккаунт?{" "}
          <Link to="/login" className="font-bold hover:text-[#0056D2]">
            Войти
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
