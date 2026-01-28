import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => (
  <Link to="/" className={`flex flex-col items-start leading-none ${className}`}>
    <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">KAMAU</span>
    <div className="flex items-center gap-1 -mt-0.5">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-900">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7V17M15 9H11C10.4477 9 10 9.44772 10 10V10C10 10.5523 10.4477 11 11 11H13C13.5523 11 14 11.4477 14 12V12C14 12.5523 13.5523 13 13 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M2 12H5M3 15H5M3 9H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="text-lg font-extrabold text-orange-500 uppercase tracking-tight">NEPAL</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900 animate-[spin_8s_linear_infinite]">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 0-2-2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </div>
  </Link>
);

export default Logo;
