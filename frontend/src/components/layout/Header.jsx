import { useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const titleMap = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/my-tasks": "My Tasks",
};

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getTitle = () => {
    if (location.pathname.startsWith("/projects/")) return "Project Details";
    return titleMap[location.pathname] || "ProjectFlow";
  };

  return (
    <header className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-base font-semibold text-slate-900">{getTitle()}</h1>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="hidden sm:inline">
          Welcome back, <span className="font-medium text-slate-800">{user?.name?.split(" ")[0]}</span>
        </span>
      </div>
    </header>
  );
};

export default Header;
