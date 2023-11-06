import { type Profile } from "@prisma/client";
import { type Chain } from "@thirdweb-dev/chains";
import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";

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
}

const useProfileName = (props: NameProps) => {
  const { activeChainData } = useActiveChain();
  const { data: ensName } = useEnsName(props.address || "");
  const chainId = props.chain?.chainId || activeChainData.chainId;
  const { data: fetchedProfile, isLoading: profileIsLoading } = api.profile.get.useQuery({ 
    userId: props.address?.toLowerCase() || "" 
  }, {
    enabled: !!props.address,
  });
  const profile = props.profile || fetchedProfile;
  const { data: isCensored } = useContentIsCensored(props.profile?.id || "", "profile");
  const { getShortenedAddress } = useShortenedAddress();
  
  // handle the special case where we are looking up the address of this marketplace
  if (props.address?.toLowerCase() === (MARKETPLACE[chainId as keyof typeof MARKETPLACE])?.toLowerCase()) {
    return {MARKETPLACE_NAME};
  }

  // handle the special case where this is the null address
  if (props.address === ethers.constants.AddressZero) {
    return "Unclaimed Box";
  }

  if (profileIsLoading) {
    return "...";
  }

  // return generic address if profile is censored
  if (isCensored) {
    return (
      getShortenedAddress(props.address)
    )
  }

  if (profile && profile.name) {
    if (isAddress(profile.name)) {
      return (
        getShortenedAddress(profile.name)
      )
    }
    return profile.name;
  }

  if (ensName) {
    return ensName;
  }

  return getShortenedAddress(props.address);
};

export default useProfileName;