import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      // Было: px-4 (16px)
      // Стало: px-3 (12px) - чтобы дать больше места тексту
      // Добавил: w-full min-w-0 - чтобы инпут не вылезал за границы грида
      // text-sm (14px) - стандартный размер, он ок.
      // placeholder:text-ellipsis - чтобы, если текст совсем не влез, было троеточие (...)
      className={`w-full min-w-0 border border-gray-300 rounded-sm px-3 py-3 text-sm outline-none focus:border-primary placeholder:text-gray-500 placeholder:text-ellipsis transition-colors ${props.className}`}
    />
  );
};