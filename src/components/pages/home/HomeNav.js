import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './homeNav.css';

export const HomeNav = () =>
    <nav className="homeNav">
        <Link to="/">
            LOGO HERE
        </Link>
        <NavLink exact to="/">
            Get Started
        </NavLink>
        <NavLink to="/aboutus">
            About Us
        </NavLink>
        <NavLink to="/contact">
            Contact
        </NavLink>
    </nav>