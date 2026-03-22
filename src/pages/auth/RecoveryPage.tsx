import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

export const RecoveryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"email" | "sent" | "reset" | "done">(
    token ? "reset" : "email",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenEmail, setTokenEmail] = useState("");

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
        <div className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm text-left">
              {error}
            </div>
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRequestReset()}
            placeholder="Введите свой email адрес"
          />
          <Button
            onClick={handleRequestReset}
            disabled={isLoading}
            className="w-full py-3 text-sm font-bold"
          >
            {isLoading ? "Отправка..." : "Отправить ссылку для сброса"}
          </Button>
          <div className="text-xs text-black text-center">
            Вспомнили пароль?{" "}
            <Link to="/login" className="font-bold hover:text-[#0056D2]">
              Войти
            </Link>
          </div>
        </div>
      </AuthLayout>
    );

  // ШАГ 2 — письмо отправлено
  if (step === "sent")
    return (
      <AuthLayout
        title="Письмо отправлено"
        subtitle={`Мы отправили ссылку на ${email}. Проверьте папку «Входящие» и «Спам».`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-400 text-center">
            Ссылка действительна 15 минут.
          </p>
          <Button
            onClick={() => {
              setStep("email");
              setEmail("");
            }}
            className="w-full py-3 text-sm font-bold bg-white text-[#0056D2] border border-[#0056D2] hover:bg-blue-50"
          >
            Отправить повторно
          </Button>
          <p className="text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-[#0056D2] font-bold hover:underline"
            >
              ← Вернуться на страницу входа
            </Link>
          </p>
        </div>
      </AuthLayout>
    );

  // ШАГ 3 — новый пароль
  if (step === "reset")
    return (
      <AuthLayout
        title="Новый пароль"
        subtitle={
          tokenEmail ? `Аккаунт: ${tokenEmail}` : "Придумайте новый пароль."
        }
      >
        <div className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm text-left">
              {error}
            </div>
          )}
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Новый пароль (минимум 6 символов)"
          />
          <Input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
            placeholder="Повторите пароль"
          />
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
    <AuthLayout
      title="Пароль изменён"
      subtitle="Ваш пароль успешно изменён. Теперь вы можете войти с новым паролем."
    >
      <Button
        onClick={() => navigate("/login")}
        className="w-full py-3 text-sm font-bold"
      >
        Войти в аккаунт
      </Button>
    </AuthLayout>
  );
};
