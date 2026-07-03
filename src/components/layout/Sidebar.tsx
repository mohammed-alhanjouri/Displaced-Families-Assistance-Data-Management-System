// Sidebar component for navigation links

import {
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  links: {
    name: string;
    href: string;
  }[];
}

const routeIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/data-entry-dashboard": LayoutDashboard,
  "/global-search": Search,
  "/local-search": Search,
  "/reports": FileText,
  "/register-family": ClipboardPlus,
  "/user-management": UsersRound,
  "/roles-permissions": ShieldCheck,
  "/logout": LogOut,
};

const Sidebar = ({ links }: SidebarProps) => {
  return (
    <aside className="border-b border-gray-200 bg-white shadow-sm md:fixed md:bottom-0 md:left-0 md:top-[88px] md:w-64 md:border-b-0 md:border-r">
      <nav className="p-4">
        <ul className="flex gap-3 overflow-x-auto md:block md:space-y-2">
          {links.map((link) => {
            const Icon = routeIcons[link.href] ?? LayoutDashboard;

            return (
              <li key={link.href}>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-[#0066FF] ${
                      isActive ? "bg-blue-50 text-[#0066FF]" : ""
                    }`
                  }
                  to={link.href}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
