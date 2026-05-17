// Header navigation component

interface HeaderNavProps {
  user: {
    name: string;
    role: string;
  } | null;
}

const HeaderNav = ({ user }: HeaderNavProps) => {
  return (
    <nav className="w-full bg-white border-b-2 border-gray-300 rounded-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">
          Displaced Families Assistance and Data Management System
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                User:
                <span className="font-semibold text-[#0066FF]">
                  {" "}
                  {user.name}
                </span>{" "}
              </span>
              <span className="text-sm text-gray-600">
                Role:
                <span className="font-semibold text-[#0066FF]">
                  {" "}
                  {user.role}
                </span>
              </span>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm text-[#0066FF] hover:text-blue-700"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;
