import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";

interface Props {
  title?: string;
  text?: string | undefined | null;
  iconClassName?: string;
  btnClassName?: string;
}

const ShareButton: FC<Props> = ({ title, text, iconClassName, btnClassName }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || document.title,
          text: text || `Check out this page on ${MARKETPLACE_NAME}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      console.warn('Web Share API not supported');
    }
  };

  if (!navigator || !navigator.share) return null;

  return (
    <button
      className={btnClassName || "btn btn-ghost"}
      onClick={() => void handleShare()}
    >
      <ArrowUpOnSquareIcon className={iconClassName || "w-6 h-6 stroke-2"} />
    </button>
  );
}

export default ShareButton;