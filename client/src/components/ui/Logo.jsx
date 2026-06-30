// Logo.jsx — renders the PrepEdge logo image. Used in both the Navbar and Footer.
// The className prop lets callers control size (default is overridden by usage sites).
import React from 'react';
import LogoImage from "../../assets/Logo1.png";

function Logo({ className = "w-96 h-96" }) {
  return (
    <img src={LogoImage} alt="PrepEdge Logo" className={className} />
  );
}

export default Logo;