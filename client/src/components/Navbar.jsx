import { User, Mail, Lock, Menu, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Logo from "./ui/Logo";
import {Link} from "react-router-dom";

export default function Navbar() {
  // State for mobile menu toggle in the navigation bar.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <nav className="bg-blue-50 px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Logo className="w-10 h-10 text-blue-600"/>
            <div className="text-gray-800 text-2xl font-bold mx-4 ml-2">
              <p className="text-black inline">Prep</p>
              <p className="text-blue-700 inline">Edge</p>
            </div>
          </Link>

          <div className="hidden sm:flex items-center">
            <a href="/courses" className="text-gray-800 mx-4 cursor-pointer">
              Courses
            </a>
            <a href="/mock-tests" className="text-gray-800 mx-4 cursor-pointer">
              Mock Tests
            </a>
            <a href="/about" className="text-gray-800 mx-4 cursor-pointer">
              About
            </a>
            <a href="/help" className="text-gray-800 mx-4 cursor-pointer">
              Help
            </a>
          </div>

          <div className="hidden sm:flex ml-auto items-center">
            <a
              href="/login"
              className="bg-gray-200 text-gray-800 mx-2 border-gray-300 rounded-4xl py-1 px-4 hover:bg-gray-300 [box-shadow:0_2px_6px_rgba(0,0,255,0.2)] text-center transition-all duration-200"
            >
              Login
            </a>
            <a
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mx-2 border-blue-500 rounded-4xl py-1 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] text-center transition-all duration-200"
            >
              Sign Up
            </a>
          </div>

          <button
            className="sm:hidden ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden flex flex-col mt-4 px-2 pb-2">
            <a
              href="/courses"
              className="text-gray-800 py-2 border-b border-gray-200"
            >
              Courses
            </a>
            <a
              href="/mock-tests"
              className="text-gray-800 py-2 border-b border-gray-200"
            >
              Mock Tests
            </a>
            <a
              href="/about"
              className="text-gray-800 py-2 border-b border-gray-200"
            >
              About
            </a>
            <a
              href="/help"
              className="text-gray-800 py-2 border-b border-gray-200"
            >
              Help
            </a>
            <a
              href="/login"
              className="bg-gray-200 text-gray-800 mt-4 rounded-4xl py-2 px-4 [box-shadow:0_2px_6px_rgba(0,0,255,0.2)] transition-all duration-200"
            >
              Login
            </a>
            <a
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mt-3 rounded-4xl py-2 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] transition-all duration-200"
            >
              Sign Up Free
            </a>
          </div>
        )}
      </nav>
    </>
  );
}
