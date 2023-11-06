import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { MediaRenderer } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { type NextPage } from "next";
import { useState } from "react";

import AdvertisementCalendar from "~/components/Advertisement/Calendar";
import AdvertisementForm from "~/components/Advertisement/Form";
import { MARKETPLACE_NAME } from "~/constants";
import { ADVERTISEMENT_CHAIN } from "~/constants/chain";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";
import { type AdvertisementType } from "~/types/advertisement";
import { api } from "~/utils/api";

export const CreateAdvertisement: NextPage = () => {
  const [adType, setAdType] = useState<AdvertisementType>("BANNER");
  const [price, setPrice] = useState<BigNumber>(BigNumber.from("0"));
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const isDarkTheme = useIsDarkTheme();

  const { data: pricePerBannerSlot } = api.advertisement.getStandardPrice.useQuery({
    adType: "BANNER",
  });

  const { data: pricePerHeroSlot } = api.advertisement.getStandardPrice.useQuery({
    adType: "HERO",
  });

  return (
    <div className="flex flex-col gap-2 justify-center max-w-2xl mx-auto">
      <div className="text-5xl font-bold my-4 mx-2">Create Advertisement</div>
      <div className="w-full h-full flex items-start lg:flex-row flex-col-reverse lg:gap-8 gap-2 mx-2 mb-20 pr-4">
        <div className="w-full flex flex-col gap-2">
          <div className="alert items-start mb-4">
            <InformationCircleIcon className={`h-5 w-5 mt-1 stroke-2 ${isDarkTheme ? 'stroke-info' : 'fill-info'}`} />            
            <div className="flex flex-col gap-2">
              <span>
                Ads are permissionless so that anyone can buy an advertisement on {MARKETPLACE_NAME}. Ad slots are sold on a per-day basis in {ADVERTISEMENT_CHAIN.nativeCurrency.symbol} on the {ADVERTISEMENT_CHAIN.name} chain. Ad slots can be bought from the current owner of the ad slot for the price set by the slot owner. Ad media is subject to Community Guidelines and may be taken down without refund if violated.
              </span>
            </div>
          </div>
          <div className="form-control border rounded-lg p-6">
            <label className="label cursor-pointer">
              <div className="flex flex-col gap-1">
                <span className="label-text text-xl font-bold">
                  Banner Ad
                </span>
                {pricePerBannerSlot ? (
                  <span className="text-sm flex items-center gap-1">
                    <MediaRenderer
                      src={ADVERTISEMENT_CHAIN.icon.url || ""}
                      width="14px"
                      height="14px"
                      className="rounded-full"
                    />
                    {ethers.utils.formatUnits(pricePerBannerSlot, ADVERTISEMENT_CHAIN.nativeCurrency.decimals)}
                    &nbsp;
                    {ADVERTISEMENT_CHAIN.nativeCurrency.symbol}
                  </span>
                ) : (
                  <span className="h-5 w-32 bg-base-200 rounded-lg animate-pulse" />
                )}
                <span>Shown at the top of every page on {MARKETPLACE_NAME}. Located above the navigation bar.</span>
              </div>
              <input 
                type="radio" 
                className="radio" 
                value="deploy"
                checked={adType === "BANNER"}
                onChange={() => setAdType("BANNER")}
              />
            </label>
          </div>
          <div className="form-control border rounded-lg p-6">
            <label className="label cursor-pointer">
              <div className="flex flex-col gap-1">
                <span className="label-text text-xl font-bold">Hero Ad</span>
                {pricePerHeroSlot ? (
                  <span className="text-sm flex items-center gap-1">
                    <MediaRenderer
                      src={ADVERTISEMENT_CHAIN.icon.url || ""}
                      width="14px"
                      height="14px"
                      className="rounded-full"
                    />
                    {ethers.utils.formatUnits(pricePerHeroSlot, ADVERTISEMENT_CHAIN.nativeCurrency.decimals)}
                    &nbsp;
                    {ADVERTISEMENT_CHAIN.nativeCurrency.symbol}
                  </span>
                ) : (
                  <span className="h-5 w-32 bg-base-200 rounded-lg animate-pulse" />
                )}
                <span>Make a splash with a huge ad above the fold on the homepage of {MARKETPLACE_NAME}.</span>
              </div>
              <input 
                type="radio"
                className="radio" 
                value="import"
                checked={adType === "HERO"}
                onChange={() => setAdType("HERO")}
              />
            </label>
          </div>
          <h2 className="text-3xl font-bold my-4">Select Dates</h2>
          <AdvertisementCalendar 
            adType={adType}
            callback={(price, dates) => {
              setPrice(price);
              setSelectedDates(dates);
            }}
          />
          <h2 className="text-3xl font-bold my-4">Create Ad Media</h2>
          <AdvertisementForm 
            adType={adType}
            selectedDates={selectedDates}
            price={price}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateAdvertisement;