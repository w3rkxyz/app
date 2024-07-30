"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  handleCloseModal?: () => void;
  type: string;
  closeJobCardModal?: () => void;
};

const ViewJobModal = ({ handleCloseModal, closeJobCardModal, type }: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: any) {
      console.log("Was cliked");
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
        if (handleCloseModal) {
          handleCloseModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white nav-space sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""}`}
      ref={myDivRef}
    >
      <div
        className="hidden w-full sm:flex justify-end px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-tl-[12px] rounded-tr-[12px]"
        onClick={handleCloseModal}
      >
        <Image
          src="/images/Close.svg"
          alt="close icon"
          width={20}
          height={20}
        />
      </div>
      <div className="bg-[white] rounded-[12px] sm:rounded-none p-[16px] sm:w-full max-w-[750px] flex flex-col">
        <div className="flex justify-between align-top mb-[18px]">
          <div className="flex gap-[16px]">
            <Image
              src={`/images/${type === "job" ? "werk.svg" : "paco.svg"}`}
              alt="w3rk logo"
              className="sm:w-[60px] sm:h-[60px]"
              width={64}
              height={64}
            />
            <div className="flex flex-col gap-[5px] pt-[5px]">
              <span className="text-[16px] sm:text-[14px] leading-[16.94px] font-semibold">
                Display Name
              </span>
              <span className="text-[16px] sm:text-[14px] leading-[16.94px] font-semibold">
                Job Title
              </span>
              <span className="text-[#707070] text-[14px] sm:text-[12px] leading-[14.52px] font-semibold">
                {type === "job" ? "$0.00 - Fixed Price" : "$0.00 /hr"}
              </span>
            </div>
          </div>
          {type === "job" ? (
            <button className="flex align-middle items-center gap-[5px] text-[white] leading-[12.1px] text-[14px] font-semibold py-[5.4px] px-[17px] bg-[#C6AAFF] rounded-[4px] h-fit">
              <span>Job</span>
              <Image
                src="/images/case.svg"
                alt="suitcase icon"
                width={14}
                height={14}
              />
            </button>
          ) : (
            <button className="flex align-middle items-center gap-[5px] text-[white] leading-[12.1px] text-[14px] font-semibold py-[5.4px] px-[17px] bg-[#351A6B] rounded-[4px] h-fit">
              <span>Service</span>
              <Image
                src="/images/service.svg"
                alt="suitcase icon"
                width={14}
                height={14}
              />
            </button>
          )}
        </div>
        <p className="leading-[16.94px] text-[18px] sm:text-[16px] font-semibold mb-[16px]">
          Website Updates - Full Stack Developer
        </p>
        {type === "job" ? (
          <div className="width-full rounded-[12px] leading-[19.52px] sm:leading-[16.52px] font-normal text-[16px] sm:text-[12px] border-[1px] border-[#E4E4E7] p-[13px] pb-[90px] sm:p-[9px] sm:pb-[10px] mb-[18px]">
            We are seeking an experienced Full Stack Developer to help us update
            and enhance our website. The ideal candidate will have a strong
            background in both front-end and back-end development, with a keen
            eye for detail and a passion for creating seamless user experiences.
            You will be responsible for implementing new features, optimizing
            performance, and ensuring the website remains secure and up-to-date.
            <br />
            <br />
            Responsibilities:
            <br />
            * Collaborate with our team to understand project requirements and
            goals.
            <br />
            * Develop and implement new features and functionalities.
            <br />
            * Optimize website performance and loading times.
            <br />
            * Ensure cross-browser compatibility and responsiveness.
            <br />* Troubleshoot and resolve any issues or bugs.
          </div>
        ) : (
          <div className="width-full rounded-[12px] leading-[19.52px] sm:leading-[16.52px] font-normal text-[16px] sm:text-[12px] border-[1px] border-[#E4E4E7] p-[9px] pb-[10px] mb-[18px]">
            ​I have 3+ years of experience specializing in UI/UX
            <br />
            <br />
            Design which involves mostly working on responsive websites and
            mobile apps for iOS and Android. I enjoy working with passionate
            people on exciting digital projects and have had the opportunity to
            work with both large and small brands.
            <br />
            <br />
            Why should you work with me?
            <br />
            I can help you to convert your ideas and project goals into
            products, from wireframes to prototype stage. I will find the best
            design solutions to resolve all your problems in the most creative
            way. I believe thoughtful design equals a more effective product or
            service, it also reinforces your brand values and builds an
            emotional connection with your users.
            <br />
            <br />
            MY SKILLS
            <br />
            💎 UX/UI: Web design
            <br />
            💎 UI/UX: Mobile Design
          </div>
        )}
        <div className="flex gap-[16px] sm:gap-[10px] align-middle mb-[20px] sm:mb-[14px]">
          <span className="text-[17px] sm:text-[16px] font-medium font-secondary  tracking-[-1%] text-[#000000] sm:hidden">
            Paid in:
          </span>
          <span className="text-[17px] sm:text-[16px] font-medium font-secondary  tracking-[-1%] text-[#000000] hidden sm:block">
            Accepts:
          </span>
          <ul className="socials-widgets gap-[5px] flex">
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px] h-[26px] sm:w-[24px] sm:h-[24px] bg-[#F7931A] p-1 rounded-full"
                  src="/images/token-1.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/token2.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/token3.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/bnb.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/solana.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/usdt.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/dai.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/green-coin.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
            <li className="socials-widgets-items">
              <a href="/">
                <Image
                  className="w-[26px]  h-[26px] sm:w-[24px] sm:h-[24px]"
                  src="/images/bw-coin.svg"
                  alt="socials icons images"
                  width={26}
                  height={26}
                />
              </a>
            </li>
          </ul>
        </div>
        <div className="flex gap-[18px] sm:flex-col sm:gap-[10px] justify-between sm:justify-start mb-[24px]">
          <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] flex-1 sm:px-[70px] sm:w-fit">
            Tag Name
          </button>
          <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] flex-1 sm:px-[70px] sm:w-fit">
            Tag Name
          </button>
          <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] flex-1 sm:px-[70px] sm:w-fit">
            Tag Name
          </button>
        </div>
        <button className="mx-auto w-fit py-[9px] px-[26px] tx-[18px] Sm:py-[8px] sm:px-[23px] tx-[14px] leading-[14.5px] text-white bg-[#C6AAFF] rounded-[9px] sm:rounded-[8px] font-semibold mb-[8px]">
          Contact
        </button>
      </div>
    </div>
  );
};

export default ViewJobModal;
