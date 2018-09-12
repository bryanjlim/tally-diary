import React from 'react';
import { NavLink } from 'react-router-dom';
import './menu.css';

export const Menu = () =>
    <nav className="menu">
        <NavLink exact to="/">
            New Entry
        </NavLink>
        <NavLink to="/timeline">
            My Entries
        </NavLink>
        <NavLink to="/insights">
            Insights
        </NavLink>
        <NavLink to="/settings">
            Settings
        </NavLink>
    </nav>