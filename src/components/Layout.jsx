import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Sprout, User } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/gallery" className="logo">
          <Leaf size={26} fill="currentColor" />
          <span>PlantCare</span>
        </Link>

        <nav className="nav">
          <NavLink to="/gallery" className="nav-link">
            <Sprout size={20} />
            <span>Мои растения</span>
          </NavLink>

          <NavLink to="/profile" className="nav-link">
            <User size={20} />
            <span>Профиль</span>
          </NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
