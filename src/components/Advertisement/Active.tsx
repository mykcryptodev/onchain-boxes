import { ArrowLeftCircleIcon, ArrowRightCircleIcon, ArrowTopRightOnSquareIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { MediaRenderer } from "@thirdweb-dev/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useEffect,useState } from "react";

import FallbackBanner from "~/components/Advertisement/FallbackBanner";
import FallbackHero from "~/components/Advertisement/FallbackHero";
import { MARKETPLACE_NAME } from "~/constants";
import { BANNER_ADVERTISEMENT, HERO_ADVERTISEMENT } from "~/constants/addresses";
import { ADVERTISEMENT_CHAIN } from "~/constants/chain";
import { type AdvertisementType } from "~/types/advertisement";
import { api } from "~/utils/api";

interface Props {
  type: AdvertisementType;
  showFallback?: boolean;
}

const getDayId = (date: Date) => {
  // count how many days elapsed from Jan 1, 1970 to the date passed in
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return Math.floor((utcDate.getTime() - new Date(1970, 0, 1).getTime()) / 1000 / 60 / 60 / 24) + 1;
}

export const ActiveAdvertisement: FC<Props> = ({ type, showFallback }) => {
  const router = useRouter();
  const incrementClicks = api.advertisement.incrementClicks.useMutation();
  const incrementViews = api.advertisement.incrementViews.useMutation();
  const { data: ad, isLoading: adIsLoading } = api.advertisement.getByDayId.useQuery({
    dayId: getDayId(new Date()),
    adType: type,
  });
  const { 
    data: onchainAdRecord, 
    isLoading: onchainAdRecordIsLoading 
  } = api.advertisement.getOnchainAd.useQuery({
    dayId: ad?.id || 0,
    address: type === "BANNER" 
      ? BANNER_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string 
      : HERO_ADVERTISEMENT[ADVERTISEMENT_CHAIN.slug] as string,
    chainId: ADVERTISEMENT_CHAIN.chainId,
    contentURI: ad?.contentURI || "",
  });
  const isCensored = onchainAdRecord?.isCensored || false;
  const [viewIncremented, setViewIncremented] = useState<boolean>(false);

  useEffect(() => {
    if (ad && !viewIncremented) {
      void incrementViews.mutate({ id: ad.id.toString() });
      setViewIncremented(true);
    }
  }, [ad, incrementViews, viewIncremented]);

  const handleAdClicked = () => {
    if (ad) {
      void incrementClicks.mutate({ id: ad.id.toString() });
      void router.push(ad.link);
    }
  };

  const scroll = (amount: number) => {
    const carousel = document.getElementById("hero-carousel");
    if (carousel) {
      carousel.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  }

  const DisclaimerModal: FC = () => {
    return (
      <>
        <button className="btn btn-xs btn-ghost opacity-50 w-fit mb-1" onClick={()=>(document.getElementById('ad-disclaimer-modal') as HTMLDialogElement).showModal()}>
          <div className="flex items-center gap-1">
            <span>Onchain Ad</span>
            <QuestionMarkCircleIcon className="w-3 h-3 stroke-2" />
          </div>
        </button>
        <dialog id="ad-disclaimer-modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">What are onchain ads?</h3>
            <p className="py-4">Onchain ads allows anyone to advertise on {MARKETPLACE_NAME}. Ads are bought in day-long increments paid in {ADVERTISEMENT_CHAIN.nativeCurrency.symbol} on {ADVERTISEMENT_CHAIN.name}. Advertisers can also set the price for their ad slot to be overwritten.</p>
            <p className="py-4">{MARKETPLACE_NAME} may hide ads that violate community guidelines without refund.</p>
            <div className="modal-action">
              <Link className="btn btn-primary" href="/advertisement/create">
                Buy an Ad
              </Link>
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </>
    )
  };

  if (adIsLoading || onchainAdRecordIsLoading) {
    if (type === "BANNER") {
      return (
        <div className="w-full h-16 bg-base-200 rounded-lg animate-pulse" />
      )
    }
    if (type === "HERO") {
      return (
        <div className="w-full bg-base-200 rounded-lg animate-pulse aspect-video" />
      )
    }
  }

  if (ad && type === "BANNER" && !isCensored) {
    return (
      <div>
        <DisclaimerModal/>
        <div onClick={handleAdClicked} className="h-16 w-full cursor-pointer bg-base-200 rounded-lg">
          <MediaRenderer
            src={ad.media}
            className="w-full h-16 rounded-lg thirdweb-cover-mediarenderer"
            style={{ height: "4rem", width: "100%", objectFit: "cover", borderRadius: "8px" }}
            controls={false}
          />
        </div>
        <Link href="/advertisement/create" className="flex w-full justify-end items-center text-xs p-2 gap-1 text-muted bg-base-100">
          <span>Advertise with {MARKETPLACE_NAME}</span>
          <ArrowTopRightOnSquareIcon className="w-3 h-3 stroke-2" />
        </Link>
      </div>
    )
  }

  if (ad && type === "HERO" && !isCensored) {
    return (
      <div>
        <div className="w-full justify-between items-end gap-2 flex">
          <DisclaimerModal/>
          <div className="flex items-center">
            <button onClick={() => void scroll(-1024)} className="btn btn-ghost btn-circle">
              <ArrowLeftCircleIcon className="w-8 h-8 stroke-2" />
            </button>
            <button onClick={() => void scroll(1024)} className="btn btn-ghost btn-circle">
              <ArrowRightCircleIcon className="w-8 h-8 stroke-2" />
            </button>
          </div>
        </div>
        <div id="hero-carousel" className="carousel w-full aspect-video">
          <div className="carousel-item w-full">
            <div onClick={handleAdClicked} className="w-full cursor-pointer bg-base-200 rounded-lg aspect-video">
              <MediaRenderer
                src={ad.media}
                style={{ height: "100%", width: "100%", objectFit: "cover", borderRadius: "8px" }}
                controls={false}
                className="thirdweb-cover-mediarenderer"
              />
            </div>
          </div> 
          <div className="carousel-item w-full">
            <div className="w-full bg-base-200 rounded-lg">
              <FallbackHero />
            </div>
          </div> 
        </div>
        <Link href="/advertisement/create" className="flex w-full justify-end items-center text-xs p-2 gap-1 text-muted bg-base-100">
          <span>Advertise with {MARKETPLACE_NAME}</span>
          <ArrowTopRightOnSquareIcon className="w-3 h-3 stroke-2" />
        </Link>
      </div>
    )
  }

  if ((!ad || isCensored) && showFallback) {
    if (type === "HERO") {
      return (
        <div className="w-full bg-base-200 rounded-lg">
          <FallbackHero isPrimaryHero={true} />
          <Link href="/advertisement/create" className="flex w-full justify-end items-center text-xs p-2 gap-1 text-muted bg-base-100">
            <span>Advertise with {MARKETPLACE_NAME}</span>
            <ArrowTopRightOnSquareIcon className="w-3 h-3 stroke-2" />
          </Link>
        </div>
      )
    }
    if (type === "BANNER") {
      return (
        <div className="w-full h-16 bg-base-200 rounded-lg">
          <FallbackBanner />
        </div>
      )
    }
  }

  return null;
}

export default ActiveAdvertisement;