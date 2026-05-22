import { Link, useNavigate } from "react-router-dom";
import { Droplets, Grid3X3, ImagePlus, Leaf, LogOut, User } from "lucide-react";

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
          <Leaf size={28} />
          <span>PlantCare</span>
        </Link>

        <nav className="nav">
          <Link to="/gallery" className="nav-link">
            <Grid3X3 size={20} />
            <span>Галерея</span>
          </Link>

          <Link to="/recognize" className="nav-link">
            <ImagePlus size={20} />
            <span>Распознать</span>
          </Link>

          <Link to="/care" className="nav-link">
            <Droplets size={20} />
            <span>Полив</span>
          </Link>

          <Link to="/profile" className="nav-link">
            <User size={20} />
            <span>Профиль</span>
          </Link>
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