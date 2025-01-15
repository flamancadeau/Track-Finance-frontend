import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-gray-800 text-white h-screen ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex justify-between items-center p-4">
        <h1 className={`font-bold ${isOpen ? 'text-xl' : 'text-xs'}`}>
          {isOpen ? 'My Finance App' : 'MFA'}
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-8">
        <SidebarItem icon="🏠" text="Home" isOpen={isOpen} to="/" />
        {/* Transaction List removed from dropdown */}
        <SidebarItem icon="📋" text="Transaction List" isOpen={isOpen} to="/list" />
        <SidebarItem icon="💰" text="Track Transaction" isOpen={isOpen} to="/transaction" />
        <SidebarItem icon="📊" text="Budget" isOpen={isOpen} to="/budget" />
        <SidebarItem icon="📄" text="Report" isOpen={isOpen} to="/report" />
      </nav>

      <div className="">
        <SidebarItem icon="🚪" text="Logout" isOpen={isOpen} to="/login" />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, isOpen, to }) => (
  <Link to={to} className="flex items-center p-4 hover:bg-gray-700 transition-colors duration-200">
    <span className="text-lg mr-4">{icon}</span>
    {isOpen && <span>{text}</span>}
  </Link>
);

export default Sidebar;
