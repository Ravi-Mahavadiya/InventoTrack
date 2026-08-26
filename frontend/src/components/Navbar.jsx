import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, LayoutDashboard, Terminal } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="brand">
          <Terminal size={24} />
          <span>StarterKit</span>
        </Link>
        
        {user && (
          <nav className="nav-links">
            <Link to="/" className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
              <User size={16} />
              <span>Profile</span>
            </Link>
            <div className="nav-user">
              Hi, <strong>{user.name}</strong>
            </div>
            <button onClick={handleLogout} className="icon-btn" title="Log Out" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <LogOut size={18} className="icon-btn-delete" />
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
