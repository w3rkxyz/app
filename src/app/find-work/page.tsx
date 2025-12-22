"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Dynamically import FindWork to enable code splitting and faster initial load
const FindWork = dynamic(() => import("@/views/find-work/find-work"), {
  loading: () => (
    <div className="find-work-section pt-[82px] md:pt-[120px] sm:pt-[60px] mb-[20px]">
      <div className="custom-container">
        <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 w-full flex-col gap-[16px]">
          <Skeleton className="h-[208px] w-full rounded-[16px]" baseColor="#E4E4E7" />
          <Skeleton className="h-[208px] w-full rounded-[16px]" baseColor="#E4E4E7" />
        </div>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for faster initial render
});

export default function FindWorkPage() {
  return (
    <Suspense fallback={
      <div className="find-work-section pt-[82px] md:pt-[120px] sm:pt-[60px] mb-[20px]">
        <div className="custom-container">
          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 w-full flex-col gap-[16px]">
            <Skeleton className="h-[208px] w-full rounded-[16px]" baseColor="#E4E4E7" />
          </div>
        </div>
      </div>
    }>
      <FindWork />
    </Suspense>
  );
}
