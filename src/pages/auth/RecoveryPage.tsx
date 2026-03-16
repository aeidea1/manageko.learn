import { Link } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RecoveryPage = () => {
  return (
    <AuthLayout 
      title="Восстановление пароля Manageko" 
      subtitle="Введите свой email для восстановления, на него будет отправлен резервный пароль"
    >
      <form className="flex flex-col gap-4">
        <Input type="email" placeholder="Введите свой email адрес" />
        
        <Button type="submit" className="mt-2">Восстановить</Button>

        <div className="text-xs text-black mt-4 text-center">
          Вспомнили свои данные? <Link to="/login" className="font-bold hover:text-primary">Вернуться</Link>
        </div>
      </form>
    </AuthLayout>
  );
};