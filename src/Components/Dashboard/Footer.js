import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[rgb(31,41,55)] text-white py-4 absolute bottom-0 w-full mt-72">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}  All rights reserved.
        </p>
        <p className="text-xs">
          Follow us on:
          <a href="/facebook" className="text-blue-400 hover:underline ml-1">Facebook</a>,
          <a href="/twitter" className="text-blue-400 hover:underline ml-1">Twitter</a>,
          <a href="/instagram" className="text-blue-400 hover:underline ml-1">Instagram</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;