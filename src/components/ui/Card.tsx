// Card component for reusable card layout across the application

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`w-60 max-w-md bg-white border-2 border-gray-300 rounded-lg shadow-md p-6 hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
