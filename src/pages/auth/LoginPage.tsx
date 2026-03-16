import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { AuthLayout } from "../../layouts/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      // Сохраняем данные для профиля
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard"); // Летим на главную
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Неверный email или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Авторизация на Manageko"
      subtitle="Введите свой email & пароль для продолжения."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          required
          type="email"
          placeholder="Введите свой email адрес"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <Input
            required
            type="password"
            placeholder="Введите свой пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right">
            <Link
              to="/recovery"
              className="text-xs font-bold text-black underline hover:text-[#0056D2]"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? "Вход..." : "Авторизоваться"}
        </Button>

        <div className="text-xs text-black mt-4 text-center">
          У вас нет аккаунта?{" "}
          <Link to="/register" className="font-bold hover:text-[#0056D2]">
            Создать
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
