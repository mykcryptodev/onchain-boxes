import { EllipsisHorizontalCircleIcon, FlagIcon, PencilIcon } from "@heroicons/react/24/outline";
import { MediaRenderer, useAddress } from "@thirdweb-dev/react";
import { isAddress } from "ethers/lib/utils";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { type FC,useEffect, useMemo, useState } from "react";

import ContestList from "~/components/Contest/List";
import CensoredContent from "~/components/Report/CensoredContent";
import CreateReport from "~/components/Report/Create";
import ActiveChainContext from "~/context/ActiveChain";
import ChainSelector from "~/components/utils/ChainSelector";
import DiscordIcon from "~/components/utils/icons/Discord";
import BlockchainExplorerIcon from "~/components/utils/icons/Etherscan";
import TwitterIcon from "~/components/utils/icons/Twitter";
import ShareButton from "~/components/utils/ShareButton";
import useContentIsCensored from "~/hooks/useContentIsCensored";
import useShortenedAddress from "~/hooks/useShortenedAddress";
import { api } from "~/utils/api";

export const Profile: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const addressOrName = router.query.id as string;
  // check if the url is an address or name
  const addressIsInUrl = isAddress(addressOrName);
  const address = useMemo(() => {
    if (addressIsInUrl) return addressOrName;
    return undefined;
  }, [addressIsInUrl, addressOrName]);
  const { data: profile, isLoading: profileIsLoading } = api.profile.getByAddressOrName.useQuery(
    addressOrName?.replace(/_/g, " ") || ""
  );
  // update the url of the page to the name if it exists
  useEffect(() => {
    if (!profileIsLoading && profile && profile.name && window) {
      const profileSlug = profile.name.replaceAll(' ', '_');
      if (window.location.pathname !== `/profile/${profileSlug}`) {  // Only update if the URL doesn't already match the profile name
        const newPath = `/profile/${profileSlug}`;
        void router.replace(newPath);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, profileIsLoading]);
  const { data: isCensored, isLoading: isCensoredIsLoading } = useContentIsCensored(profile?.id || "", "profile");
  const [proceedToCensoredContent, setProceedToCensoredContent] = useState<boolean>(false);
  const { shortenedAddress } = useShortenedAddress(profile?.id || address);
  const connectedAddress = useAddress();
  const { activeChainData } = useContext(ActiveChainContext);
  const isUserProfile = 
    connectedAddress?.toLowerCase() === profile?.userId.toLowerCase() || 
    connectedAddress?.toLowerCase() === address?.toLowerCase();

  const tabs = ["Contests Played"];
  const [activeTab, setActiveTab] = useState<string>("Contests Played");

  if ((profileIsLoading || isCensoredIsLoading) && !profile) return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-96 bg-base-200 animate-pulse rounded-none xl:rounded-lg" />
      <div className="grid grid-cols-12 mx-2 relative bottom-20">
        <div className="col-span-0 lg:col-span-1" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex justify-between items-end">
            <div className="w-48 h-48 mx-auto lg:mx-0 -top-20 bg-base-200 animate-pulse rounded-lg" />
          </div>
          <div className="h-16 lg:w-2/6 w-4/6 rounded-lg text-lg flex lg:mx-0 mx-auto my-4 bg-base-200 animate-pulse" />
          <div className="h-6 w-3/6 rounded-lg text-lg lg:mx-0 mx-auto my-4 bg-base-200 animate-pulse" />
          <div className="h-6 w-5/6 rounded-lg text-lg lg:mx-0 mx-auto text-center my-4 bg-base-200 animate-pulse" />
          <div className="h-6 w-4/6 rounded-lg text-lg lg:mx-0 mx-auto text-center my-4 bg-base-200 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (isCensored && !proceedToCensoredContent && profile) {
    return <CensoredContent profile={profile} onProceed={() => setProceedToCensoredContent(true)} />
  }

  const Links: FC<{ className?: string }> = ({ className }) => (
    <div className={className || "items-center gap-6 flex"}>
      <Link href={`${activeChainData.explorers?.[0]?.url ?? 'https://etherscan.io'}/address/${profile?.userId || addressOrName}`} className="flex items-center gap-2">
        <BlockchainExplorerIcon height="32" width="32" />
      </Link>
      {profile?.twitter && (
        <Link href={`https://twitter.com/${profile?.twitter}`} className="flex items-center gap-2">
          <TwitterIcon height="32" width="32" />
        </Link>
      )}
      {profile?.discord && (
        <Link href={`https://discord.gg/${profile?.discord}`} className="flex items-center gap-2">
          <DiscordIcon height="42" width="42" />
        </Link>
      )}
      <ShareButton />
      <div className="dropdown z-10">
        <label tabIndex={0} className="cursor-pointer">
          <EllipsisHorizontalCircleIcon className="h-10 w-10 stroke-2" />
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box text-lg font-bold">
          {(isUserProfile || session?.user.isAdmin) && (
            <li>
              <Link href={`/profile/${profile?.userId || addressOrName}/edit`} className="flex items-center gap-2">
                <PencilIcon className="w-5 h-5 stroke-2" />
                <span>Edit</span>
              </Link>
            </li>
          )}
          {profile && (
            <li>
              <CreateReport profile={profile} className="flex items-center gap-2">
                <FlagIcon className="w-5 h-5 stroke-2" /> Report
              </CreateReport>
            </li>
          )}
        </ul>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2 relative">
      {profile?.banner?.startsWith("ipfs://") ? (
        <MediaRenderer
          src={profile?.banner}
          className="w-full aspect-video object-cover rounded-none xl:rounded-lg"
          style={{ objectFit: "cover", width: "100%", height: "auto", maxHeight: "24rem", aspectRatio: "16/9" }}
        />
      ) : (
        <Image
          src={profile?.banner || "/images/hero-bg.svg"}
          width={1200}
          height={400}
          className="w-full aspect-video max-h-96 object-cover rounded-none xl:rounded-lg"
          alt="Banner Image"
        />
      )}
      <div className="grid grid-cols-12 mx-2 relative bottom-20">
        <div className="col-span-0 lg:col-span-1" />
        <div className="col-span-12 lg:col-span-10">
          <div className="flex justify-between items-end">
            <div className="w-48 h-48 mx-auto lg:mx-0 -top-20">
              {profile?.img?.startsWith("ipfs://") ? (
                <MediaRenderer
                  src={profile?.img}
                  className="w-full h-96 rounded-lg object-cover"
                  style={{ objectFit: "cover", width: "100%", height: "12rem" }}
                />
              ) : (
                <Image
                  src={profile?.img || "/images/logo.png"}
                  width={1200}
                  height={400}
                  className="w-full rounded-lg object-cover bg-base-100"
                  alt="Logo Image"
                />
              )}
            </div>
            <Links className="lg:flex hidden gap-6" />
          </div>
          <div className="relative w-full rounded-lg text-6xl font-bold lg:text-start text-center my-4">
            {profile?.name || shortenedAddress}
          </div>
          <div className="relative w-full rounded-lg text-lg lg:text-start text-center my-4">
            {profile?.bio || ""}
          </div>
          <Links className="lg:hidden flex w-full justify-center gap-6 my-6" />
        </div>
      </div>
      <div className="grid grid-cols-12 mx-2 relative bottom-20">
        <div className="col-span-0 lg:col-span-1" />
        <div className="col-span-12 lg:col-span-0 lg:hidden grid place-content-center mb-2">
          <ChainSelector />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <div className="w-full flex justify-center lg:justify-normal">
            <div className="tabs sm:tabs-lg tabs-sm tabs-bordered  flex flex-nowrap overflow-x-auto sm:my-0 my-4">
              {tabs.map((tab) => (
                <a
                  key={tab}
                  className={`tab whitespace-nowrap ${activeTab === tab ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-0 lg:col-span-5 hidden lg:grid place-content-end">
          <ChainSelector />
        </div>
        <div className="col-span-0 lg:col-span-1" />
        <div className="col-span-10 col-start-2">
          {activeTab === "Contests Played" && <ContestList withUser={profile?.userId} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;