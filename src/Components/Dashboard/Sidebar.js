import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CurrencyDollarIcon, SwitchHorizontalIcon, DocumentReportIcon } from '@heroicons/react/solid';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Default to expanded on larger screens
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // Set up a window resize listener to detect screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {  // md screen size and below
        setIsSmallScreen(true);
        setIsOpen(false);  // Automatically minimize the sidebar on small screens
      } else {
        setIsSmallScreen(false);
        setIsOpen(true);   // Keep the sidebar open on larger screens
      }
    };

    // Initial check on page load
    handleResize();

    // Add event listener for resizing the window
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`bg-gray-800 text-white h-screen bottom-0 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex justify-between items-center p-4">
        <h1 className={`font-bold ${isOpen ? 'text-xl' : 'text-xs'}`}>
          {isOpen ? 'My Finance App' : 'MFA'}
        </h1>
        {!isSmallScreen && (
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
        )}
      </div>

      <nav className="mt-8">
        <div className={`bg-gray-800 text-white h-screen ${isOpen ? 'w-64' : 'w-20'}`}>
          <nav className="mt-8">
            <SidebarItem icon={<HomeIcon className="h-6 w-6" />} text="Home" isOpen={isOpen} to="/" />
            <SidebarItem icon={<CurrencyDollarIcon className="h-6 w-6" />} text="Budget" isOpen={isOpen} to="/budget" />
            <SidebarItem icon={<SwitchHorizontalIcon className="h-6 w-6" />} text="Track Transaction" isOpen={isOpen} to="/transaction" />
            <SidebarItem icon={<DocumentReportIcon className="h-6 w-6" />} text="Report" isOpen={isOpen} to="/report" />
          </nav>
        </div>
      </nav>
    </div>
  );
};

const SidebarItem = ({ icon, text, isOpen, to }) => {
  const location = useLocation();

  // Check if the current path matches the SidebarItem 'to' path
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center p-4 hover:bg-gray-700 transition-colors duration-200 ${isActive ? 'bg-gray-600' : ''
        }`}
    >
      <span className="text-lg mr-4">{icon}</span>
      {isOpen && <span>{text}</span>}
    </Link>
  );
};

export default Sidebar;
