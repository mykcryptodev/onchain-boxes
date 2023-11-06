import { type ChainId, MediaRenderer } from "@thirdweb-dev/react";
import { type Token } from "@uniswap/sdk";
import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "~/constants/chain";
import useTokenLogo from "~/hooks/useTokenLogo";


const TokenIcon: FC<{ 
  token: Token,
  height?: number,
  width?: number,
  noLink?: boolean,
}> = ({ token, width, height, noLink }) => {
  const chain = SUPPORTED_CHAINS.find(c => c.chainId as ChainId == token.chainId as number) || DEFAULT_CHAIN;
  const tokenLogo = useTokenLogo(token, chain);
  
  const Logo: FC = () => {
    return (
      <>
        {tokenLogo.toString().startsWith("ipfs://") ? (
          <MediaRenderer
            src={tokenLogo.toString()}
            className="w-7 h-7 rounded-full"
            style={{ height: height || '100%', width: width || '100%' }}
          />
        ) : (
          <Image 
            alt={token.name || token.symbol || "Token Icon"}
            width={width || 28}
            height={height || 28}
            src={tokenLogo}
          />
        )}
      </>
    )
  }

  if (noLink) {
    return <Logo />
  }

  return (
    <Link href={`${chain.explorers?.[0]?.url || ""}/address/${token.address}`} target="_blank" rel="noopener noreferrer">
      <Logo />
    </Link>
  )
};

export default TokenIcon;