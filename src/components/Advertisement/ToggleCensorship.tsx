import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { type FC,useContext } from "react";

import { BANNER_ADVERTISEMENT, HERO_ADVERTISEMENT } from "~/constants/addresses";
import { ADVERTISEMENT_CHAIN } from "~/constants/chain";
import NotificationContext from "~/context/Notification";
import { type Advertisement, type AdvertisementType } from "~/types/advertisement";
import { api } from "~/utils/api";

interface Props {
  ad: Advertisement;
  adType: AdvertisementType;
}

export const ToggleCensorship: FC<Props> = ({ ad, adType }) => {
  const { popNotification } = useContext(NotificationContext);
  const toggleCensorship = api.advertisement.toggleCensorship.useMutation();
  
  const { 
    data: onchainAdRecord, 
    isLoading: onchainAdRecordIsLoading,
    refetch: refetchOnchainAdRecord,
  } = api.advertisement.getOnchainAd.useQuery({
    dayId: ad?.id || 0,
    address: adType === "BANNER" 
      ? BANNER_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string 
      : HERO_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string,
    chainId: ADVERTISEMENT_CHAIN.chainId,
    contentURI: ad?.contentURI || "",
  });
  
  const handleToggleCensorship = async (ad: Advertisement) => {
    try {
      await toggleCensorship.mutateAsync({
        dayId: ad.id,
        address: adType === "BANNER" ? BANNER_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string : HERO_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string,
        chainId: ADVERTISEMENT_CHAIN.chainId,
        contentURI: ad.contentURI,
        isCensored: !onchainAdRecord?.isCensored,
      });
      popNotification({
        title: 'Success',
        description: `Successfully ${onchainAdRecord?.isCensored ? 'uncensored' : 'censored'} advertisement`,
        type: 'success',
      });
      void refetchOnchainAdRecord();
    } catch (err) {
      console.error(err);
      popNotification({
        title: 'Error',
        description: `Failed to ${onchainAdRecord?.isCensored ? 'uncensor' : 'censor'} advertisement`,
        type: 'error',
      });
    }
  }

  return (
    <button
      className="btn btn-ghost"
      onClick={() => void handleToggleCensorship(ad)}
      disabled={onchainAdRecordIsLoading}
    >
      {onchainAdRecord?.isCensored ? (
        <EyeSlashIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
      ) : (
        <EyeIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
      )}
    </button>
  )
}

export default ToggleCensorship;