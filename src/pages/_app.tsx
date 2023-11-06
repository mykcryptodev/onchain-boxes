import "~/styles/globals.css";

import {
  coinbaseWallet,
  embeddedWallet,
  localWallet,
  metamaskWallet,
  rainbowWallet,
  ThirdwebProvider,
  trustWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { type AppType } from "next/app";
import { Didact_Gothic } from 'next/font/google';
import { useRouter } from "next/router";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useContext, useEffect, useMemo } from "react";

import { Layout } from "~/components/utils/Layout";
import { MARKETPLACE_NAME } from "~/constants";
import { SMART_WALLET_FACTORY } from "~/constants/addresses";
import { SUPPORTED_CHAINS } from "~/constants/chain";
import ActiveChainContext from "~/context/ActiveChain";
import useActiveChain from "~/hooks/useActiveChain";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";
import useIsPwa from "~/hooks/useIsPwa";
import { api } from "~/utils/api";

const font = Didact_Gothic({
  subsets: ['latin'],
  weight: '400'
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const activeChainContext = useActiveChain();

  function ThirdwebProviderWithActiveChain({ children } : { 
    children: React.ReactNode 
  }) {
    const { activeChain, updateActiveChain, activeChainData } = useContext(ActiveChainContext);
    const router = useRouter();
    const { chain } = router.query as { chain: string };
    const isDarkMode = useIsDarkTheme();
    const isPwa = useIsPwa();

    const smartWalletOptions = useMemo(() => ({
      factoryAddress: SMART_WALLET_FACTORY[activeChainData.slug] as string,
      gasless: true,
    }), [activeChainData.slug]);
    console.log({ smartWalletOptions });
    
    useEffect(() => {
      if (!chain) return;
      updateActiveChain(chain);
    }, [chain, updateActiveChain]);

    const supportedWallets = useMemo(() => {
      const personalWallets = [
        metamaskWallet({ recommended: true }),
        coinbaseWallet(),
        walletConnect(),
        trustWallet(),
        rainbowWallet(),
        localWallet(),
        embeddedWallet(),
      ];

      if (isPwa) {
        return [
          walletConnect(),
          embeddedWallet(),
        ];
      }
      return personalWallets;
    }, [isPwa]);
  
    return (
      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""}
        activeChain={activeChain}
        supportedChains={SUPPORTED_CHAINS}
        supportedWallets={supportedWallets}
        authConfig={{
          domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
          authUrl: "/api/auth",
        }}
        dAppMeta={{
          name: MARKETPLACE_NAME,
          description: "A marketplace for NFTs",
          isDarkMode,
          url: process.env.NEXT_PUBLIC_SITE_URL || "",
          logoUrl: "/logo.png",
        }}
      >
        {children}
      </ThirdwebProvider>
    )
  }
  
  return (
    <div className={font.className}>
      <SessionProvider session={session}>
        <ThemeProvider>
          <ActiveChainContext.Provider value={activeChainContext}>
            <ThirdwebProviderWithActiveChain>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ThirdwebProviderWithActiveChain>
          </ActiveChainContext.Provider>
        </ThemeProvider>
      </SessionProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
