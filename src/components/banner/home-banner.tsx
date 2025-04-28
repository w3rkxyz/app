"use client";
import Image from "next/image";
import React from "react";
import { Connect } from "../common/header/connectButton";
import Footer from "../common/footer/footer";

const HomeBanner = () => {
  return (
    <div className="banner-section pt-[269px] sm:pt-[192px] home-banner absolute top-0 left-0">
      <div className="custom-container">
        <div className="banner-wrapper max-w-[1156px] mx-auto relative">
          <div className="banner-modal banner-modal-top">
            {/* modal image container 2 */}
            <div className="profile-box absolute left-[179px] top-[-124px] sm:top-[-109px] sm:left-[44px] rounded-[8px] sm:rounded-[5px] py-[9px] px-[14px] sm:py-[5.63px] sm:px-[8.76px]">
              {/* <div> */}
              <Image
                src="/images/Lenshead_1.svg"
                alt="banner modal image items"
                className="sm:w-[32px] sm:h-[32px] mb-[8px] pt-[3px] sm:mb-[4.5px] sm:pt-[2px]"
                width={50}
                height={50}
              />
              <p className="profile-title px-[14px] rounded-[4px] text-[10px] sm:rounded-[2.5px] sm:text-[7px] sm:px-[8.5px]">
                Marketer
              </p>
              {/* </div> */}
            </div>

            {/* modal image container 3 */}
            <div className="profile-box absolute top-[-90px] right-0 sm:top-[-102px] sm:right-[40px] rounded-[12px] sm:rounded-[7.51px] py-[20px] px-[24px] sm:py-[11px] sm:px-[15px] ">
              <div className="flex justify-center items-center mb-[8px] sm:mb-[7.8px]">
                <Image
                  src="/images/Lenshead_3.svg"
                  alt="banner modal image items"
                  className="sm:w-[42.55px] sm:h-[42.55px] "
                  width={68}
                  height={68}
                />
              </div>
              <p className="profile-title rounded-[4px] text-[10px] py-[2px] px-[20px] sm:rounded-[2.5px] sm:text-[6.26px] sm:py-[1.25px] sm:px-[11.89px]">
                Copywriter
              </p>
            </div>
          </div>

          <div className="banner-cont-box text-center">
            <h1 className="banner-title max-w-[705px] mx-auto mb-[24px] sm:mb-4 text-[#120037]">
              {/* The <span className="text-primary">Web 3.0 </span> <br />
              Freelancing Marketplace */}
              Discover <span className="text-gradient">decentralized</span> <br />
              freelancing & hiring
            </h1>
            <p className="banner-desc max-w-[570px] sm:max-w-[350px] sm:mb-6 mx-auto mb-[24px] text-[18px] text-center font-medium sm:font-normal md:text-[16px] font-secondary tracking-[.01em] leading-[24px] sm:leading-[19.5px] text-[#000000] text-[400] sm:hidden">
              Empowering decentralized freelancing within the SocialFi ecosystem. Proudly bridging
              global businesses with exceptional professionals who embrace cryptocurrency payments.
            </p>
            <p className="banner-desc max-w-[620px] sm:max-w-[350px] sm:mb-[46px] mx-auto mb-[24px] text-[18px] text-center font-medium sm:font-normal md:text-[16px] font-secondary tracking-[.01em] leading-[24px] sm:leading-[19.5px] text-[#000000] hidden sm:block">
              Empowering decentralized freelancing within the SocialFi ecosystem. <br /> Proudly
              bridging global businesses with exceptional professionals who embrace cryptocurrency
              payments.
            </p>
            {/* <button type="button" className="button-primary">
              Connect Wallet
            </button> */}
            <Connect />
          </div>
          <div className="banner-modal banner-modal-bottom">
            {/* modal image container 4 */}
            <div className="profile-box absolute right-[55px] bottom-[-111px] sm:bottom-[-192px] sm:right-[22px] sm:object-contain rounded-[20px] sm:rounded-[12.52px] p-[20px] sm:px-[12.51px] sm:py-[7.51px]">
              <div className="">
                <div className="flex justify-center items-center mb-[19px] sm:mb-[11.26px] sm:pt-[12px]">
                  <Image
                    src="/images/Lenshead_4.svg"
                    alt="banner modal image items"
                    className="sm:w-[68.83px] sm:h-[68.83px] "
                    width={110}
                    height={110}
                  />
                </div>
                <p className="profile-title rounded-[8px] text-[14px] py-[6px] px-[11px] sm:rounded-[5px] sm:text-[8.76px] sm:py-[3.75px] sm:px-[6.8px]">
                  Full-Stack Developer
                </p>
              </div>
            </div>

            {/* modal image container 5 */}
            <div className="profile-box absolute left-[100px] bottom-[-161px] sm:bottom-[-138px] sm:left-8 sm:object-contain rounded-[16px] sm:rounded-[10px] px-[16px] py-[21px] sm:px-[10px] sm:py-[13px]">
              <div>
                <div className="flex justify-center items-center mb-[16px] sm:mb-[7px]">
                  <Image
                    src="/images/Lenshead_2.svg"
                    alt="banner modal image items"
                    className="sm:w-[60.07px] sm:h-[60.07px] "
                    width={96}
                    height={96}
                  />
                </div>
                <p className="profile-title rounded-[8px] text-[12px] py-[6px] px-[12px] sm:rounded-[5px] sm:text-[7.51px] sm:py-[3.75px] sm:px-[7.51px]">
                  Blockchain Developer
                </p>
              </div>
            </div>

            {/* modal image container 1 */}
            <div className="profile-box absolute left-[10px] bottom-[133px] sm:bottom-[-250px] sm:left-[115px]  rounded-[12px] sm:rounded-[7.51px] px-[10px] py-[13px] sm:px-[6.26px] sm:py-[8.13px]">
              <div>
                <div className="flex justify-center items-center mb-[13px] sm:mb-[7px]">
                  <Image
                    src="/images/Lenshead_5.svg"
                    alt="banner modal image items"
                    className="sm:w-[37.54px] sm:h-[37.54px] "
                    width={60}
                    height={60}
                  />
                </div>
                <p className="profile-title rounded-[4px] text-[10px] py-[2px] px-[9px] sm:rounded-[2.5px] sm:text-[6.26px] sm:py-[1.25px] sm:px-[5.63px]">
                  Graphic Designer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
