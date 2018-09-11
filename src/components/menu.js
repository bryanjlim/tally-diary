import React from 'react';
import { Link } from 'react-router-dom';
import './menu.css';

export const Menu = () =>
    <nav className="menu">
        <Link to="/">
            New Entry
        </Link>
        <Link to="/timeline">
            My Entries
        </Link>
        <Link to="/insights">
            Insights
        </Link>
        <Link to="/settings">
            Settings
        </Link>
    </nav>