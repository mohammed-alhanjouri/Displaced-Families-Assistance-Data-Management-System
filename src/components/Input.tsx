// Input component for reusable input fields across the application

interface InputProps {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input = ({
  id,
  name,
  type,
  required = false,
  autoComplete = "",
  placeholder = "",
  value = "",
  onChange,
  className = "",
}: InputProps) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md bg-white mt-2 px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6 ${className}`}
    />
  );
};

export default Input;
