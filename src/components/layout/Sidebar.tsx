// Sidebar component for navigation links

interface SidebarProps {
  links: { name: string; href: string }[];
}

const Sidebar = ({ links }: SidebarProps) => {
  return (
    <aside className="border-b border-gray-300 bg-white shadow-sm md:fixed md:bottom-0 md:left-0 md:top-[73px] md:w-64 md:border-b-0 md:border-r">
      <nav className="p-4">
        <ul className="flex gap-3 overflow-x-auto md:block md:space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block whitespace-nowrap rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-blue-50 hover:text-[#0066FF]"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
