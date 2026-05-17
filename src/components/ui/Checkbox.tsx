// Checkbox component for reusable checkbox input

interface CheckboxProps {
  id: string;
  name: string;
  label: string;
  className?: string;
}

const Checkbox = ({ id, name, label, className = "" }: CheckboxProps) => {
  return (
    <div className={`flex items-center mt-4 ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-800">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
