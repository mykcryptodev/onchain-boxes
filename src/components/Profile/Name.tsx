import { type Profile } from "@prisma/client";
import { type Chain } from "@thirdweb-dev/chains";
import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";
import { MARKETPLACE } from "~/constants/addresses";
import useActiveChain from "~/hooks/useActiveChain";
import useContentIsCensored from "~/hooks/useContentIsCensored";
import useEnsName from "~/hooks/useEnsName";
import useShortenedAddress from "~/hooks/useShortenedAddress";
import { api } from "~/utils/api";

interface NameProps {
  address: string | undefined;
  profile?: Profile | null | undefined;
  chain?: Chain;
  className?: string;
  shorten?: boolean;
  disableTooltip?: boolean;
}

export const Name: FC<NameProps> = ({ address, profile, chain, className, shorten, disableTooltip }: NameProps) => {
  const { activeChainData } = useActiveChain();
  const { data: ensName } = useEnsName(address || "");
  const chainId = chain?.chainId || activeChainData.chainId;
  const { data: fetchedProfile, isLoading: profileIsLoading } = api.profile.get.useQuery({ 
    userId: address?.toLowerCase() || "" 
  }, {
    enabled: !!address,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  profile = profile || fetchedProfile;
  const { data: isCensored } = useContentIsCensored(profile?.id || "", "profile");
  const { getShortenedAddress } = useShortenedAddress();
  
  // handle the special case where we are looking up the address of this marketplace
  if (address?.toLowerCase() === (MARKETPLACE[chainId as keyof typeof MARKETPLACE])?.toLowerCase()) {
    return <span>{MARKETPLACE_NAME}</span>;
  }

  // handle the special case where this is the null address
  if (address === ethers.constants.AddressZero) {
    return (
      <div className={`${disableTooltip ? '' : 'tooltip'}`} data-tip={getShortenedAddress(address)}>
        <span>Unclaimed Box</span>
      </div>
    );
  }

  if (profileIsLoading) {
    return (
      <div className="h-6 w-24 bg-base-300 animate-pulse rounded-lg" />
    )
  }

  // return generic address if profile is censored
  if (isCensored) {
    return (
      <span className={className || ""}>{getShortenedAddress(address)}</span>
    )
  }

  if (profile && profile.name) {
    if (isAddress(profile.name)) {
      return (
        <span className={className || ""}>{getShortenedAddress(profile.name)}</span>
      )
    }
    return (
      <div 
        className={`${disableTooltip ? '' : 'tooltip'} ${shorten ? 'overflow-hidden overflow-ellipsis whitespace-nowrap sm:w-fit w-20 max-w-[168px]' : ''}`} 
        data-tip={getShortenedAddress(address)}
      >
        <span className={className || ""}>{profile.name}</span>
      </div>
    )
  }

  if (ensName) {
    return (
      <div 
        className={`${disableTooltip ? '' : 'tooltip'} ${shorten ? 'overflow-hidden overflow-ellipsis whitespace-nowrap sm:w-fit w-20 max-w-[168px]' : ''}`} 
        data-tip={getShortenedAddress(address)}
      >
        <span className={className || ""}>{ensName}</span>
      </div>
    )
  }

  return (
    <span className={className || ""}>{getShortenedAddress(address)}</span>
  )
}

export default Name;