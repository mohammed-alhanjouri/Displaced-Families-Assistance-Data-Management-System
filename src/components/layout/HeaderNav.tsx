// Header navigation component

import { LogIn, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-img.png";

interface HeaderNavProps {
  user: {
    name: string;
    role: string;
    location?: string;
  } | null;
}

const HeaderNav = ({ user }: HeaderNavProps) => {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[88px] max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="Awn logo"
            className="h-11 w-11 shrink-0 rounded-xl object-contain ring-1 ring-blue-100"
          />
          <div className="min-w-0">
            <div className="text-lg font-bold text-gray-900 md:text-xl">
              Awn عَــــون
            </div>
            <div className="truncate text-xs font-medium text-gray-500 md:text-sm">
              Displaced Families Assistance and Data Management System
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {user ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <UserRound className="h-4 w-4 text-[#0066FF]" />
                <span className="font-semibold text-gray-900">{user.name}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 text-[#0066FF]" />
                <span className="font-semibold text-gray-900">{user.role}</span>
              </span>
              {user.location && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-[#0066FF]" />
                  <span className="font-semibold text-gray-900">
                    {user.location}
                  </span>
                </span>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
