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
  tag2: string;
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
    <div className="bg-dark-800 rounded overflow-hidden dark:bg-white">
      <div
        className={`flex items-center py-2 pr-3 pl-5 gap-4  dark:bg-light-800 ${
          classname || ""
        } ${color}`}
      >
        <Image src={`/images/${icon}.svg`} alt="" />
        <span className="font-medium flex-grow alert-title">{title}</span>
        <span
          onClick={() => {
            dispatch(closeAlert());
          }}
          style={{ cursor: "pointer" }}
        >
          <Image src="/images/alert-close.svg" alt="" />
        </span>
      </div>
      <div className="pt-4 pb-5 px-[60px] dark:box-border">
        <p className="mb-1 alert-content text-[#FAFAFA] dark:text-[#000]">
          {tag1}
        </p>
        <div className="flex items-center gap-1.5">
          {hash ? (
            <a
              href={hash}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:no-underline"
            >
              <span className="hover:no-underline text-xl alert-sub-content">
                {tag2}
              </span>
            </a>
          ) : (
            <span className="hover:no-underline text-xl alert-sub-content">
              {tag2}
            </span>
          )}
          {/* <Image src="/images/Group 169.svg" className="material-icons" alt="" /> */}
        </div>
      </div>
    </div>
  );
}
export default Alert;
