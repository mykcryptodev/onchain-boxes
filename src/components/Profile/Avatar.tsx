import { type Profile } from "@prisma/client";
import { type Chain } from "@thirdweb-dev/chains";
import { MediaRenderer } from "@thirdweb-dev/react";
import Image from "next/image";
import { type FC } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { MARKETPLACE_NAME } from "~/constants";
import { MARKETPLACE } from "~/constants/addresses";
import useActiveChain from "~/hooks/useActiveChain";
import useContentIsCensored from "~/hooks/useContentIsCensored";
import { api } from "~/utils/api";

interface AvatarProps {
  profile?: Profile | null | undefined;
  address: string;
  width?: number;
  height?: number;
	fill?: boolean;
  className?: string;
  chain?: Chain;
}

export const Avatar: FC<AvatarProps> = ({ profile, address, width, height, fill, className, chain }) => {
  const { activeChainData } = useActiveChain();
  const chainId = chain?.chainId || activeChainData.chainId;
  const { 
    data: fetchedProfile, 
    isLoading: profileIsLoading } = api.profile.get.useQuery({ 
      userId: address?.toLowerCase() 
  }, {
    enabled: !!address,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  profile = profile || fetchedProfile;
  const { data: isCensored } = useContentIsCensored(profile?.id || "", "profile");
  const DEFAULT_SIZE = 22;

  // handle the special case where the user wants the avatar of the marketplace
  if (address?.toLowerCase() === (MARKETPLACE[chainId as keyof typeof MARKETPLACE])?.toLowerCase()) {
    return (
      <Image
        src="/img/logos/logo-icon.png"
        alt={MARKETPLACE_NAME}
        width={width || DEFAULT_SIZE}
        height={height || DEFAULT_SIZE}
        fill={fill}
        className={`${className ? className : 'aspect-square rounded-full object-cover'}`}
      />
    )
  }

  if (profileIsLoading) {
    return (
      <div className={`h-12 bg-base-300 rounded-full aspect-square animate-pulse`} />
    )
  }
  
  // show a generic avatar if profile is censored
  if (isCensored) {
    return (
      <Jazzicon
        diameter={width || DEFAULT_SIZE}
        seed={jsNumberForAddress(address)}
      />
    )
  }
  
  // show profile image if set
  if (profile && profile.img) {
    if (profile.img.startsWith("ipfs://")) {
      return (
        <MediaRenderer
          src={profile.img}
          width={(width || DEFAULT_SIZE).toString() + 'px'}
          height={(height || DEFAULT_SIZE).toString() + 'px'}
          className={`${className ? className : 'aspect-square rounded-full'}`}
          style={{ objectFit: 'cover' }}
        />
      )
    }
    return (
      <Image
        src={profile.img}
        alt={profile.name || address}
        width={width || DEFAULT_SIZE}
        height={height || DEFAULT_SIZE}
        fill={fill}
        className={`${className ? className : 'aspect-square rounded-full object-cover'}`}
      />
    );
  }

  // show a generic avatar if no profile image or ens avatar is set
  return (
    <Jazzicon
      diameter={width || DEFAULT_SIZE}
      seed={jsNumberForAddress(address)}
    />
  )
}

export default Avatar;