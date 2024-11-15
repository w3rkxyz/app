import React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { closeAlert } from "../../redux/alerts";
interface AlertProps {
  id: Number;
  variant: String;
  classname: String;
  title: String;
  tag1: string;
  tag2?: string;
  hash?: string;
  onClose?: () => void;
}

function Alert({
  id,
  variant,
  classname,
  title,
  tag1,
  tag2,
  hash,
  onClose,
}: AlertProps) {
  const theme = "dark";
  let color;
  let icon;
  const dispatch = useDispatch();

  switch (variant) {
    case "Successful":
      color = theme === "dark" ? "dark:bg-light-1100" : "alertGreenGradient";
      icon = 25;
      break;
    case "Pending":
      color = theme === "dark" ? "dark:bg-light-1100" : "alertYelloGradient";
      icon = 23;
      break;
    case "Failed":
      color = theme === "dark" ? "dark:bg-light-1100" : "alertRedGradient";
      icon = 21;
      break;
    default:
      color = theme === "dark" ? "dark:bg-light-1100" : "alertYelloGradient";
      icon = 25;
      break;
  }
  return (
    <div className="bg-white rounded-[12px] overflow-hidden border-[1px] border-[#E4E4E7] w-[281px]">
      <div className="border-b-[1px] border-b-[#E4E4E7] w-full pl-[16px] py-[12px]">
        <span className="font-medium text-[14px] text-[#707070]">
          {variant === "Successful" ? "Action Completed" : "Action Failed"}
        </span>
      </div>
      <div className="pl-[16px] pr-[9px] py-[11px] w-full flex items-center">
        <div className="flex flex-col">
          <span className="font-medium text-[14px] text-black">{tag1}</span>
          {tag2 && variant !== "Successful" && (
            <span className="font-medium text-[12px] text-[#707070] mt-[7px]">
              {tag2}
            </span>
          )}
        </div>
        <Image
          src={
            variant === "Successful" ? "/images/succes.svg" : "/images/fail.svg"
          }
          alt="state icon"
          width={19}
          height={19}
          className="ml-auto"
        />
      </div>
    </div>
  );
}
export default Alert;
