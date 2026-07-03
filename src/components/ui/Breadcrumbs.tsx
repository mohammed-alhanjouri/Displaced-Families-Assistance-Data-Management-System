import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}
const Breadcrumb = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          // Check if it's the last item in the breadcrumbs
          const isLastItem = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-2">
              {/* Render a clickable link for all items except the last one (Prevents the current page from being a link) */}
              {item.href && !isLastItem ? (
                <Link to={item.href} className="hover:text-[#0066FF]">
                  <span className="inline-flex items-center gap-1.5">
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    {item.label}
                  </span>
                </Link>
              ) : (
                // Render the last item as plain text (indicating the current page)
                <span className="inline-flex items-center gap-1.5 text-gray-700">
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  {item.label}
                </span>
              )}

              {!isLastItem && <ChevronRight className="h-3.5 w-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
