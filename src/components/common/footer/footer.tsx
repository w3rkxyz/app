import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="footer-section pb-[16px] sm:pb-[24px] sm:pt-0 w-full px-[156px] sm:px-0 bg-transparent">
      <div className="custom-container w-full">
        <div className="footer-wrapper flex sm:flex-col sm:gap-[12px] sm:align-middle items-center relative w-full">
          <p className="foot-copyright-text text-center absolute sm:relative w-full sm:w-fit sm:pl-0 sm:ml-0 px-auto font-primary font-semibold text-[12px] text-black">
            2024 w3rk. All Rights Reserved.
          </p>
          <ul className="socials-widgets ml-auto sm:ml-0 flex items-center gap-[17px] sm:gap-[11px]">
            <li className="socials-widgets-item">
              <a href="/">
                <Image
                  src="/images/twitter-fo.svg"
                  alt="socials icons image"
                  className="w-[33px] sm:w-5 h-[33px] sm:h-5"
                  width={33}
                  height={33}
                />
              </a>
            </li>
            <li className="socials-widgets-item">
              <a href="/">
                <Image
                  src="/images/instagrame-fo.svg"
                  alt="socials icons image"
                  className="w-[33px] sm:w-5 h-[33px] sm:h-5"
                  width={33}
                  height={33}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
