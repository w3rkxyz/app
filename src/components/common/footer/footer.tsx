import Image from "next/image";
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer-section mt-auto pb-[4px] sm:pb-[8px] sm:pt-0 w-full px-[156px] sm:px-0 bg-transparent ">
      <div className="custom-container w-full">
        <div className="footer-wrapper flex sm:flex-col sm:gap-[12px] sm:align-middle items-center relative w-full bg-transparent">
          <p className="foot-copyright-text text-center absolute sm:relative w-full sm:w-fit sm:pl-0 sm:ml-0 px-auto font-primary font-semibold text-[12px] text-black -z-10 bg-transparent">
            2024 w3rk. All Rights Reserved.
          </p>
          <ul className="socials-widgets ml-auto sm:ml-0 flex items-center gap-[17px] sm:gap-[11px] bg-transparent">
            <li className="socials-widgets-item cursor-pointer">
              <Link href="https://twitter.com/w3rkxyz" target="_blank">
                <Image
                  src="/images/twitter-fo.svg"
                  alt="socials icons image"
                  className="w-[33px] sm:w-5 h-[33px] sm:h-5 cursor-pointer"
                  width={33}
                  height={33}
                />
              </Link>
            </li>
            <li className="socials-widgets-item cursor-pointer">
              <Link href="https://t.me/w3rkxyz" target="_blank">
                <Image
                  src="/images/instagrame-fo.svg"
                  alt="socials icons image"
                  className="w-[33px] sm:w-5 h-[33px] sm:h-5"
                  width={33}
                  height={33}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
