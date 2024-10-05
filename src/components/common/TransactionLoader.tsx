import React from "react";
import { ThreeDots } from "react-loader-spinner";
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
  // variant = 'Successful'

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
    <div className="bg-white rounded overflow-hidden border-[1px] border-[#E4E4E7]">
      <div className={`flex items-center py-2 pr-6 pl-10 gap-4 bg-[#C6AAFF]`}>
        <span className="font-medium flex-grow alert-title text-white">
          Transaction in progress
        </span>
      </div>
      <div className="flex items-center gap-3 pr-20 pl-10 pt-3 pb-2">
        <span className="mb-1 alert-content text-black">{text}</span>
        <ThreeDots
          visible={true}
          height="10"
          width="50"
          color="#C6AAFF"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    </div>
  );
}
export default TransactionLoader;
