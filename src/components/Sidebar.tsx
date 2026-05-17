// Sidebar component for navigation links

interface SidebarProps {
  links: { name: string; href: string }[];
}

const Sidebar = ({ links }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white border-r-2 border-gray-300 shadow-sm rounded-lg">
      <nav className="p-4">
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="block text-gray-800 hover:text-[#0066FF] font-medium"
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
