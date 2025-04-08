import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = ({ role, handleLogout, evaluationData }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="main-navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to={role === 'admin' ? "/admin" : "/dashboard"}>
                        <span className="logo-text">Interview<span className="accent">AI</span></span>
                    </Link>
                </div>

                <div className="menu-toggle" onClick={toggleMenu}>
                    <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                    {role === 'admin' && (
                        <li className={isActive('/admin')}>
                            <Link to="/admin" onClick={closeMenu}>
                                <i className="fas fa-tachometer-alt"></i> Dashboard
                            </Link>
                        </li>
                    )}

                    {role !== 'admin' && (
                        <li className={isActive('/dashboard')}>
                            <Link to="/dashboard" onClick={closeMenu}>
                                <i className="fas fa-th-large"></i> Dashboard
                            </Link>
                        </li>
                    )}

                    {evaluationData && (
                        <li className={isActive('/results')}>
                            <Link to="/results" onClick={closeMenu}>
                                <i className="fas fa-chart-bar"></i> Results
                            </Link>
                        </li>
                    )}

                    {role === 'admin' && (
                        <li className={isActive('/test-evaluation')}>
                            <Link to="/test-evaluation" onClick={closeMenu}>
                                <i className="fas fa-vial"></i> Test System
                            </Link>
                        </li>
                    )}

                    <li className="divider"></li>

                    <li className="profile-dropdown">
                        <div className="profile-menu">
                            <button onClick={handleLogout} className="logout-button">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar; 