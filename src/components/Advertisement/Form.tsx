import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { type TransactionError, useStorage,Web3Button  } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { type FC, useContext, useEffect,useState } from 'react';

import Upload from '~/components/utils/Upload';
import { MARKETPLACE_NAME } from '~/constants';
import { BANNER_ADVERTISEMENT,HERO_ADVERTISEMENT } from '~/constants/addresses';
import { ADVERTISEMENT_CHAIN } from '~/constants/chain';
import ActiveChainContext from '~/context/ActiveChain';
import NotificationContext from '~/context/Notification';
import { type AdvertisementType } from '~/types/advertisement';
import { api } from "~/utils/api";

const getDayId = (date: Date) => {
  // count how many days elapsed from Jan 1, 1970 to the date passed in
  return Math.floor((date.getTime() - new Date(1970, 0, 1).getTime()) / 1000 / 60 / 60 / 24) + 1;
}

interface Props {
  adType: AdvertisementType;
  price: ethers.BigNumber;
  selectedDates: Date[];
}

const AdvertisementForm: FC<Props> = ({ adType, price, selectedDates }) => {
  const adTypeContracts = adType === "BANNER" ? BANNER_ADVERTISEMENT : HERO_ADVERTISEMENT;
  const adContractAddress = adTypeContracts[ADVERTISEMENT_CHAIN.slug as keyof typeof adTypeContracts] || "";
  const { popNotification } = useContext(NotificationContext);
  const { updateActiveChain } = useContext(ActiveChainContext);
  useEffect(() => {
    void updateActiveChain(ADVERTISEMENT_CHAIN.slug);
  }, [updateActiveChain]);
  const storage = useStorage();
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [resalePrice, setResalePrice] = useState<string>("");

  const { data: royalty } = api.advertisement.getRoyalty.useQuery({
    adType,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Ad Media</span>
          </label>
          <div className={`${adType === 'HERO' ? 'aspect-video' : 'h-16'}`}>
            <Upload
              initialUrls={[]}
              callback={(urls) => setMediaUrl(urls[0] || "")}
              objectCover={true}
              height={'h-full'}
            />
          </div>
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Click through URL</span>
          </label>
          <input
            type="text"
            placeholder="Click through url"
            className="input input-lg input-bordered w-full"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Resale Price</span>
          </label>
          <input
            type="text"
            placeholder="0.001 ETH"
            className="input input-lg input-bordered w-full"
            value={resalePrice}
            onChange={(e) => setResalePrice(e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt"></span>
            <span className="label-text-alt flex items-center gap-1">
              If someone bought out one of your ad slot days, what would they need to pay you?
              <div className="tooltip tooltip-left cursor-pointer" data-tip={`${MARKETPLACE_NAME} takes a ${royalty || ""}% royalty on ad space resales`}>
                <QuestionMarkCircleIcon className="h-4 w-4 stroke-2" />
              </div>
            </span>
          </label>
        </div>

        <Web3Button
          type="button"
          contractAddress={adContractAddress}
          action={async (contract) => {
            if (!storage) {
              popNotification({
                title: "Error",
                description: "Could not connect to IPFS.",
                type: "error",
              });
              return;
            }
            // upload contentURI metadata to IPFS
            const metadata = {
              media: mediaUrl,
              link,
            }
            const contentURI = await storage.upload(metadata);
            // create ad
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const tx = await contract.call(
              "buyAdSpace",
              [
                selectedDates.map((date) => getDayId(date)),
                selectedDates.map(() => contentURI),
                selectedDates.map(() => ethers.utils.parseEther(resalePrice)),
                price.toString(),
              ],
              {
                value: price.toString(),
              }
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const hash = tx.receipt.transactionHash as string;
            popNotification({
              title: "Success",
              description: "Ad created successfully!",
              type: "success",
              actions: [{
                label: `View on Etherscan ${ADVERTISEMENT_CHAIN.explorers[0].name}`,
                link: `${ADVERTISEMENT_CHAIN.explorers[0].url}/tx/${hash}`,
                onClick: () => {
                  window.open(`${ADVERTISEMENT_CHAIN.explorers[0].url}/tx/${hash}`, "_blank");
                }
              }]
            });
            // reset the form
            setMediaUrl("");
            setLink("");
            setResalePrice("");
          }}
          className="thirdweb-btn-primary"
          onError={(error) => {
            console.error({ error });
            const e = error as TransactionError;
            popNotification({
              title: "Error",
              description: e.reason || error.message,
              type: "error",
            });
          }}
        >
          Create Ad ({ethers.utils.formatEther(price).toString()} {ADVERTISEMENT_CHAIN.nativeCurrency.symbol})
        </Web3Button>
      </div>
    </div>
  )
}

export default AdvertisementForm;
