import { type Chain } from "@thirdweb-dev/chains";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/react";
import { type Token } from "@uniswap/sdk";
import { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import coingeckoList from "~/constants/tokenLists/coingecko.json";

const COINGECKO_UNKNOWN_IMG = 'https://static.coingecko.com/s/missing_thumb_2x-38c6e63b2e37f3b16510adf55368db6d8d8e6385629f6e9d41557762b25a6eeb.png';

interface CoingeckoToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

// this hook will attempt to find the token logo uri in the token lists
// it will fall back to using the coingecko api if no token is found in the list
const useTokenLogo = (token: Token, chain: Chain) => {
  const [imgUrl, setImgUrl] = useState<string | StaticImageData>(COINGECKO_UNKNOWN_IMG);
  
  useEffect(() => {
    if (!token || !chain) return;
    if (token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      return setImgUrl(chain.icon?.url || "");
    }
    const tokenInList = coingeckoList.tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase());
    if (tokenInList && tokenInList.logoURI) {
      return setImgUrl(tokenInList.logoURI);
    }
    const fetchExternalImg = async () => {
      try {
        const coingeckoTokenList = await fetch('https://tokens.coingecko.com/uniswap/all.json');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const coingeckoTokenListJson = await coingeckoTokenList.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const tokens = coingeckoTokenListJson.tokens as CoingeckoToken[];
        const tokenInList = tokens.find(t => 
          t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === chain.chainId
        );
        if (tokenInList?.logoURI) {
          return setImgUrl(tokenInList.logoURI);
        } else {
          return setImgUrl(COINGECKO_UNKNOWN_IMG);
        }
      } catch (e) {
        console.error(e);
        return setImgUrl(COINGECKO_UNKNOWN_IMG);
      }
    }
    void fetchExternalImg();
  }, [token, chain]);

  return imgUrl;
}

export default useTokenLogo;