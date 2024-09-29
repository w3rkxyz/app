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
    <div className="bg-dark-800 rounded overflow-hidden dark:bg-white">
      <div
        className={`flex items-center py-2 pr-6 pl-10 gap-4  dark:bg-light-800 ${
          classname || ""
        } ${color}`}
      >
        <span className="font-medium flex-grow alert-title">
          Transaction in progress
        </span>
      </div>
      <div className="flex items-center gap-3 dark:box-border pr-20 pl-10 pt-3 pb-2">
        <span className="mb-1 alert-content text-[#FAFAFA] dark:text-[#000]">
          {text}
        </span>
        <ThreeDots
          visible={true}
          height="10"
          width="50"
          color="#4fa94d"
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
