"use client";

import Image from "next/image";

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

interface FindWorkJobCardProps {
    job: JobData;
    onClick?: (job: JobData) => void;
    isLast?: boolean;
}

const FindWorkJobCard = ({ job, onClick, isLast }: FindWorkJobCardProps) => {
    return (
        <div className="group group-hover:bg-[#fafafa]">
            <div
                onClick={() => onClick?.(job)}
                className="bg-white group-hover:bg-[#fafafa] p-[8px] sm:p-[8px] sm:pb-[16px] md:p-[24px] pb-[16px] md:pb-[24px] grid sm:grid-cols-[92px_1fr] grid-cols-[64px_1fr] gap-x-[12px] md:gap-x-[20px] gap-y-[8px] hover:shadow-sm transition-shadow cursor-pointer"
            >
                <div className="row-span-2 sm:row-span-3 sm:aspect-square">
                    <Image
                        src={job.profileImage}
                        alt={job.username}
                        width={64}
                        height={64}
                        className="rounded-[8px] object-cover sm:h-[92px] sm:w-[92px] w-[64px] h-[64px] md:w-[64px] md:h-[64px] opacity-100"
                        onError={e => {
                            (e.target as HTMLImageElement).src = "/images/Lenshead_1.png";
                        }}
                    />
                </div>
                <div className="flex items-start justify-between sm:gap-[8px] gap-[12px] sm:flex-col flex-row md:gap-[16px] row-span-2">
                    <div className="flex flex-col justify-evenly h-full min-w-0 flex-1">
                        <h4 className="text-[14px] md:text-[16px] font-medium text-[#212121] leading-[20px] md:leading-[24px]">
                            {job.username}
                        </h4>
                        <h3 className="sm:text-[18px] text-[20px] font-semibold text-[#212121] leading-[22px] md:leading-[24px]">
                            {job.jobName}
                        </h3>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[84px] h-[40px] py-[8px] px-[16px] border border-[#B4B4B4] rounded-full sm:text-[16px] text-[20px] font-semibold leading-[24px] tracking-[-0.2px] opacity-100 whitespace-nowrap bg-[#F6F6F6] group-hover:bg-white">
                            {job.paymentAmount}
                        </span>
                    </div>
                </div>

                <div className="col-span-2 mt-[8px]">
                    <p className="text-[14px] md:text-[16px] text-[#6C6C6C] leading-[20px] md:leading-[24px] line-clamp-2 max-w-full">
                        {job.description}
                    </p>
                </div>

                <div className="col-span-2 mt-[8px]">
                    <div className="flex flex-wrap gap-[4px]">
                        {job.tags
                            .filter(tag => tag !== "[tag]" && tag.trim() !== "")
                            .slice(0, 3)
                            .map((tag, tagIndex) => (
                                <span
                                    key={tagIndex}
                                    className="inline-flex items-center justify-center h-[32px] py-[6px] px-[12px] bg-[#F2F2F2] text-[#323232] rounded-full text-[13px] font-medium leading-[20px] tracking-[0px] align-middle opacity-100"
                                >
                                    {tag}
                                </span>
                            ))}
                    </div>
                </div>
            </div>
            {!isLast && (
                <hr className="border-0 h-[1px] bg-[#E8E8E8] my-0" />
            )}
        </div>
    );
};

export default FindWorkJobCard;
