import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import { CheckCircle2, Mail, Lock } from "lucide-react";

export const RecoveryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Шаг 1: ввод email
  // Шаг 2: письмо отправлено
  // Шаг 3: ввод нового пароля (если есть token в URL)
  // Шаг 4: успех
  const [step, setStep] = useState<"email" | "sent" | "reset" | "done">(
    token ? "reset" : "email",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenEmail, setTokenEmail] = useState("");

  // Проверяем токен при загрузке
  useEffect(() => {
    if (!token) return;
    api
      .get(`/recovery/verify/${token}`)
      .then((res) => setTokenEmail(res.data.email))
      .catch(() => {
        setError("Ссылка недействительна или истекла. Запросите новую.");
        setStep("email");
      });
  }, [token]);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await api.post("/recovery/request", { email });
      setStep("sent");
    } catch {
      setError("Ошибка при отправке письма. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      setError("Введите новый пароль");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await api.post("/recovery/reset", { token, password });
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка при сбросе пароля");
    } finally {
      setIsLoading(false);
    }
  };

  // ШАГ 1 — ввод email
  if (step === "email")
    return (
      <AuthLayout
        title="Восстановление пароля"
        subtitle="Введите email от вашего аккаунта — мы отправим ссылку для сброса."
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}
          <div>
            <p className="text-xs font-bold mb-2">Email</p>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRequestReset()}
                placeholder="your@email.com"
                className="pl-9"
              />
            </div>
          </div>
          <Button
            onClick={handleRequestReset}
            disabled={isLoading}
            className="w-full py-3 text-sm font-bold"
          >
            {isLoading ? "Отправка..." : "Отправить ссылку для сброса"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Вспомнили пароль?{" "}
            <Link
              to="/login"
              className="text-[#0056D2] font-bold hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </AuthLayout>
    );

  // ШАГ 2 — письмо отправлено
  if (step === "sent")
    return (
      <AuthLayout title="Письмо отправлено" subtitle="">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <Mail size={28} className="text-[#0056D2]" />
          </div>
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Мы отправили ссылку для сброса пароля на{" "}
              <strong className="text-black">{email}</strong>. Проверьте папку
              «Входящие» и «Спам».
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Ссылка действительна 15 минут.
            </p>
          </div>
          <Button
            onClick={() => setStep("email")}
            className="w-full py-3 text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Отправить повторно
          </Button>
          <Link
            to="/login"
            className="block text-sm text-[#0056D2] hover:underline font-bold"
          >
            ← Вернуться на страницу входа
          </Link>
        </div>
      </AuthLayout>
    );

  // ШАГ 3 — ввод нового пароля
  if (step === "reset")
    return (
      <AuthLayout
        title="Новый пароль"
        subtitle={
          tokenEmail
            ? `Аккаунт: ${tokenEmail}`
            : "Придумайте новый пароль для вашего аккаунта."
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}
          <div>
            <p className="text-xs font-bold mb-2">Новый пароль</p>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">Повторите пароль</p>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                placeholder="Повторите пароль"
                className="pl-9"
              />
            </div>
          </div>
          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full py-3 text-sm font-bold"
          >
            {isLoading ? "Сохранение..." : "Сохранить новый пароль"}
          </Button>
        </div>
      </AuthLayout>
    );

  // ШАГ 4 — успех
  return (
    <AuthLayout title="Пароль изменён" subtitle="">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <p className="text-sm text-gray-600">
          Ваш пароль успешно изменён. Теперь вы можете войти с новым паролем.
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="w-full py-3 text-sm font-bold"
        >
          Войти в аккаунт
        </Button>
      </div>
    </AuthLayout>
  );
};
