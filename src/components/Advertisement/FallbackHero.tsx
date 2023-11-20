import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";

interface Props {
  isPrimaryHero?: boolean;
}

export const FallbackHero: FC<Props> = ({ isPrimaryHero }) => {
  const isDarkTheme = useIsDarkTheme();

  const description = `${MARKETPLACE_NAME} is an experiment that brings a classic game of community fun to the blockchain. It uses Chainlink Functions for real-world data and Thirdweb for social login.`

  return (
    <div className={`w-full h-full rounded-lg ${isDarkTheme ? '' : 'bg-gradient-to-br from-transparent via-transparent to-primary'} bg-cover bg-no-repeat`}>
      <div className="h-full place-content-center grid grid-cols-1 sm:grid-cols-2 gap-2 px-10 sm:px-20 py-20 rounded-lg">
        <div className="flex flex-col gap-2 items-start">
          <div className="grid grid-flow-row gap-2">
            <div className="flex flex-col gap-1 w-fit sm:pt-0 pt-2">
              <span className={`${isPrimaryHero ? 'text-5xl' : 'md:text-5xl text-3xl'} font-bold`}>
                {MARKETPLACE_NAME}
              </span>
              <span className="text-end text-sm">
                by <a className="font-bold" href="https://twitter.com/mykcryptodev" target="_blank" rel="noreferrer">Myk.eth</a>
              </span>
            </div>
            <div className={`${isPrimaryHero ? '' : 'md:text-base sm:text-sm text-xs sm:pt-0 pt-2'}`}>
              Play Super Bowl boxes for any NFL game using blockchain and decentralized oracle networks
            </div>
            <div className="flex items-center">
              <div onClick={() => {
                // scroll to the collections-homepage div smoothly
                const collectionsHomepage = document.getElementById('contest-list-homepage');
                collectionsHomepage?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <button className="btn btn-primary mr-4">Join Contest</button>
              </div>
              <Link href="/contest/create">
                <div className="indicator">
                  <span className="indicator-item badge badge-accent">free</span> 
                  <button className="btn btn-secondary">Create Contest</button>
                </div>
              </Link>
            </div>
          </div>
          <div className="h-full items-end sm:flex hidden text-sm">
            {description}
          </div>
        </div>
        <div className={`${isPrimaryHero ? 'flex' : 'md:flex hidden'} flex-col gap-2 items-start"`}>
          <div className="mx-auto">
            <Image src="/images/logo-alt.png" alt="Onchain Boxes Logo" priority={true} width={400} height={400} />
          </div>
          <div className="h-full items-end sm:hidden flex text-sm">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FallbackHero;