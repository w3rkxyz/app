import HomeBanner from "@/components/banner/home-banner";
import CtaSection from "@/components/cta-section/cta";
import OurTechnology from "@/components/our-technology/our-technology";
import React from "react";

const HomePage = () => {
  return (
    <>
      <HomeBanner />
      <OurTechnology />
      <CtaSection />
    </>
  );
};

export default HomePage;
