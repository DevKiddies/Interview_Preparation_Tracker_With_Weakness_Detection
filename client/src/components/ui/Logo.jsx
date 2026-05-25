// src/components/ui/Logo.jsx
import React from 'react';
import LogoImage from "../../assets/Logo1.png"; // Adjust the path as necessary

function Logo({ className = "w-96 h-96" }) {
  return (
    <img src={LogoImage} alt="PrepEdge Logo" className={className} />
  );
}

export default Logo;