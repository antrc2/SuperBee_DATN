// src/components/Admin/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-center text-sm py-3 mt-auto">
      © {new Date().getFullYear()} SuperBee Admin. All rights reserved.
    </footer>
  );
};

export default Footer;
