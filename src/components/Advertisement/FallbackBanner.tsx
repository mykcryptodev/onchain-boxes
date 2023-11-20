import Link from "next/link";
import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";

export const FallbackBanner: FC = () => {
  const isDarkTheme = useIsDarkTheme();

  return (
    <Link href="/advertisement/create" className={`flex w-full justify-center text-center items-center text-xs ${isDarkTheme ? 'text-base-content' : 'text-neutral'} text-opacity-50 p-2 gap-1 h-full`}>
      Your ad could be here! Advertise with {MARKETPLACE_NAME}.
    </Link>
  )
}

export default FallbackBanner;