// Header navigation component

interface HeaderNavProps {
  user: {
    name: string;
    role: string;
  } | null;
}

const HeaderNav = ({ user }: HeaderNavProps) => {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-300 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-bold text-gray-800 md:text-xl">
          Displaced Families Assistance and Data Management System
        </div>
        <div className="flex flex-wrap items-center gap-4">
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
    </header>
  );
};

export default HeaderNav;
