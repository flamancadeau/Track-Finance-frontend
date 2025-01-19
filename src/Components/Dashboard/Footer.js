import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[rgb(31,41,55)] text-white py-4 fixed bottom-0 w-full">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <p className="text-sm mb-2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
        <div className="text-xs flex items-center gap-2">
          <span>Follow us on:</span>
          <div className="flex items-center gap-2">
            <a 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Facebook
            </a>
            <span>•</span>
            <a 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Twitter
            </a>
            <span>•</span>
            <a 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;