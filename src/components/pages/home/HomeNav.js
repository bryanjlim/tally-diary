import React from 'react';
import { Link } from 'react-router-dom';
import './HomeNav.scss';

export const HomeNav = () =>
    <nav className="homeNav">
        <Link to="/">
            LOGO HERE
        </Link>
        <Link to="/">
            Get Started
        </Link>
        <Link to="/aboutus">
            About Us
        </Link>
        <Link to="/contact">
            Contact
        </Link>
    </nav>