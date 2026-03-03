interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {children}
    </button>
  );
}
