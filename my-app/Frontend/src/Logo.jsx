import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => (
  <Link to="/" className={`flex items-center gap-3 active:scale-95 transition-transform ${className}`}>
    <img
      src="/kamau.png"
      alt="KAMAU"
      className="h-16 md:h-20 w-auto object-contain"
    />
  </Link>
);

export default Logo;
