import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Study Notes Summarizer</Link>
      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/history" className="navbar-link">History</Link>
            <span className="navbar-user">{user.email}</span>
            <button type="button" className="navbar-link" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Log in</Link>
            <Link to="/signup" className="navbar-link navbar-cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}