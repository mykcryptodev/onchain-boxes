import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { ConnectWallet, MediaRenderer, NATIVE_TOKEN_ADDRESS, useAddress, useBalance, useChain,useDisconnect,useLogout  } from "@thirdweb-dev/react";
import { Token,TokenAmount } from "@uniswap/sdk";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { type FC,useMemo } from "react";

import HowToPlay from "~/components/Contest/HowToPlay";
import Avatar from "~/components/Profile/Avatar";
import Name from "~/components/Profile/Name";
import ThemeSwitch from "~/components/utils/ThemeSwitch";
import { MARKETPLACE_NAME } from "~/constants";
import { DEFAULT_CHAIN } from "~/constants/chain";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";
import { api } from "~/utils/api";

export const Navigation: FC = () => {
  const address = useAddress();
  const { logout } = useLogout();
  const disconnect = useDisconnect();
  const { 
    data: nativeBalance, 
    isLoading: nativeBalanceIsLoading 
  } = useBalance(NATIVE_TOKEN_ADDRESS);
  const { data: admins } = api.user.getAdmins.useQuery();
  const isAdmin = useMemo(() => {
    return admins?.some((admin) => admin.address.toLowerCase() === address?.toLowerCase());
  }, [admins, address]);
  // unlike other parts of the app, navigation shows the chain
  // that the user is connected to regardless of the chain they
  // are viewing assets for
  const chain = useChain();
  const isDarkTheme = useIsDarkTheme();
  const natvieBalanceTokenAmount = useMemo(() => {
    return new TokenAmount(
      new Token(
        Number(chain?.chainId || DEFAULT_CHAIN.chainId),
        NATIVE_TOKEN_ADDRESS,
        chain?.nativeCurrency?.decimals || DEFAULT_CHAIN.nativeCurrency.decimals,
        chain?.nativeCurrency?.symbol || DEFAULT_CHAIN.nativeCurrency.symbol,
        chain?.nativeCurrency?.name || DEFAULT_CHAIN.nativeCurrency.name,
      ),
      nativeBalance?.value.toString() || "0"
    );
  }, [nativeBalance, chain]);

  const disconnectAndSignOut = async () => {
    await logout();
    await disconnect();
    await signOut();
  };
  
  return (
    <header className="relative isolate z-10">
      <nav className="mx-auto mb-2 flex max-w-7xl items-center justify-between px-2 sm:p-6 lg:px-8" aria-label="Global">
        <div className="navbar p-0 bg-base-100 flex justify-between w-full">
          <div className="lg:flex-none flex-1">
            <Link href="/" className="btn btn-ghost normal-case text-xl">
              <span className="sm:flex hidden items-center">
                <Image 
                  src="/images/logo.png" 
                  width={32}
                  height={32}
                  className="mr-2" 
                  alt="logo" 
                  priority={true}
                />
                <span>
                  {MARKETPLACE_NAME}
                </span>
              </span>
              <span className="sm:hidden flex">
                <Image 
                  src="/images/logo.png" 
                  width={48}
                  height={48}
                  className="mr-2" 
                  alt="logo" 
                  priority={true}
                />
              </span>
            </Link>
          </div>
          <div className="flex-none gap-2 space-x-2">
            <div className="dropdown dropdown-end flex items-center gap-2">
              <HowToPlay />
              <span className={`${address ? 'sm:flex hidden' : ''}`}><ThemeSwitch /></span>
            </div>
            <div className="dropdown dropdown-end flex items-center">
              <ConnectWallet 
                auth={{
                  loginOptional: true,
                }}
                btnTitle="Login"
                theme={isDarkTheme ? 'dark' : 'light'}
                className="thirdweb-btn-lg"
                modalTitle={`Login to ${MARKETPLACE_NAME}`}
                modalSize={"wide"}
                modalTitleIconUrl={"/images/logo.png"}
                welcomeScreen={{
                  title: `Login to ${MARKETPLACE_NAME}`,
                  subtitle:
                    "Connect with your favorite provider",
                  img: {
                    src: "/images/logo-alt.png",
                    width: 150,
                    height: 150,
                  },
                }}
                switchToActiveChain={true}
                detailsBtn={() => {
                  return (
                    <button className="btn btn-lg flex items-center gap-2 normal-case pr-2 pl-4 rounded-r-none no-animation">
                      <div className="flex-1 flex-col gap-1">
                        <Name address={address || ""} shorten={true} />
                        {nativeBalanceIsLoading ? (
                          <div className="h-4 w-16 mt-1 ml-7 bg-base-300 animate-pulse rounded-lg" />
                        ) : (
                          <div className="flex items-center gap-1 justify-end">
                            <MediaRenderer
                              src={chain?.icon?.url || DEFAULT_CHAIN.icon?.url || ""}
                              width="14px"
                              height="14px"
                              className="rounded-full"
                            />
                            <div className="text-xs text-end">
                              {natvieBalanceTokenAmount.toSignificant(4, { groupSeparator: ','})} {nativeBalance?.symbol}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }}
              />
              {address && (
                <div className="flex justify-center btn btn-lg py-2 pl-2 pr-4 rounded-r-lg rounded-l-none">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="cursor-pointer">
                      <Avatar width={48} height={48} address={address || ""} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 mt-4">
                      <li>
                        <Link href={`/profile/${address || ""}`}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link href={'/contest/create'}>
                          Create Contest
                        </Link>
                      </li>
                      <li>
                        <Link href={'/advertisement/create'}>
                          Advertise With Us
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link href={'/admin'}>
                            Admin
                          </Link>
                        </li>
                      )}
                      <li>
                        <a onClick={() => void disconnectAndSignOut()}>
                          Sign Out
                        </a>
                      </li>
                      <li className="sm:hidden block">
                        <div className="divider my-2" />
                      </li>
                      <li className="sm:hidden block">
                        <a className="flex w-full justify-center items-center">
                          <MoonIcon className="w-8 h-8 stroke-2" />
                          <ThemeSwitch toggle={true} />
                          <SunIcon className="w-8 h-8 stroke-2" />
                        </a>
                      </li>                        
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navigation;