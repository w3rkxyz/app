import React from "react";
import { Oval } from "react-loader-spinner";
interface AlertProps {
  variant: String;
  classname: String;
  text: string;
}

function TransactionLoader({ variant, classname, text }: AlertProps) {
  const theme = "dark";
  let color;
  let icon;
  const state = "Successful";
  // variant = "Successful";

  switch (state) {
    case "Successful":
      color = theme === "dark" ? "dark:bg-light-1100" : "alertGreenGradient";
      icon = 25;
      break;
    // case 'Pending':
    //   color = theme === 'dark' ? 'dark:bg-light-1100' : 'alertYelloGradient'
    //   icon = 23
    //   break
    // case 'Failed':
    //   color = theme === 'dark' ? 'dark:bg-light-1100' : 'alertRedGradient'
    //   icon = 21
    //   break
    default:
      color = theme === "dark" ? "dark:bg-light-1100" : "alertYelloGradient";
      icon = 25;
      break;
  }

  return (
    <div className="bg-white rounded-[12px] overflow-hidden border-[1px] border-[#E4E4E7] w-[281px]">
      <div className="border-b-[1px] border-b-[#E4E4E7] w-full pl-[16px] py-[12px]">
        <span className="font-medium text-[14px] text-[#707070]">
          Transaction in progress
        </span>
      </div>
      <div className="pl-[16px] pr-[9px] py-[11px] w-full flex items-center">
        <span className="font-medium text-[14px] text-black">{text}</span>
        <Oval
          visible={true}
          height="19"
          width="19"
          color="#2D2D2D"
          secondaryColor="#a2a2a3"
          strokeWidth={8}
          ariaLabel="oval-loading"
          wrapperClass="ml-[auto]"
        />
      </div>
    </div>
  );
}
export default TransactionLoader;
