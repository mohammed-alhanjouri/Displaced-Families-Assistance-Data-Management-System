import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}
const Breadcrumb = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          // Check if it's the last item in the breadcrumbs
          const isLastItem = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-2">
              {/* Render a clickable link for all items except the last one (Prevents the current page from being a link) */}
              {item.href && !isLastItem ? (
                <Link to={item.href} className="hover:text-[#0066FF]">
                  {item.label}
                </Link>
              ) : (
                // Render the last item as plain text (indicating the current page)
                <span className="text-gray-700">{item.label}</span>
              )}

              {!isLastItem && <span>{">"}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
