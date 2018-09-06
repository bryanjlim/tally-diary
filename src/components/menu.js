import React from 'react';
import { Link } from 'react-router-dom';
import './menu.scss';

export const Menu = () =>
    <nav className="menu">
        <Link to="/">
            Sign In
        </Link>
        <Link to="/add-entry">
            New Entry
        </Link>
        <Link to="/timeline">
            My Entries
        </Link>
        <Link to="/settings">
            Settings
        </Link>
    </nav>