import React from 'react';
import Image from 'next/image';
import CustomConnectButton from './customConnect';
import { ConnectButton } from '@rainbow-me/rainbowkit';


interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  return (
    <nav className={`
      bg-white 
      border-b border-slate-200 
      shadow-sm 
      sticky 
      top-0 
      z-50 
      backdrop-blur-sm 
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section - Left */}
          <div className="flex items-center">
            <a 
              href="/" 
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/exchange.svg"
                alt="Exchange Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10"
                priority
              />
              <span className="ml-3 text-xl font-semibold text-slate-900 hidden sm:block">
              𝙲𝚘𝚒𝚗 𝙴𝚡𝚌𝚑𝚊𝚗𝚐𝚎
              </span>
            </a>
          </div>

          {/* Navigation Links - Center (Optional) */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#trade" 
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
            >
            </a>
          </div>

          {/* Connect Button - Right */}
          <div className="flex items-center">
          <CustomConnectButton/>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;