"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { X } from "lucide-react";

interface JobData {
  username: string;
  profileImage: string;
  jobName: string;
  jobIcon: string;
  description: string;
  contractType: string;
  paymentAmount: string;
  paidIn: string;
  tags: string[];
}

interface JobDetailDrawerProps {
  job: JobData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tokenImages: { [key: string]: string } = {
  BTC: "/images/btc.svg",
  ETH: "/images/eth.svg",
  USDT: "/images/usdt.svg",
  USDC: "/images/usdc.svg",
  BNB: "/images/bnb.svg",
  SOL: "/images/solana.svg",
  DAI: "/images/dai.svg",
  GHO: "/images/green-coin.svg",
  BONSAI: "/images/bw-coin.svg",
};

const JobDetailDrawer = ({ job, open, onOpenChange }: JobDetailDrawerProps) => {
  if (!job) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="max-h-[90vh] rounded-t-[12px] bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-[24px] pb-[24px] border-b border-[#C3C7CE] flex-shrink-0">
          <h2
            className="text-[#212121] font-semibold text-[20px] leading-6"
            style={{
              fontFamily: "Inter",
              letterSpacing: "-0.01em",
            }}
          >
            {job.jobName}
          </h2>
          <DrawerClose asChild>
            <button
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5 text-[#212121]" />
            </button>
          </DrawerClose>
        </header>

        {/* Main Content */}
        <main className="p-[24px] overflow-y-auto flex-1">
          {/* Profile Section */}
          <div className="flex items-center gap-[16px] mb-[24px]">
            <Image
              src={job.profileImage}
              alt={job.username}
              width={52}
              height={52}
              className="object-cover w-[52px] h-[52px] flex-shrink-0 rounded-[6.31px]"
              onError={e => {
                (e.target as HTMLImageElement).src = "/images/Lenshead_1.png";
              }}
            />
            <div className="flex flex-col gap-[4px]">
              <p className="text-[16px] font-medium text-[#212121] leading-[20px]">
                {job.username}
              </p>
              <p className="text-[14px] font-medium text-[#6c6c6c] leading-[18px]">
                @{job.username.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div
            className="mb-[16px] pb-[16px] border-b border-[#C3C7CE]"
            style={{ borderBottomWidth: "0.5px" }}
          >
            <p className="text-[16px] text-[#6c6c6c] leading-[24px] whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Budget Section */}
          <div
            className="mb-[16px] pb-[16px] border-b border-[#C3C7CE]"
            style={{ borderBottomWidth: "0.5px" }}
          >
            <h3 className="text-[16px] font-medium text-[#212121] mb-[12px]">Budget</h3>
            <p className="text-[20px] font-bold text-[#212121]">{job.paymentAmount}</p>
            {/* <p className="text-[14px] text-[#707070] mt-[4px]">{job.contractType}</p> */}
          </div>

          {/* Payment Token(s) Section */}
          <div
            className="mb-[16px] pb-[16px] border-b border-[#C3C7CE]"
            style={{ borderBottomWidth: "0.5px" }}
          >
            <h3 className="text-[16px] font-semibold text-[#212121] mb-[12px]">Payment Token(s)</h3>
            <div className="flex flex-wrap gap-[8px]">
              {job.paidIn && tokenImages[job.paidIn] ? (
                <div className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[#F2F2F2] rounded-full">
                  <Image
                    src={tokenImages[job.paidIn]}
                    alt={job.paidIn}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-[13px] font-medium text-[#323232]">${job.paidIn}</span>
                </div>
              ) : (
                <div className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[#F2F2F2] rounded-full">
                  <span className="text-[14px] font-medium text-[#323232]">{job.paidIn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          {job.tags && job.tags.length > 0 && (
            <div className="mb-[16px] pb-[16px]">
              <h3 className="text-[16px] font-semibold text-[#212121] mb-[12px]">Tags</h3>
              <div className="flex flex-wrap gap-[4px]">
                {job.tags
                  .filter(tag => tag !== "[tag]" && tag.trim() !== "")
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center justify-center rounded-[1000px] bg-[#F2F2F2] text-[13px] font-medium leading-[20px] text-[#323232] align-middle pt-[6px] pr-3 pb-[6px] pl-3 tracking-normal"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-[24px] pt-[16px] border-t border-[#C3C7CE] flex-shrink-0">
          <div className="flex justify-end">
            <Link
              href={`/messages?handle=${job.username.toLowerCase().replace(/\s+/g, "-")}`}
              className="block"
            >
              <button
                className="h-[40px] rounded-[1000px] transition-colors flex items-center justify-center py-2 px-4 bg-[#FFECEC] gap-1 text-[#D50000] font-medium text-sm leading-6 tracking-normal align-middle"
                style={{
                  fontFamily: "Inter",
                }}
              >
                <Image
                  src="/icons/TrashSimple.svg"
                  alt="Delete"
                  width={16}
                  height={16}
                  className="flex-shrink-0"
                />
                Delete
              </button>
            </Link>
          </div>
        </footer>
      </DrawerContent>
    </Drawer>
  );
};

export default JobDetailDrawer;
