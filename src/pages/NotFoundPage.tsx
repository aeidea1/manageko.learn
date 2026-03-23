import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Кот ASCII арт через SVG */}
      <div className="mb-8 select-none">
        <svg
          width="200"
          height="180"
          viewBox="0 0 200 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Тело */}
          <ellipse
            cx="100"
            cy="130"
            rx="55"
            ry="45"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          {/* Голова */}
          <ellipse
            cx="100"
            cy="75"
            rx="45"
            ry="42"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          {/* Уши */}
          <polygon
            points="62,42 50,18 78,35"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          <polygon
            points="138,42 150,18 122,35"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          {/* Внутри ушей */}
          <polygon points="64,40 55,24 76,36" fill="#fecdd3" />
          <polygon points="136,40 145,24 124,36" fill="#fecdd3" />
          {/* Глаза — X X */}
          <text
            x="78"
            y="78"
            fontSize="22"
            fontWeight="900"
            fill="#374151"
            textAnchor="middle"
          >
            ×
          </text>
          <text
            x="122"
            y="78"
            fontSize="22"
            fontWeight="900"
            fill="#374151"
            textAnchor="middle"
          >
            ×
          </text>
          {/* Нос */}
          <ellipse cx="100" cy="88" rx="4" ry="3" fill="#fca5a5" />
          {/* Рот */}
          <path
            d="M93 93 Q100 99 107 93"
            stroke="#9ca3af"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Усы */}
          <line
            x1="60"
            y1="87"
            x2="90"
            y2="90"
            stroke="#9ca3af"
            strokeWidth="1.2"
          />
          <line
            x1="60"
            y1="92"
            x2="90"
            y2="92"
            stroke="#9ca3af"
            strokeWidth="1.2"
          />
          <line
            x1="110"
            y1="90"
            x2="140"
            y2="87"
            stroke="#9ca3af"
            strokeWidth="1.2"
          />
          <line
            x1="110"
            y1="92"
            x2="140"
            y2="92"
            stroke="#9ca3af"
            strokeWidth="1.2"
          />
          {/* Лапки */}
          <ellipse
            cx="68"
            cy="165"
            rx="18"
            ry="12"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          <ellipse
            cx="132"
            cy="165"
            rx="18"
            ry="12"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          {/* Хвост */}
          <path
            d="M150 140 Q185 120 175 95 Q165 75 155 90"
            stroke="#d1d5db"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Знак вопроса на животике */}
          <text
            x="100"
            y="140"
            fontSize="28"
            fontWeight="900"
            fill="#9ca3af"
            textAnchor="middle"
          >
            ?
          </text>
        </svg>
      </div>

      <div className="mb-2">
        <span className="text-sm font-bold text-[#0056D2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          404
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-black mt-4 mb-3">
        Ой, кот съел эту страницу
      </h1>

      <p className="text-gray-500 text-sm max-w-sm mb-2">
        Кажется, здесь ничего нет. Страница переехала, удалилась, или её никогда
        не существовало.
      </p>
      <p className="text-gray-400 text-xs mb-10">
        Кот не виноват. Или виноват — мы не знаем.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-bold px-6 py-3 rounded-sm hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center gap-2 bg-[#0056D2] text-white text-sm font-bold px-6 py-3 rounded-sm hover:bg-blue-700 transition-colors"
        >
          На главную
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-500 text-sm font-bold px-6 py-3 rounded-sm hover:bg-gray-50 transition-colors"
        >
          ↺ Обновить
        </button>
      </div>
    </div>
  );
};
