import React from "react";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  css? : string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  children = "Play Online",
  css
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`py-4 px-16 rounded font-bold transition-all duration-200 
        ${
          disabled
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-gray-100 hover:bg-blue-700 text-black"
        } ${css}`}
    >
      {children}
    </button>
  );
};
