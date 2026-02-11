"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Connect } from "./connectButton";

const Navbar = () => {
  return (
    <header className="header-section h-[60px] px-[156px] sm:px-[16px] absolute w-full top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[98]">
      <div className="custom-container">
        <div className="header-wrapper">
          <nav className="navbar-nav-main flex items-center gap-3 justify-between h-[60px] w-full">
            <div className="header-brand-box sm:flex sm:items-center">
              <Link href="/">
                <Image
                  src="/images/brand-logo.svg"
                  className="relative h-[80px] w-[80px] translate-y-[5px]"
                  width={80}
                  height={80}
                  alt="company brand logo"
                />
              </Link>
            </div>
            <div className="navbar-right-cont">
              <Connect />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
